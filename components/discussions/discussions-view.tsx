"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Trash, Calendar, CheckSquare, FileText, Mail } from "lucide-react"
import type { Comment, Event } from "@/types/database"
import { formatDateTime } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DiscussionsViewProps {
  comments: Comment[]
  events: Event[]
  currentUserId: string
}

export function DiscussionsView({ comments, events, currentUserId }: DiscussionsViewProps) {
  const router = useRouter()
  const [newComment, setNewComment] = useState("")
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<string>("all")

  const handleSubmit = async () => {
    if (!newComment.trim() || !selectedEvent) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      await supabase.from("comments").insert({
        content: newComment.trim(),
        user_id: currentUserId,
        event_id: selectedEvent,
      })

      setNewComment("")
      router.refresh()
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) return

    const supabase = createClient()
    await supabase.from("comments").delete().eq("id", id)
    router.refresh()
  }

  const getCommentContext = (comment: Comment) => {
    if (comment.event) return { type: "event", label: comment.event.titre, icon: Calendar }
    if (comment.task) return { type: "task", label: comment.task.titre, icon: CheckSquare }
    if (comment.editorial) return { type: "editorial", label: comment.editorial.titre, icon: FileText }
    if (comment.newsletter_topic) return { type: "newsletter", label: comment.newsletter_topic.sujet, icon: Mail }
    return null
  }

  const filteredComments = comments.filter((comment) => {
    if (filter === "all") return true
    if (filter === "event") return !!comment.event_id
    if (filter === "task") return !!comment.task_id
    if (filter === "editorial") return !!comment.editorial_id
    if (filter === "newsletter") return !!comment.newsletter_topic_id
    return true
  })

  return (
    <div className="flex flex-col h-full p-6">
      {/* Nouveau commentaire */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nouveau commentaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un événement" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.titre} ({event.edition_annee})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Écrire un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={isSubmitting || !newComment.trim() || !selectedEvent}>
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Envoi..." : "Publier"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtres et liste */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Discussions récentes</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="event">Événements</SelectItem>
            <SelectItem value="task">Tâches</SelectItem>
            <SelectItem value="editorial">Éditorial</SelectItem>
            <SelectItem value="newsletter">Newsletter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {filteredComments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Aucune discussion</h3>
              <p className="text-sm text-muted-foreground">Les commentaires apparaîtront ici.</p>
            </CardContent>
          </Card>
        ) : (
          filteredComments.map((comment) => {
            const context = getCommentContext(comment)
            const isOwner = comment.user_id === currentUserId

            return (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{comment.user?.name?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{comment.user?.name || "Utilisateur"}</span>
                          <span className="text-xs text-muted-foreground">{formatDateTime(comment.created_at)}</span>
                        </div>
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(comment.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {context && (
                        <Badge variant="outline" className="mt-1 gap-1">
                          <context.icon className="h-3 w-3" />
                          {context.label}
                        </Badge>
                      )}
                      <p className="mt-2 text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
