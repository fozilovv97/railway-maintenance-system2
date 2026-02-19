import { Calendar, Wrench, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const schedule = [
  { id: "ЧС7-042", type: "ТО-2", plannedDate: "21.02.2026", duration: "8 ч", depot: "Москва-Пасс.", tech: "Иванов А.В.", status: "upcoming" },
  { id: "ВЛ80С-1243", type: "ТР-1", plannedDate: "23.02.2026", duration: "72 ч", depot: "ТЧЭ-1 Лихоборы", tech: "Петров С.Н.", status: "upcoming" },
  { id: "ЭП1-014", type: "ТО-3", plannedDate: "25.02.2026", duration: "24 ч", depot: "Москва-Пасс.", tech: "Сидоров К.П.", status: "upcoming" },
  { id: "2ТЭ116-1567", type: "ТО-2", plannedDate: "26.02.2026", duration: "8 ч", depot: "ТЧЭ-3 Сортировочная", tech: "Козлов Д.А.", status: "upcoming" },
  { id: "ВЛ10-845", type: "КР", plannedDate: "28.02.2026", duration: "720 ч", depot: "ТЧЭ-1 Лихоборы", tech: "Новиков В.Р.", status: "in_progress" },
  { id: "ЧС8-023", type: "ТО-2", plannedDate: "02.03.2026", duration: "8 ч", depot: "Москва-Пасс.", tech: "Морозов Е.Г.", status: "upcoming" },
  { id: "ЭП20-012", type: "ТО-3", plannedDate: "03.03.2026", duration: "24 ч", depot: "Москва-Пасс.", tech: "Иванов А.В.", status: "upcoming" },
  { id: "2ТЭ25КМ-0345", type: "ТР-2", plannedDate: "04.03.2026", duration: "168 ч", depot: "ТЧЭ-3 Сортировочная", tech: "Петров С.Н.", status: "in_progress" },
  { id: "ЧС7-031", type: "ТО-2", plannedDate: "06.02.2026", duration: "8 ч", depot: "Москва-Пасс.", tech: "Козлов Д.А.", status: "completed" },
  { id: "ВЛ85-001", type: "ТР-1", plannedDate: "30.01.2026", duration: "72 ч", depot: "ТЧЭ-1 Лихоборы", tech: "Новиков В.Р.", status: "completed" },
]

const typeColors: Record<string, string> = {
  "ТО-2": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "ТО-3": "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  "ТР-1": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "ТР-2": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "КР": "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; class: string }> = {
  upcoming: { label: "Запланировано", icon: Clock, class: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
  in_progress: { label: "Выполняется", icon: Wrench, class: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  completed: { label: "Выполнено", icon: CheckCircle, class: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
  overdue: { label: "Просрочено", icon: AlertTriangle, class: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
}

const statsCards = [
  { label: "Запланировано", value: schedule.filter(s => s.status === "upcoming").length, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  { label: "Выполняется", value: schedule.filter(s => s.status === "in_progress").length, icon: Wrench, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
  { label: "Завершено (месяц)", value: schedule.filter(s => s.status === "completed").length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
]

export default function MaintenancePage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ТО и ремонты</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">График технического обслуживания парка</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5">
        {statsCards.map((card) => (
          <Card key={card.label} className="border-gray-200 dark:border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            График ТО на февраль–март 2026
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              {["Локомотив", "Вид ТО", "Дата", "Длительность", "Депо", "Исполнитель", "Статус"].map((h) => (
                <th key={h} className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {schedule.map((item, i) => {
              const status = statusConfig[item.status]
              return (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.id}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${typeColors[item.type] ?? "bg-gray-100 text-gray-700"}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.plannedDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.duration}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.depot}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.tech}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.class}`}>
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
