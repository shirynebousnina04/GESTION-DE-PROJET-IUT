import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { EventForm } from "@/components/events/event-form"
import type { Profile, Event } from "@/types/database"

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/auth/login")

  // Vérifier les permissions
  if (profile.role === "contributeur") {
    redirect("/dashboard/events")
  }

  const { data: event } = await supabase.from("events").select("*").eq("id", id).single()

  if (!event) notFound()

  const { data: users } = await supabase.from("profiles").select("id, name, email, role").order("name")

  return (
    <div className="flex flex-col">
      <Header user={profile as Profile} title="Modifier l'événement" description={event.titre} />
      <div className="p-6">
        <EventForm event={event as Event} users={(users as Profile[]) || []} currentUserId={user.id} />
      </div>
    </div>
  )
}
