import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { TasksView } from "@/components/tasks/tasks-view"
import type { Profile, Task, Event } from "@/types/database"

interface TasksPageProps {
  searchParams: Promise<{ event?: string; phase?: string; statut?: string }>
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/auth/login")

  // Récupérer les événements pour le filtre
  const { data: events } = await supabase
    .from("events")
    .select("id, titre, edition_annee")
    .order("date_debut", { ascending: false })

  // Construire la requête des tâches avec filtres
  let query = supabase.from("tasks").select(`
      *,
      event:events!tasks_event_id_fkey(id, titre, edition_annee),
      responsable:profiles!tasks_responsable_id_fkey(id, name)
    `)

  if (params.event) {
    query = query.eq("event_id", params.event)
  }
  if (params.phase) {
    query = query.eq("phase", params.phase)
  }
  if (params.statut) {
    query = query.eq("statut", params.statut)
  }

  const { data: tasks } = await query.order("date_echeance", { ascending: true }).order("ordre", { ascending: true })

  // Récupérer les utilisateurs pour l'assignation
  const { data: users } = await supabase.from("profiles").select("id, name, role").order("name")

  const canEdit = profile.role === "responsable" || profile.role === "charge_com"

  return (
    <div className="flex flex-col h-full">
      <Header
        user={profile as Profile}
        title="Tâches & Rétroplanning"
        description="Gérez les tâches de vos événements"
      />
      <div className="flex-1 overflow-hidden">
        <TasksView
          tasks={(tasks as Task[]) || []}
          events={(events as Event[]) || []}
          users={(users as Profile[]) || []}
          canEdit={canEdit}
          filters={params}
        />
      </div>
    </div>
  )
}
