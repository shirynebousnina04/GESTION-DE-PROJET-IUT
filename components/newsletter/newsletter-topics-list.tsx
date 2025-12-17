"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash, LinkIcon } from "lucide-react"
import type { NewsletterTopic } from "@/types/database"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface NewsletterTopicsListProps {
  topics: NewsletterTopic[]
  canEdit: boolean
  onEdit: (topic: NewsletterTopic) => void
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  idee: { label: "Idée", variant: "outline" },
  en_preparation: { label: "En préparation", variant: "default" },
  publie: { label: "Publié", variant: "secondary" },
}

export function NewsletterTopicsList({ topics, canEdit, onEdit }: NewsletterTopicsListProps) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce sujet ?")) return

    const supabase = createClient()
    await supabase.from("newsletter_topics").delete().eq("id", id)
    router.refresh()
  }

  if (topics.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Aucun sujet dans cette catégorie</p>
  }

  return (
    <div className="space-y-2">
      {topics.map((topic) => {
        const status = statusLabels[topic.statut] || statusLabels.idee
        return (
          <div key={topic.id} className="flex items-start justify-between rounded-lg border p-3 gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{topic.sujet}</span>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              {topic.notes && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{topic.notes}</p>}
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                {topic.event && (
                  <span className="flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    {topic.event.titre}
                  </span>
                )}
                {topic.edition && <span>#{topic.edition.numero}</span>}
              </div>
            </div>
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(topic)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(topic.id)} className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )
      })}
    </div>
  )
}
