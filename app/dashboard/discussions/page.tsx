import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { DiscussionsView } from "@/components/discussions/discussions-view"
import type { Profile, Comment, Event } from "@/types/database"

export default async function DiscussionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/auth/login")

  // Récupérer les commentaires récents avec leurs relations
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      user:profiles!comments_user_id_fkey(id, name, email),
      event:events!comments_event_id_fkey(id, titre),
      task:tasks!comments_task_id_fkey(id, titre),
      editorial:editorial_calendar!comments_editorial_id_fkey(id, titre),
      newsletter_topic:newsletter_topics!comments_newsletter_topic_id_fkey(id, sujet)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  // Récupérer les événements pour les filtres
  const { data: events } = await supabase
    .from("events")
    .select("id, titre, edition_annee")
    .order("date_debut", { ascending: false })

  const latestCommentAt = comments?.[0]?.created_at ?? null

  return (
    <div className="flex flex-col h-full">
      <Header
        user={profile as Profile}
        title="Discussions"
        description="Échangez avec votre équipe sur les projets"
        latestCommentAt={latestCommentAt}
      />
      <div className="flex-1 overflow-hidden">
        <DiscussionsView
          comments={(comments as Comment[]) || []}
          events={(events as Event[]) || []}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}
