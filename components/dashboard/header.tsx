"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Profile } from "@/types/database"
import { useRouter } from "next/navigation"

interface HeaderProps {
  user: Profile
  title: string
  description?: string
  /** Date du dernier commentaire créé, au format ISO (string) */
  latestCommentAt?: string | null
}

const LAST_SEEN_KEY = "eventiut:lastSeenCommentAt"

export function Header({ user, title, description, latestCommentAt }: HeaderProps) {
  const router = useRouter()
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    if (!latestCommentAt) {
      setHasUnread(false)
      return
    }

    const stored = typeof window !== "undefined" ? window.localStorage.getItem(LAST_SEEN_KEY) : null
    if (!stored) {
      // Aucun historique : considérer qu'il y a des nouveaux messages
      setHasUnread(true)
      return
    }

    const lastSeen = new Date(stored).getTime()
    const latest = new Date(latestCommentAt).getTime()
    setHasUnread(latest > lastSeen)
  }, [latestCommentAt])

  const handleNotificationsClick = () => {
    if (latestCommentAt && typeof window !== "undefined") {
      window.localStorage.setItem(LAST_SEEN_KEY, latestCommentAt)
      setHasUnread(false)
    }
    router.push("/dashboard/discussions")
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative" onClick={handleNotificationsClick}>
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground shadow-sm">
              1
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
