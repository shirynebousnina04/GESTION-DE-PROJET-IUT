import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, CheckSquare, Calendar, Mail } from "lucide-react"
import type { Profile } from "@/types/database"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) redirect("/auth/login")

  // Récupérer les statistiques
  const currentYear = new Date().getFullYear()

  const [eventsResult, tasksResult, editorialResult, newsletterResult, commentsResult] = await Promise.all([
    supabase.from("events").select("id", { count: "exact" }).eq("edition_annee", currentYear),
    supabase.from("tasks").select("id", { count: "exact" }).eq("statut", "a_faire"),
    supabase.from("editorial_calendar").select("id", { count: "exact" }),
    supabase.from("newsletter_editions").select("id", { count: "exact" }).eq("annee", currentYear),
    supabase.from("comments").select("created_at").order("created_at", { ascending: false }).limit(1),
  ])

  const stats = [
    {
      title: "Événements",
      value: eventsResult.count || 0,
      description: `en ${currentYear}`,
      icon: CalendarDays,
    },
    {
      title: "Tâches à faire",
      value: tasksResult.count || 0,
      description: "en attente",
      icon: CheckSquare,
    },
    {
      title: "Sujets éditoriaux",
      value: editorialResult.count || 0,
      description: "au total",
      icon: Calendar,
    },
    {
      title: "Newsletters",
      value: newsletterResult.count || 0,
      description: `en ${currentYear}`,
      icon: Mail,
    },
  ]

  const latestCommentAt = commentsResult.data?.[0]?.created_at ?? null

  return (
    <div className="flex flex-col">
      <Header
        user={profile as Profile}
        title="Tableau de bord"
        description={`Bienvenue, ${profile.name}`}
        latestCommentAt={latestCommentAt}
      />
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Événements récents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Aucun événement pour le moment. Créez votre premier événement pour commencer.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tâches urgentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Aucune tâche urgente. Les tâches à échéance proche apparaîtront ici.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
