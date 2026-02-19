import { Train, Search, Filter, Plus, CheckCircle, Wrench, AlertTriangle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const locomotives = [
  { id: "ЧС7-042", type: "Пассажирский", series: "ЧС7", depot: "Локомотивное депо Москва-Пасс.", status: "operational", mileage: "1 248 300", nextMaint: "21.02.2026", lastMaint: "10.01.2026" },
  { id: "ВЛ80С-1243", type: "Грузовой", series: "ВЛ80С", depot: "ТЧЭ-1 Лихоборы", status: "maintenance", mileage: "2 104 780", nextMaint: "23.02.2026", lastMaint: "15.12.2025" },
  { id: "ЭП1-014", type: "Пассажирский", series: "ЭП1", depot: "Локомотивное депо Москва-Пасс.", status: "operational", mileage: "876 450", nextMaint: "25.02.2026", lastMaint: "20.01.2026" },
  { id: "2ТЭ116-1567", type: "Грузовой", series: "2ТЭ116", depot: "ТЧЭ-3 Сортировочная", status: "operational", mileage: "3 456 200", nextMaint: "26.02.2026", lastMaint: "05.02.2026" },
  { id: "ВЛ10-845", type: "Грузовой", series: "ВЛ10", depot: "ТЧЭ-1 Лихоборы", status: "repair", mileage: "4 780 100", nextMaint: "28.02.2026", lastMaint: "01.11.2025" },
  { id: "ЧС8-023", type: "Пассажирский", series: "ЧС8", depot: "Локомотивное депо Москва-Пасс.", status: "operational", mileage: "987 650", nextMaint: "02.03.2026", lastMaint: "18.01.2026" },
  { id: "ВЛ80Т-0987", type: "Грузовой", series: "ВЛ80Т", depot: "ТЧЭ-3 Сортировочная", status: "out_of_service", mileage: "5 120 300", nextMaint: "—", lastMaint: "01.09.2025" },
  { id: "ЭП20-012", type: "Пассажирский", series: "ЭП20", depot: "Локомотивное депо Москва-Пасс.", status: "operational", mileage: "345 890", nextMaint: "03.03.2026", lastMaint: "25.01.2026" },
  { id: "2ТЭ25КМ-0345", type: "Грузовой", series: "2ТЭ25КМ", depot: "ТЧЭ-3 Сортировочная", status: "maintenance", mileage: "678 400", nextMaint: "04.03.2026", lastMaint: "10.02.2026" },
  { id: "ВЛ85-001", type: "Грузовой", series: "ВЛ85", depot: "ТЧЭ-1 Лихоборы", status: "operational", mileage: "1 890 760", nextMaint: "05.03.2026", lastMaint: "30.01.2026" },
]

const statusConfig: Record<string, { label: string; icon: React.ElementType; class: string }> = {
  operational: {
    label: "В эксплуатации",
    icon: CheckCircle,
    class: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  },
  maintenance: {
    label: "На ТО",
    icon: Wrench,
    class: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  repair: {
    label: "Ремонт",
    icon: AlertTriangle,
    class: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  },
  out_of_service: {
    label: "Выведен",
    icon: XCircle,
    class: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
}

export default function LocomotivesPage() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Локомотивы</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Управление тяговым парком</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Добавить локомотив
        </Button>
      </div>

      {/* Status summary */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const count = locomotives.filter((l) => l.status === key).length
          return (
            <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${cfg.class}`}>
              <cfg.icon className="w-3.5 h-3.5" />
              {cfg.label}: {count}
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Поиск по номеру или серии..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Фильтры
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Номер / Серия
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Тип
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Депо
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Пробег, км
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Статус
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                След. ТО
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {locomotives.map((loco) => {
              const status = statusConfig[loco.status]
              return (
                <tr key={loco.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                        <Train className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{loco.id}</p>
                        <p className="text-xs text-gray-500">{loco.series}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{loco.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-[200px] truncate">{loco.depot}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">{loco.mileage}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.class}`}>
                      <status.icon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{loco.nextMaint}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
