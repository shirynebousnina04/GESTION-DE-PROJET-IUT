import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { EventForm } from "@/components/events/event-form"
import type { Profile } from "@/types/database"

export default async function NewEventPage() {
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

  // Récupérer la liste des utilisateurs pour l'assignation
  const { data: users } = await supabase.from("profiles").select("id, name, email, role").order("name")

  return (
    <div className="flex flex-col">
      <Header user={profile as Profile} title="Nouvel événement" description="Créer un nouvel événement" />
      <div className="p-6">
        <EventForm users={(users as Profile[]) || []} currentUserId={user.id} />
      </div>
    </div>
  )
}
