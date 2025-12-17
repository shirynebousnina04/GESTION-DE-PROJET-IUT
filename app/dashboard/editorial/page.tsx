import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { EditorialView } from "@/components/editorial/editorial-view"
import type { Profile, EditorialCalendar, Event } from "@/types/database"

interface EditorialPageProps {
  searchParams: Promise<{ event?: string; categorie?: string; statut?: string; view?: string }>
}

export default async function EditorialPage({ searchParams }: EditorialPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/auth/login")

  // Récupérer les événements pour le filtre et les liens
  const { data: events } = await supabase
    .from("events")
    .select("id, titre, edition_annee")
    .order("date_debut", { ascending: false })

  // Construire la requête du calendrier éditorial avec filtres
  let query = supabase.from("editorial_calendar").select(`
      *,
      event:events!editorial_calendar_event_id_fkey(id, titre)
    `)

  if (params.event) {
    query = query.eq("event_id", params.event)
  }
  if (params.categorie) {
    query = query.eq("categorie", params.categorie)
  }
  if (params.statut) {
    query = query.eq("statut", params.statut)
  }

  const { data: items } = await query.order("date_debut", { ascending: true, nullsFirst: false })

  const canEdit = profile.role === "responsable" || profile.role === "charge_com"

  return (
    <div className="flex flex-col h-full">
      <Header
        user={profile as Profile}
        title="Calendrier éditorial"
        description="Planifiez vos contenus et publications"
      />
      <div className="flex-1 overflow-hidden">
        <EditorialView
          items={(items as EditorialCalendar[]) || []}
          events={(events as Event[]) || []}
          canEdit={canEdit}
          filters={params}
          currentView={params.view || "table"}
        />
      </div>
    </div>
  )
}
