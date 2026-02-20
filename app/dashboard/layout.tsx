"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  Wrench, ClipboardList, LayoutDashboard,
  ChevronRight, Package, Landmark, LogOut, Users, Building2, FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const ALL_NAV = [
  { href: "/dashboard",             label: "Дашборд",        icon: LayoutDashboard, roles: ["admin","operator"],         exact: true },
  { href: "/dashboard/os",          label: "Осн. средства",  icon: Landmark,        roles: ["admin","operator"]                    },
  { href: "/dashboard/maintenance", label: "ТО и ремонты",   icon: Wrench,          roles: ["admin","operator"]                    },
  { href: "/dashboard/work-orders", label: "Наряд-заказы",   icon: ClipboardList,   roles: ["admin","operator","master"]            },
  { href: "/dashboard/tmc",         label: "ТМЦ",            icon: Package,         roles: ["admin","operator"]                    },
  { href: "/dashboard/reports",     label: "Отчёты",        icon: FileText,       roles: ["admin","operator"]                    },
  { href: "/dashboard/admin/users",    label: "Пользователи", icon: Users,      roles: ["admin"] },
  { href: "/dashboard/admin/sections", label: "Участки",     icon: Building2,  roles: ["admin"] },
]

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  admin:    { label: "Администратор", cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300" },
  operator: { label: "Оператор",      cls: "bg-blue-100   text-blue-700   dark:bg-blue-900/60   dark:text-blue-300"   },
  master:   { label: "Мастер",        cls: "bg-amber-100  text-amber-700  dark:bg-amber-900/60  dark:text-amber-300"  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, profile, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login")
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Загрузка...
        </div>
      </div>
    )
  }

  const role     = profile?.role ?? "master"
  const navItems = ALL_NAV.filter(n => n.roles.includes(role))
  const badge    = ROLE_BADGE[role]

  const handleSignOut = async () => {
    await signOut()
    router.replace("/auth/login")
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">

        {/* Шапка сайдбара */}
        <div className="h-16 flex items-center px-5 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none tracking-widest">STTB</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Система обслуживания</p>
          </div>
        </div>

        {/* Навигация */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5" />}
              </Link>
            )
          })}
        </nav>

        {/* Пользователь */}
        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 mb-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
              {profile?.full_name || user.email}
            </p>
            {profile?.section && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{profile.section}</p>
            )}
            <span className={cn("inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-2", badge.cls)}>
              {badge.label}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
