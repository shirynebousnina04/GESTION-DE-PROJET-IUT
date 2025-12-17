"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  Calendar,
  CalendarDays,
  CheckSquare,
  FileText,
  Home,
  Mail,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile } from "@/types/database"

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: Home },
  { name: "Événements", href: "/dashboard/events", icon: CalendarDays },
  { name: "Tâches", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Calendrier éditorial", href: "/dashboard/editorial", icon: Calendar },
  { name: "Newsletter", href: "/dashboard/newsletter", icon: Mail },
  { name: "Discussions", href: "/dashboard/discussions", icon: MessageSquare },
  { name: "Bilans", href: "/dashboard/feedback", icon: FileText },
]

interface SidebarProps {
  user: Profile
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const roleLabels: Record<string, string> = {
    responsable: "Responsable",
    charge_com: "Chargé(e) de com",
    contributeur: "Contributeur",
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-sidebar/95 backdrop-blur-sm">
      <div className="flex h-24 items-center justify-center border-b px-5">
        <div className="relative h-12 w-40">
          <Image src="/iut-logo.svg" alt="IUT - Université de Toulon" fill className="object-contain" priority />
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-sidebar-ring/30"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1",
              )}
            >
              <item.icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 px-3">
          <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-sidebar-accent/70 px-2 py-0.5 text-[11px] font-medium text-sidebar-accent-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {roleLabels[user.role]}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/dashboard/settings"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
            )}
          >
            <Settings className="h-5 w-5" />
            Paramètres
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors duration-200"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  )
}
