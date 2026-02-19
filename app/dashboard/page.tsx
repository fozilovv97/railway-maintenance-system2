import { Train, Wrench, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const kpiCards = [
  {
    title: "Всего локомотивов",
    value: "48",
    sub: "+2 за месяц",
    icon: Train,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    title: "В эксплуатации",
    value: "35",
    sub: "72.9% парка",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950",
  },
  {
    title: "На техобслуживании",
    value: "9",
    sub: "Плановые работы",
    icon: Wrench,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
  {
    title: "Неисправные",
    value: "4",
    sub: "Требуют ремонта",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950",
  },
]

const upcomingMaintenance = [
  { id: "ЧС7-042", type: "ТО-2", date: "21.02.2026", priority: "normal" },
  { id: "ВЛ80С-1243", type: "ТР-1", date: "23.02.2026", priority: "high" },
  { id: "ЭП1-014", type: "ТО-3", date: "25.02.2026", priority: "normal" },
  { id: "2ТЭ116-1567", type: "ТО-2", date: "26.02.2026", priority: "low" },
  { id: "ВЛ10-845", type: "КР", date: "28.02.2026", priority: "high" },
]

const recentWorkOrders = [
  { id: "НЗ-2026-0143", loco: "ЧС7-031", desc: "Замена тормозных колодок", status: "completed", tech: "Иванов А.В." },
  { id: "НЗ-2026-0144", loco: "ВЛ80С-1201", desc: "Ревизия тяговых двигателей", status: "in_progress", tech: "Петров С.Н." },
  { id: "НЗ-2026-0145", loco: "ЭП1-022", desc: "Устранение утечки масла", status: "pending", tech: "Сидоров К.П." },
  { id: "НЗ-2026-0146", loco: "2ТЭ116-1590", desc: "Диагностика ходовой части", status: "in_progress", tech: "Козлов Д.А." },
]

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  completed: { label: "Выполнен", variant: "default" },
  in_progress: { label: "В работе", variant: "secondary" },
  pending: { label: "Ожидание", variant: "outline" },
}

const priorityConfig: Record<string, { label: string; class: string }> = {
  high: { label: "Высокий", class: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  normal: { label: "Обычный", class: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  low: { label: "Низкий", class: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
}

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Дашборд</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Обзор состояния парка на 19 февраля 2026</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card) => (
          <Card key={card.title} className="border-gray-200 dark:border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {card.sub}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming maintenance */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Предстоящее ТО
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingMaintenance.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Train className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.id}</p>
                      <p className="text-xs text-gray-500">{item.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityConfig[item.priority].class}`}>
                      {priorityConfig[item.priority].label}
                    </span>
                    <span className="text-xs text-gray-500">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent work orders */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-500" />
              Последние наряд-заказы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentWorkOrders.map((wo) => (
                <div key={wo.id} className="flex items-start justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono text-gray-500">{wo.id}</p>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{wo.loco}</span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white mt-0.5 truncate">{wo.desc}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{wo.tech}</p>
                  </div>
                  <Badge variant={statusConfig[wo.status].variant} className="ml-3 flex-shrink-0 text-xs">
                    {statusConfig[wo.status].label}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
