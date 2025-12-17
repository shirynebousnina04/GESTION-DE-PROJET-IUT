"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CalendarDays, MapPin, MoreHorizontal, Edit, Copy, Trash, Eye } from "lucide-react"
import Link from "next/link"
import type { Event } from "@/types/database"
import { formatDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface EventsListProps {
  events: Event[]
  canEdit: boolean
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  brouillon: { label: "Brouillon", variant: "secondary" },
  planifie: { label: "Planifié", variant: "outline" },
  en_cours: { label: "En cours", variant: "default" },
  termine: { label: "Terminé", variant: "secondary" },
  annule: { label: "Annulé", variant: "destructive" },
}

export function EventsList({ events, canEdit }: EventsListProps) {
  const router = useRouter()

  const handleDuplicate = async (event: Event) => {
    const supabase = createClient()
    const { error } = await supabase.from("events").insert({
      titre: `${event.titre} (copie)`,
      description: event.description,
      lieu: event.lieu,
      type: event.type,
      edition_annee: new Date().getFullYear(),
      statut: "brouillon",
      template_id: event.id,
    })

    if (!error) {
      router.refresh()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return

    const supabase = createClient()
    const { error } = await supabase.from("events").delete().eq("id", id)

    if (!error) {
      router.refresh()
    }
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Aucun événement</h3>
          <p className="text-sm text-muted-foreground">Créez votre premier événement pour commencer.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const status = statusLabels[event.statut] || statusLabels.brouillon
        return (
          <Card key={event.id} className="flex flex-col">
            <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base leading-tight">{event.titre}</CardTitle>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/events/${event.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/events/${event.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(event)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Dupliquer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(event.id)} className="text-destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              {event.description && (
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
              )}
              <div className="space-y-2 text-sm">
                {(event.date_debut || event.date_fin) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      {event.date_debut && formatDate(event.date_debut)}
                      {event.date_fin && event.date_fin !== event.date_debut && ` - ${formatDate(event.date_fin)}`}
                    </span>
                  </div>
                )}
                {event.lieu && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.lieu}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Édition {event.edition_annee}</span>
                {event.responsable && <span className="text-xs text-muted-foreground">{event.responsable.name}</span>}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
