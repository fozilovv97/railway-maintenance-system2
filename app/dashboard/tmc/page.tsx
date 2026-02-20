"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Package, Plus, Printer, Eye, CheckCircle, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type TmcItem = {
  no: number
  name: string
  invNo: string
  unit: string
  qty: number
  price: number
  note: string
}

type TmcDoc = {
  id: string
  docNo: string
  date: string
  workOrderId: string
  loco: string
  workType: string
  depot: string
  warehouse: string
  issuedBy: string
  acceptedBy: string
  chief: string
  status: "draft" | "issued" | "closed"
  items: TmcItem[]
}


const statusConfig = {
  draft:  { label: "Черновик", class: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300", icon: FileText },
  issued: { label: "Выдано", class: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400", icon: Clock },
  closed: { label: "Закрыто", class: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400", icon: CheckCircle },
}

function PrintDocument({ doc, onClose }: { doc: TmcDoc; onClose: () => void }) {
  const total = doc.items.reduce((s, i) => s + i.qty * i.price, 0)

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-auto py-8 px-4">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg print:hidden">
          <span className="text-sm font-medium text-gray-700">Предпросмотр документа</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => window.print()} className="gap-1.5">
              <Printer className="w-3.5 h-3.5" /> Печать
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>Закрыть</Button>
          </div>
        </div>

        {/* 1C-style document */}
        <div className="p-8 font-mono text-sm text-black" id="print-area">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="text-xs text-gray-500 mb-1">Унифицированная форма № М-11</div>
            <h1 className="text-base font-bold uppercase tracking-wide">ТРЕБОВАНИЕ-НАКЛАДНАЯ</h1>
            <div className="flex justify-center gap-8 mt-1 text-xs">
              <span>№ <span className="font-semibold border-b border-black px-4">{doc.docNo}</span></span>
              <span>от <span className="font-semibold border-b border-black px-4">{doc.date}</span></span>
            </div>
          </div>

          {/* Org info table */}
          <table className="w-full border border-black border-collapse text-xs mb-3">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1 w-40 text-gray-500">Организация</td>
                <td className="border border-black px-2 py-1 font-semibold" colSpan={3}>
                  АО «Российские железные дороги» / {doc.depot}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 text-gray-500">Наряд-заказ</td>
                <td className="border border-black px-2 py-1 font-semibold">{doc.workOrderId}</td>
                <td className="border border-black px-2 py-1 text-gray-500">Локомотив</td>
                <td className="border border-black px-2 py-1 font-semibold">{doc.loco}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 text-gray-500">Вид работ</td>
                <td className="border border-black px-2 py-1" colSpan={3}>{doc.workType}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 text-gray-500">Склад-отправитель</td>
                <td className="border border-black px-2 py-1" colSpan={3}>{doc.warehouse}</td>
              </tr>
            </tbody>
          </table>

          {/* TMC items table */}
          <table className="w-full border border-black border-collapse text-xs mb-3">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black px-2 py-1.5 text-center w-8">№ п/п</th>
                <th className="border border-black px-2 py-1.5 text-left">Наименование ТМЦ</th>
                <th className="border border-black px-2 py-1.5 text-center w-28">Инв. номер / Код</th>
                <th className="border border-black px-2 py-1.5 text-center w-16">Ед. изм.</th>
                <th className="border border-black px-2 py-1.5 text-center w-16">Кол-во</th>
                <th className="border border-black px-2 py-1.5 text-center w-24">Цена, сум</th>
                <th className="border border-black px-2 py-1.5 text-center w-24">Сумма, сум</th>
                <th className="border border-black px-2 py-1.5 text-left">Примечание</th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item) => (
                <tr key={item.no}>
                  <td className="border border-black px-2 py-1 text-center">{item.no}</td>
                  <td className="border border-black px-2 py-1">{item.name}</td>
                  <td className="border border-black px-2 py-1 text-center font-mono">{item.invNo}</td>
                  <td className="border border-black px-2 py-1 text-center">{item.unit}</td>
                  <td className="border border-black px-2 py-1 text-center">{item.qty}</td>
                  <td className="border border-black px-2 py-1 text-right">{item.price.toFixed(2)}</td>
                  <td className="border border-black px-2 py-1 text-right font-semibold">
                    {(item.qty * item.price).toFixed(2)}
                  </td>
                  <td className="border border-black px-2 py-1 text-gray-500">{item.note}</td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="font-bold bg-gray-50">
                <td className="border border-black px-2 py-1 text-center" colSpan={6}>ИТОГО:</td>
                <td className="border border-black px-2 py-1 text-right">{total.toFixed(2)}</td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 mt-6 text-xs">
            <div>
              <p className="text-gray-500 mb-1">Отпустил (кладовщик):</p>
              <div className="border-b border-black pb-1 mb-1 min-h-[20px]"></div>
              <p className="text-gray-500">{doc.issuedBy}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Получил (исполнитель):</p>
              <div className="border-b border-black pb-1 mb-1 min-h-[20px]"></div>
              <p className="text-gray-500">{doc.acceptedBy}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Утвердил (руководитель):</p>
              <div className="border-b border-black pb-1 mb-1 min-h-[20px]"></div>
              <p className="text-gray-500">{doc.chief}</p>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-400 text-center">
            Документ сформирован в системе управления техническим обслуживанием ЖД • {doc.date}
          </div>
        </div>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(r: any): TmcDoc {
  return {
    id:          r.id,
    docNo:       r.doc_no,
    date:        r.date,
    workOrderId: r.work_order_id,
    loco:        r.loco,
    workType:    r.work_type,
    depot:       r.depot,
    warehouse:   r.warehouse,
    issuedBy:    r.issued_by,
    acceptedBy:  r.accepted_by,
    chief:       r.chief,
    status:      r.status,
    items:       r.items ?? [],
  }
}

export default function TmcPage() {
  const [docs,     setDocs]     = useState<TmcDoc[]>([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<TmcDoc | null>(null)

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("tmc_documents")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error && data) {
      setDocs(data.map(fromRow))
    } else {
      setDocs([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  if (loading) return (
    <div className="flex items-center justify-center h-96 text-gray-400 text-sm gap-3">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
      Загрузка документов ТМЦ...
    </div>
  )

  return (
    <div className="p-8 space-y-6">
      {selected && <PrintDocument doc={selected} onClose={() => setSelected(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ТМЦ — Требования-накладные</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Учёт материально-технических ценностей на ремонт и ТО
          </p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Новая накладная
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {(["draft", "issued", "closed"] as const).map((s) => {
          const cfg = statusConfig[s]
          const count = docs.filter((d) => d.status === s).length
          return (
            <div key={s} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
              s === "draft" ? "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700" :
              s === "issued" ? "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800" :
              "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
            }`}>
              <cfg.icon className={`w-5 h-5 ${
                s === "draft" ? "text-gray-400" : s === "issued" ? "text-amber-600" : "text-green-600"
              }`} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{cfg.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Documents list */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              {["Номер документа", "Дата", "Наряд-заказ", "Локомотив", "Вид работ", "Позиций ТМЦ", "Сумма, сум", "Статус", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {docs.map((doc) => {
              const cfg = statusConfig[doc.status]
              const total = doc.items.reduce((s, i) => s + i.qty * i.price, 0)
              return (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                        <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{doc.docNo}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{doc.date}</td>
                  <td className="px-5 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">{doc.workOrderId}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{doc.loco}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-[200px]">
                    <span className="line-clamp-1">{doc.workType}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-center text-gray-900 dark:text-white font-semibold">
                    {doc.items.length}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white font-mono">
                    {total.toLocaleString("ru-RU", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.class}`}>
                      <cfg.icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs h-7"
                      onClick={() => setSelected(doc)}
                    >
                      <Eye className="w-3 h-3" />
                      Открыть
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Info block */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
        <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-900 dark:text-blue-200">Шаблон требования-накладной</p>
          <p className="text-blue-700 dark:text-blue-400 mt-0.5">
            Каждая накладная содержит: наименование ТМЦ, инвентарный номер, единицу измерения, количество, цену и сумму.
            Нажмите «Открыть» для просмотра и печати документа в формате, совместимом с 1С.
          </p>
        </div>
      </div>
    </div>
  )
}
