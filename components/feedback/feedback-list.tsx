"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash, ThumbsUp, ThumbsDown, Lightbulb, Calendar } from "lucide-react"
import type { Feedback } from "@/types/database"
import { formatDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface FeedbackListProps {
  feedbacks: Feedback[]
  currentUserId: string
  onEdit: (feedback: Feedback) => void
}

export function FeedbackList({ feedbacks, currentUserId, onEdit }: FeedbackListProps) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce bilan ?")) return

    const supabase = createClient()
    await supabase.from("feedback").delete().eq("id", id)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => {
        const isOwner = feedback.user_id === currentUserId

        return (
          <Card key={feedback.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {feedback.event?.titre || "Événement inconnu"}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>Par {feedback.user?.name || "Utilisateur"}</span>
                    <span>•</span>
                    <span>{formatDate(feedback.created_at)}</span>
                    {feedback.event?.edition_annee && <Badge variant="outline">{feedback.event.edition_annee}</Badge>}
                  </div>
                </div>
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(feedback)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(feedback.id)} className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {feedback.points_forts && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                      <ThumbsUp className="h-4 w-4" />
                      Points forts
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{feedback.points_forts}</p>
                  </div>
                )}
                {feedback.points_faibles && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                      <ThumbsDown className="h-4 w-4" />
                      Points faibles
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{feedback.points_faibles}</p>
                  </div>
                )}
                {feedback.suggestions && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                      <Lightbulb className="h-4 w-4" />
                      Suggestions
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{feedback.suggestions}</p>
                  </div>
                )}
              </div>
              {!feedback.points_forts && !feedback.points_faibles && !feedback.suggestions && (
                <p className="text-sm text-muted-foreground italic">Aucun détail renseigné</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
