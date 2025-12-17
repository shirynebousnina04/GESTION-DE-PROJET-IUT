import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { NewsletterView } from "@/components/newsletter/newsletter-view"
import type { Profile, NewsletterEdition, NewsletterTopic, Event } from "@/types/database"

interface NewsletterPageProps {
  searchParams: Promise<{ edition?: string; annee?: string }>
}

export default async function NewsletterPage({ searchParams }: NewsletterPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/auth/login")

  const currentYear = params.annee ? Number.parseInt(params.annee) : new Date().getFullYear()

  // Récupérer les éditions de l'année
  const { data: editions } = await supabase
    .from("newsletter_editions")
    .select("*")
    .eq("annee", currentYear)
    .order("date_envoi", { ascending: false })

  // Récupérer les sujets avec filtres
  let topicsQuery = supabase.from("newsletter_topics").select(`
      *,
      edition:newsletter_editions(id, numero, date_envoi),
      event:events!newsletter_topics_event_id_fkey(id, titre)
    `)

  if (params.edition) {
    topicsQuery = topicsQuery.eq("edition_id", params.edition)
  } else {
    topicsQuery = topicsQuery.eq("annee", currentYear)
  }

  const { data: topics } = await topicsQuery.order("created_at", { ascending: false })

  // Récupérer les événements pour les liens
  const { data: events } = await supabase
    .from("events")
    .select("id, titre, edition_annee")
    .order("date_debut", { ascending: false })

  const canEdit = profile.role === "responsable" || profile.role === "charge_com"

  return (
    <div className="flex flex-col h-full">
      <Header
        user={profile as Profile}
        title="Newsletter"
        description="Gérez les sujets et éditions de votre newsletter"
      />
      <div className="flex-1 overflow-hidden">
        <NewsletterView
          editions={(editions as NewsletterEdition[]) || []}
          topics={(topics as NewsletterTopic[]) || []}
          events={(events as Event[]) || []}
          canEdit={canEdit}
          currentYear={currentYear}
          selectedEdition={params.edition}
        />
      </div>
    </div>
  )
}
