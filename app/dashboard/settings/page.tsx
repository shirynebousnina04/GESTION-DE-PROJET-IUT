import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { SettingsForm } from "@/components/settings/settings-form"
import type { Profile } from "@/types/database"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/auth/login")

  // Récupérer tous les utilisateurs si responsable
  let users: Profile[] = []
  if (profile.role === "responsable") {
    const { data } = await supabase.from("profiles").select("*").order("name")
    users = (data as Profile[]) || []
  }

  return (
    <div className="flex flex-col">
      <Header user={profile as Profile} title="Paramètres" description="Gérez votre compte et vos préférences" />
      <div className="p-6">
        <SettingsForm profile={profile as Profile} users={users} />
      </div>
    </div>
  )
}
