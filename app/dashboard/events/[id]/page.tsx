import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { EventDetail } from "@/components/events/event-detail"
import type { Profile, Event } from "@/types/database"

interface EventPageProps {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/auth/login")

  const { data: event } = await supabase
    .from("events")
    .select(`
      *,
      responsable:profiles!events_responsable_id_fkey(id, name, email),
      tasks(*, responsable:profiles!tasks_responsable_id_fkey(id, name)),
      editorial_items:editorial_calendar(id, titre, statut),
      newsletter_topics(id, sujet, statut)
    `)
    .eq("id", id)
    .single()

  if (!event) notFound()

  const canEdit = profile.role === "responsable" || profile.role === "charge_com"

  return (
    <div className="flex flex-col">
      <Header user={profile as Profile} title={event.titre} description={`Édition ${event.edition_annee}`} />
      <div className="p-6">
        <EventDetail event={event as Event} canEdit={canEdit} />
      </div>
    </div>
  )
}
