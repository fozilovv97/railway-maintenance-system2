import { ClipboardList, Plus, Search, CheckCircle, Clock, Wrench, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const workOrders = [
  { id: "НЗ-2026-0143", loco: "ЧС7-031", desc: "Замена тормозных колодок", type: "Плановое", priority: "normal", status: "completed", tech: "Иванов А.В.", created: "10.02.2026", closed: "12.02.2026" },
  { id: "НЗ-2026-0144", loco: "ВЛ80С-1201", desc: "Ревизия тяговых двигателей", type: "Плановое", priority: "high", status: "in_progress", tech: "Петров С.Н.", created: "15.02.2026", closed: "—" },
  { id: "НЗ-2026-0145", loco: "ЭП1-022", desc: "Устранение утечки масла из редуктора", type: "Внеплановое", priority: "high", status: "pending", tech: "Сидоров К.П.", created: "17.02.2026", closed: "—" },
  { id: "НЗ-2026-0146", loco: "2ТЭ116-1590", desc: "Диагностика ходовой части", type: "Плановое", priority: "normal", status: "in_progress", tech: "Козлов Д.А.", created: "17.02.2026", closed: "—" },
  { id: "НЗ-2026-0147", loco: "ВЛ80Т-0987", desc: "Замена секции тягового трансформатора", type: "Ремонтное", priority: "critical", status: "pending", tech: "Новиков В.Р.", created: "18.02.2026", closed: "—" },
  { id: "НЗ-2026-0148", loco: "ЧС8-023", desc: "Проверка токоприёмников", type: "Плановое", priority: "low", status: "completed", tech: "Морозов Е.Г.", created: "05.02.2026", closed: "07.02.2026" },
  { id: "НЗ-2026-0149", loco: "ВЛ10-845", desc: "Капитальный ремонт кузова", type: "Ремонтное", priority: "high", status: "in_progress", tech: "Новиков В.Р.", created: "01.02.2026", closed: "—" },
  { id: "НЗ-2026-0150", loco: "ЭП20-012", desc: "Регулировка тормозной системы", type: "Плановое", priority: "normal", status: "completed", tech: "Иванов А.В.", created: "14.02.2026", closed: "14.02.2026" },
]

const statusConfig: Record<string, { label: string; icon: React.ElementType; class: string }> = {
  completed: { label: "Выполнен", icon: CheckCircle, class: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
  in_progress: { label: "В работе", icon: Wrench, class: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  pending: { label: "Ожидание", icon: Clock, class: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  overdue: { label: "Просрочен", icon: AlertTriangle, class: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
}

const priorityConfig: Record<string, { label: string; class: string }> = {
  critical: { label: "Критический", class: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  high: { label: "Высокий", class: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
  normal: { label: "Обычный", class: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
  low: { label: "Низкий", class: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
}

export default function WorkOrdersPage() {
  const counts = {
    total: workOrders.length,
    pending: workOrders.filter(w => w.status === "pending").length,
    in_progress: workOrders.filter(w => w.status === "in_progress").length,
    completed: workOrders.filter(w => w.status === "completed").length,
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Наряд-заказы</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Управление заданиями на техническое обслуживание</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Создать наряд
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        <div className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">Всего:</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{counts.total}</span>
        </div>
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-700 dark:text-amber-400">В работе: {counts.in_progress}</span>
        </div>
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700 dark:text-blue-400">Ожидание: {counts.pending}</span>
        </div>
        <div className="px-4 py-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700 dark:text-green-400">Выполнено: {counts.completed}</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Поиск по номеру или локомотиву..." className="pl-9" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              {["Номер НЗ", "Локомотив", "Описание работ", "Тип", "Приоритет", "Исполнитель", "Создан", "Закрыт", "Статус"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {workOrders.map((wo) => {
              const status = statusConfig[wo.status]
              const priority = priorityConfig[wo.priority]
              return (
                <tr key={wo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <td className="px-5 py-4 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{wo.id}</td>
                  <td className="px-5 py-4 text-sm font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">{wo.loco}</td>
                  <td className="px-5 py-4 text-sm text-gray-900 dark:text-white max-w-[220px]">
                    <span className="line-clamp-2">{wo.desc}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{wo.type}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priority.class}`}>
                      {priority.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{wo.tech}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{wo.created}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{wo.closed}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${status.class}`}>
                      <status.icon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
