import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { FeedbackView } from "@/components/feedback/feedback-view"
import type { Profile, Feedback, Event } from "@/types/database"

interface FeedbackPageProps {
  searchParams: Promise<{ event?: string; annee?: string }>
}

export default async function FeedbackPage({ searchParams }: FeedbackPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/auth/login")

  // Récupérer les événements terminés pour les bilans
  const { data: events } = await supabase
    .from("events")
    .select("id, titre, edition_annee, statut")
    .in("statut", ["termine", "annule"])
    .order("date_fin", { ascending: false })

  // Construire la requête des feedbacks
  let feedbackQuery = supabase.from("feedback").select(`
      *,
      event:events!feedback_event_id_fkey(id, titre, edition_annee),
      user:profiles!feedback_user_id_fkey(id, name)
    `)

  if (params.event) {
    feedbackQuery = feedbackQuery.eq("event_id", params.event)
  }

  if (params.annee) {
    // Filtrer par année via la relation event
    const eventsOfYear = events?.filter((e) => e.edition_annee === Number.parseInt(params.annee!)) || []
    const eventIds = eventsOfYear.map((e) => e.id)
    if (eventIds.length > 0) {
      feedbackQuery = feedbackQuery.in("event_id", eventIds)
    }
  }

  const { data: feedbacks } = await feedbackQuery.order("created_at", { ascending: false })

  return (
    <div className="flex flex-col h-full">
      <Header
        user={profile as Profile}
        title="Bilans & Retours d'expérience"
        description="Capitalisez sur vos événements passés"
      />
      <div className="flex-1 overflow-hidden">
        <FeedbackView
          feedbacks={(feedbacks as Feedback[]) || []}
          events={(events as Event[]) || []}
          currentUserId={user.id}
          filters={params}
        />
      </div>
    </div>
  )
}
