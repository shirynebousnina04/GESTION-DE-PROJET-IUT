import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { EventsList } from "@/components/events/events-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { Profile, Event } from "@/types/database"

export default async function EventsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/auth/login")

  const { data: events } = await supabase
    .from("events")
    .select(`
      *,
      responsable:profiles!events_responsable_id_fkey(id, name, email)
    `)
    .order("date_debut", { ascending: false })

  const canCreate = profile.role === "responsable" || profile.role === "charge_com"

  return (
    <div className="flex flex-col">
      <Header user={profile as Profile} title="Événements" description="Gérez vos événements et éditions annuelles" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <YearFilter />
          </div>
          {canCreate && (
            <Button asChild>
              <Link href="/dashboard/events/new">
                <Plus className="mr-2 h-4 w-4" />
                Nouvel événement
              </Link>
            </Button>
          )}
        </div>
        <EventsList events={(events as Event[]) || []} canEdit={canCreate} />
      </div>
    </div>
  )
}

function YearFilter() {
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2]

  return (
    <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
      <option value="">Toutes les années</option>
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  )
}
