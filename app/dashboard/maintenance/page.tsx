"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useSections } from "@/lib/use-sections"
import {
  Calendar, Wrench, CheckCircle, Clock, AlertTriangle,
  BarChart3, List, ChevronLeft, ChevronRight, Info, Plus, X, ChevronDown
} from "lucide-react"

/* ═══════════════════════════════════════
   ДАННЫЕ
═══════════════════════════════════════ */
type Status = "upcoming" | "in_progress" | "completed" | "overdue"
type ScheduleItem = {
  id: string
  unit: string       // локомотив или вагон
  type: string
  startDate: string  // ДД.ММ.ГГГГ
  durationH: number  // часов
  depot: string
  tech: string
  status: Status
  note?: string
}


/* ═══════════════════════════════════════
   КОНФИГУРАЦИЯ ТИПОВ И СТАТУСОВ
═══════════════════════════════════════ */
const typeConfig: Record<string, { color: string; bar: string; text: string; border: string }> = {
  "ТО-1": { color:"#60a5fa", bar:"bg-blue-400",   text:"text-blue-700 dark:text-blue-300",   border:"border-blue-300" },
  "ТО-2": { color:"#3b82f6", bar:"bg-blue-500",   text:"text-blue-700 dark:text-blue-300",   border:"border-blue-400" },
  "ТО-3": { color:"#8b5cf6", bar:"bg-purple-500", text:"text-purple-700 dark:text-purple-300",border:"border-purple-400" },
  "ТР-1": { color:"#f59e0b", bar:"bg-amber-500",  text:"text-amber-700 dark:text-amber-300", border:"border-amber-400" },
  "ТР-2": { color:"#f97316", bar:"bg-orange-500", text:"text-orange-700 dark:text-orange-300",border:"border-orange-400" },
  "ТР-3": { color:"#ef4444", bar:"bg-red-500",    text:"text-red-700 dark:text-red-300",     border:"border-red-400" },
  "СР":   { color:"#dc2626", bar:"bg-red-600",    text:"text-red-700 dark:text-red-300",     border:"border-red-500" },
  "КР":   { color:"#991b1b", bar:"bg-red-800",    text:"text-red-800 dark:text-red-200",     border:"border-red-700" },
  "ВНП":  { color:"#6b7280", bar:"bg-gray-500",   text:"text-gray-700 dark:text-gray-300",   border:"border-gray-400" },
}

const statusConfig: Record<Status, { label: string; icon: React.ElementType; cls: string; dot: string }> = {
  upcoming:    { label:"Запланировано", icon:Clock,         cls:"bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",        dot:"bg-gray-400" },
  in_progress: { label:"Выполняется",  icon:Wrench,        cls:"bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",     dot:"bg-amber-500" },
  completed:   { label:"Выполнено",    icon:CheckCircle,   cls:"bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",     dot:"bg-green-500" },
  overdue:     { label:"Просрочено",   icon:AlertTriangle, cls:"bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",             dot:"bg-red-500" },
}

/* ═══════════════════════════════════════
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
═══════════════════════════════════════ */
function parseDate(d: string): Date {
  const [day, month, year] = d.split(".").map(Number)
  return new Date(year, month - 1, day)
}
function formatDateShort(d: Date): string {
  return d.getDate().toString().padStart(2,"0") + "." + (d.getMonth()+1).toString().padStart(2,"0")
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}
function diffDays(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86400000)
}
function durationDays(h: number): number {
  return Math.max(0.5, h / 24)
}

/* ═══════════════════════════════════════
   КОМПОНЕНТ ДИАГРАММЫ ГАНТА
═══════════════════════════════════════ */
function GanttChart({ items, rangeStart, rangeDays, onCreateOrder }: {
  items: ScheduleItem[]
  rangeStart: Date
  rangeDays: number
  onCreateOrder?: (unit: string, section: string) => void
}) {
  const today = new Date(2026, 1, 19) // 19.02.2026
  const todayOffset = diffDays(rangeStart, today)
  const todayPct = (todayOffset / rangeDays) * 100

  // Заголовок с днями (показываем каждые 3-4 дня)
  const headerDates: Date[] = []
  for (let i = 0; i <= rangeDays; i += 3) {
    headerDates.push(addDays(rangeStart, i))
  }

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: "900px" }}>
        {/* Шкала дат */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2 mb-1 ml-[200px] relative select-none">
          {headerDates.map((d, i) => (
            <div key={i}
              style={{ left: `${(diffDays(rangeStart, d) / rangeDays) * 100}%` }}
              className="absolute text-[10px] text-gray-400 -translate-x-1/2 whitespace-nowrap">
              {formatDateShort(d)}
            </div>
          ))}
          <div className="h-4 w-full"/>
        </div>

        {/* Сетка и строки */}
        <div className="space-y-1">
          {items.map((item) => {
            const start  = parseDate(item.startDate)
            const days   = durationDays(item.durationH)
            const left   = (diffDays(rangeStart, start) / rangeDays) * 100
            const width  = (days / rangeDays) * 100
            const cfg    = typeConfig[item.type] ?? typeConfig["ВНП"]
            const st     = statusConfig[item.status]
            const isIP   = item.status === "in_progress"
            const isDone = item.status === "completed"
            const isOver = item.status === "overdue"

            return (
              <div key={item.id} className="flex items-center group">
                {/* Название + кнопка создания наряда */}
                <div className="w-[200px] flex-shrink-0 pr-3 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`}/>
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate flex-1">{item.unit}</span>
                  {onCreateOrder && (
                    <button
                      title="Создать наряд-задание"
                      onClick={() => onCreateOrder(item.unit, item.depot)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-0.5 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400">
                      <Plus className="w-3 h-3"/>
                    </button>
                  )}
                </div>

                {/* Полоса Ганта */}
                <div className="flex-1 relative h-8 rounded bg-gray-50 dark:bg-gray-800/50">
                  {/* Вертикальные сетки */}
                  {headerDates.map((d, i) => (
                    <div key={i}
                      style={{ left: `${(diffDays(rangeStart, d) / rangeDays) * 100}%` }}
                      className="absolute top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-700/60"/>
                  ))}

                  {/* Линия «Сегодня» */}
                  {todayPct >= 0 && todayPct <= 100 && (
                    <div style={{ left: `${todayPct}%` }}
                      className="absolute top-0 bottom-0 w-0.5 bg-red-400/70 z-10"/>
                  )}

                  {/* Бар */}
                  <div
                    style={{
                      left:  `${Math.max(0, left)}%`,
                      width: `${Math.min(width, 100 - Math.max(0, left))}%`,
                      backgroundColor: cfg.color,
                      opacity: isDone ? 0.55 : isOver ? 0.75 : 1,
                    }}
                    className={`absolute top-1 bottom-1 rounded-md flex items-center overflow-hidden
                      shadow-sm transition-all group-hover:brightness-110 cursor-pointer
                      ${isIP ? "ring-2 ring-white ring-inset" : ""}
                    `}
                  >
                    {/* Прогресс-полоска для in_progress */}
                    {isIP && (
                      <div
                        style={{ width: `${Math.min(((todayPct - Math.max(0, left)) / width) * 100, 100)}%` }}
                        className="absolute left-0 top-0 bottom-0 bg-white/20 rounded-l-md"/>
                    )}
                    <span className="px-2 text-[10px] font-bold text-white truncate leading-none select-none">
                      {item.type}
                      {item.durationH >= 24 && <span className="ml-1 font-normal opacity-80">{item.durationH}ч</span>}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Легенда «Сегодня» */}
        {todayPct >= 0 && todayPct <= 100 && (
          <div className="flex items-center gap-1.5 mt-3 ml-[200px] text-xs text-red-500">
            <div className="w-3 h-0.5 bg-red-400"/>
            <span>Сегодня — 19.02.2026</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   QUICK ORDER MODAL  (без выхода со страницы)
═══════════════════════════════════════ */

function genOrderId(): string {
  const now = new Date()
  const y  = now.getFullYear()
  const mo = String(now.getMonth() + 1).padStart(2, "0")
  const d  = String(now.getDate()).padStart(2, "0")
  const h  = String(now.getHours()).padStart(2, "0")
  const mi = String(now.getMinutes()).padStart(2, "0")
  const s  = String(now.getSeconds()).padStart(2, "0")
  return `НЗ-${y}${mo}${d}-${h}${mi}${s}`
}

function QuickOrderModal({ item, onClose, sections }: {
  item: ScheduleItem
  onClose: () => void
  sections: string[]
}) {
  const [section,   setSection]   = useState(item.depot || "")
  const [priority,  setPriority]  = useState("normal")
  const [note,      setNote]      = useState("")
  const [saved,     setSaved]     = useState(false)
  const [orderId,   setOrderId]   = useState("")
  const [error,     setError]     = useState("")

  const handleSend = async () => {
    if (!section) { setError("Выберите участок для отправки наряда"); return }
    setError("")
    const id = genOrderId()
    const row = {
      id,
      unit_type:    "locomotive",
      unit:          item.unit,
      depot:         section,
      section:       section,
      equipment:     item.unit.split(/[-\s]/)[0] ?? item.unit,
      work_type:     "Плановое",
      repair_kind:   item.type,
      status:        "pending",
      priority,
      tech:          "",
      chief:         "",
      description:   `${item.type} — плановое техническое обслуживание`,
      note:          note || "",
      created:       new Date().toLocaleDateString("ru-RU"),
      closed:        "—",
      repair_items:  [],
      date_start:    item.startDate,
      date_end:      "",
    }
    await supabase.from("work_orders").insert(row)
    setOrderId(id)
    setSaved(true)
  }

  const selCls = "w-full appearance-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">

        {/* Заголовок */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Plus className="w-5 h-5"/>
            </div>
            <div>
              <p className="text-xs text-blue-200 font-medium">Открыть наряд-задание по графику</p>
              <p className="text-base font-bold">{item.unit} · {item.type}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {saved ? (
          /* ── Успех ── */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500"/>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">Наряд открыт!</p>
              <p className="text-sm text-gray-500 mt-1">
                Номер: <span className="font-mono font-bold text-blue-600">{orderId}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Участок: <span className="font-semibold text-gray-700 dark:text-gray-300">{section}</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Наряд появится в разделе «Запланировано» для выбранного участка.
              </p>
            </div>
            <button onClick={onClose}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
              Готово
            </button>
          </div>
        ) : (
          <>
            {/* Тело */}
            <div className="p-6 space-y-5">

              {/* Данные из графика (read-only) */}
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Данные из графика ТО</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs block">Единица ТПС</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{item.unit}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">Вид ремонта</span>
                    <p className="font-bold text-blue-600 dark:text-blue-400">{item.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">Дата начала</span>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{item.startDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">Длительность</span>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{item.durationH} ч</p>
                  </div>
                </div>
              </div>

              {/* Выбор участка — обязательно */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Участок <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={section}
                    onChange={e => { setSection(e.target.value); setError("") }}
                    className={`${selCls} ${error ? "border-red-400 focus:ring-red-400" : ""}`}>
                    <option value="">Выберите участок...</option>
                    {sections.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                </div>
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
              </div>

              {/* Приоритет */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Приоритет</label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    ["low",      "Низкий",     "text-gray-600 bg-gray-100 dark:bg-gray-800"],
                    ["normal",   "Обычный",    "text-blue-700 bg-blue-100 dark:bg-blue-950"],
                    ["high",     "Высокий",    "text-amber-700 bg-amber-100 dark:bg-amber-950"],
                    ["critical", "Критич.",    "text-red-700 bg-red-100 dark:bg-red-950"],
                  ] as [string,string,string][]).map(([v,l,cls]) => (
                    <button key={v} onClick={() => setPriority(v)}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all border-2 ${
                        priority === v
                          ? cls + " border-current"
                          : "border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300"
                      }`}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Примечание */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Примечание <span className="text-gray-400 font-normal">(необязательно)</span>
                </label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                  placeholder="Особые указания для участка..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
            </div>

            {/* Подвал */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-gray-400">
                Статус: <span className="font-semibold text-gray-600 dark:text-gray-300">Запланировано</span>
              </p>
              <div className="flex gap-3">
                <button onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Отмена
                </button>
                <button onClick={handleSend}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm">
                  <Plus className="w-4 h-4"/> Открыть на участок
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   СТРАНИЦА
═══════════════════════════════════════ */
// Конвертация строки work_orders → ScheduleItem
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function woToSchedule(r: any): ScheduleItem {
  const woStatus: Record<string, Status> = {
    pending:     "upcoming",
    in_progress: "in_progress",
    completed:   "completed",
  }
  // date_start хранится как ДД.ММ.ГГГГ или пусто — если пусто, берём сегодня
  const today = new Date()
  const todayStr = [
    String(today.getDate()).padStart(2,"0"),
    String(today.getMonth()+1).padStart(2,"0"),
    today.getFullYear(),
  ].join(".")
  return {
    id:        r.id,
    unit:      r.unit,
    type:      r.repair_kind || r.work_type || "ТО",
    startDate: r.date_start || todayStr,
    durationH: 8,
    depot:     r.section || r.depot || "",
    tech:      r.tech || "",
    status:    woStatus[r.status] ?? "upcoming",
    note:      r.note || undefined,
  }
}

export default function MaintenancePage() {
  const [schedule,  setSchedule]  = useState<ScheduleItem[]>([])
  const [loading,   setLoading]   = useState(true)
  const [view, setView]           = useState<"gantt"|"table">("gantt")
  const [filter, setFilter]       = useState<Status|"all">("all")
  const [monthOffset, setMonthOffset] = useState(0)
  const [quickItem, setQuickItem] = useState<ScheduleItem|null>(null)

  // Загрузка нарядов из Supabase для отображения в графике
  const fetchSchedule = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("work_orders")
      .select("id,unit,repair_kind,work_type,date_start,section,depot,tech,status,note")
      .order("date_start", { ascending: true })
    setSchedule(data ? data.map(woToSchedule) : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchSchedule() }, [fetchSchedule])

  // Открыть QuickOrderModal прямо на странице
  const handleCreateOrder = (unit: string, _section: string) => {
    const found = schedule.find(s => s.unit === unit)
    if (found) setQuickItem(found)
  }

  // Диапазон: текущий месяц
  const now         = new Date()
  const today       = now
  const rangeStart  = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const rangeEnd    = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0)
  const rangeDays   = diffDays(rangeStart, rangeEnd) + 1

  const monthNames  = ["Январь","Февраль","Март","Апрель","Май","Июнь",
                       "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"]
  const monthLabel  = monthNames[rangeStart.getMonth()] + " " + rangeStart.getFullYear()

  // Участки из справочника (БД)
  const { sections: sectionsFromDb } = useSections()
  const qSections = sectionsFromDb.length > 0 ? sectionsFromDb : [...new Set(schedule.map(s => s.depot).filter(Boolean))].sort()

  // Фильтрация — показываем элементы, пересекающиеся с диапазоном
  const visible = schedule.filter(item => {
    if (!item.startDate) return false
    try {
      const s = parseDate(item.startDate)
      const e = addDays(s, durationDays(item.durationH))
      const inRange = s <= rangeEnd && e >= rangeStart
      return inRange && (filter === "all" || item.status === filter)
    } catch { return false }
  })

  const counts = {
    all:         schedule.length,
    upcoming:    schedule.filter(s => s.status === "upcoming").length,
    in_progress: schedule.filter(s => s.status === "in_progress").length,
    completed:   schedule.filter(s => s.status === "completed").length,
    overdue:     schedule.filter(s => s.status === "overdue").length,
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96 text-gray-400 text-sm gap-3">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
      Загрузка графика...
    </div>
  )

  return (
    <div className="p-8 space-y-6">
      {quickItem && (
        <QuickOrderModal item={quickItem} onClose={() => setQuickItem(null)} sections={qSections}/>
      )}

      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ТО и ремонты</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Визуальный график технического обслуживания парка</p>
        </div>
        {/* Переключение вида */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl gap-1">
          <button onClick={() => setView("gantt")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view==="gantt" ? "bg-white dark:bg-gray-900 text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            <BarChart3 className="w-4 h-4"/> Диаграмма Ганта
          </button>
          <button onClick={() => setView("table")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view==="table" ? "bg-white dark:bg-gray-900 text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            <List className="w-4 h-4"/> Список
          </button>
        </div>
      </div>

      {/* KPI карточки */}
      <div className="grid grid-cols-4 gap-4">
        {(["upcoming","in_progress","completed","overdue"] as Status[]).map(s => {
          const cfg = statusConfig[s]
          const count = counts[s]
          const pct = Math.round((count / counts.all) * 100)
          return (
            <button key={s} onClick={() => setFilter(filter===s ? "all" : s)}
              className={`text-left p-5 rounded-2xl border-2 transition-all ${
                filter===s
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 shadow-md"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-300"
              }`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.cls}`}>
                  <cfg.icon className="w-4 h-4"/>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{count}</span>
              </div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{cfg.label}</p>
              <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${cfg.cls.split(" ")[0].replace("bg-","bg-").replace("-100","-500").replace("-950","-500")}`}
                  style={{ width: `${pct}%` }}/>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{pct}% от всех</p>
            </button>
          )
        })}
      </div>

      {/* Легенда типов ремонта */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-400 mr-1">Виды работ:</span>
        {Object.entries(typeConfig).map(([type, cfg]) => (
          <span key={type}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.text} ${cfg.border} bg-white dark:bg-gray-900`}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }}/>
            {type}
          </span>
        ))}
      </div>

      {/* ДИАГРАММА ГАНТА */}
      {view === "gantt" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Шапка с навигацией по месяцам */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-blue-500"/>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">{monthLabel}</h2>
              <span className="text-xs text-gray-400">· {visible.length} позиций</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMonthOffset(o => o-1)}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-500"/>
              </button>
              <button onClick={() => setMonthOffset(0)}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-200 transition-colors">
                Сегодня
              </button>
              <button onClick={() => setMonthOffset(o => o+1)}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-500"/>
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Calendar className="w-12 h-12 opacity-20 mb-3"/>
                <p className="text-sm font-medium">Нет работ в этом периоде</p>
                <p className="text-xs mt-1">Измените фильтр или перейдите к другому месяцу</p>
              </div>
            ) : (
              <GanttChart items={visible} rangeStart={rangeStart} rangeDays={rangeDays} onCreateOrder={handleCreateOrder}/>
            )}
          </div>
        </div>
      )}

      {/* ТАБЛИЧНЫЙ ВИД */}
      {view === "table" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-3">
            <List className="w-4 h-4 text-blue-500"/>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Список работ</h2>
            <span className="text-xs text-gray-400">· {visible.length} позиций</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                {["Ед.ТПС","Вид ТО","Дата начала","Длит.(ч)","Депо","Исполнитель","Статус","Действие"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {visible.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">Нет данных</td></tr>
              )}
              {visible.map(item => {
                const st  = statusConfig[item.status]
                const cfg = typeConfig[item.type] ?? typeConfig["ВНП"]
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.unit}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${cfg.text} ${cfg.border} bg-white dark:bg-gray-900`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{item.startDate}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{item.durationH} ч</td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{item.depot}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{item.tech}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${st.cls}`}>
                        <st.icon className="w-3 h-3"/>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleCreateOrder(item.unit, item.depot)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors whitespace-nowrap border border-blue-200 dark:border-blue-800">
                        <Plus className="w-3 h-3"/> Наряд
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Подсказка */}
      <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"/>
        <span>
          Нажмите на KPI-карточку чтобы отфильтровать по статусу.
          Красная вертикальная линия на диаграмме — текущая дата.
          Полупрозрачная заливка внутри полосы «В работе» показывает прогресс выполнения.
        </span>
      </div>

    </div>
  )
}
