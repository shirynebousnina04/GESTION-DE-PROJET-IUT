"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, MapPin, User, Edit, CheckSquare, Calendar, Mail } from "lucide-react"
import Link from "next/link"
import type { Event } from "@/types/database"
import { formatDate } from "@/lib/format"

interface EventDetailProps {
  event: Event
  canEdit: boolean
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  brouillon: { label: "Brouillon", variant: "secondary" },
  planifie: { label: "Planifié", variant: "outline" },
  en_cours: { label: "En cours", variant: "default" },
  termine: { label: "Terminé", variant: "secondary" },
  annule: { label: "Annulé", variant: "destructive" },
}

const taskStatusLabels: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  a_faire: { label: "À faire", variant: "outline" },
  en_cours: { label: "En cours", variant: "default" },
  termine: { label: "Terminé", variant: "secondary" },
  bloque: { label: "Bloqué", variant: "destructive" },
}

export function EventDetail({ event, canEdit }: EventDetailProps) {
  const status = statusLabels[event.statut] || statusLabels.brouillon

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Badge variant={status.variant}>{status.label}</Badge>
          {event.type && <p className="text-sm text-muted-foreground capitalize">{event.type.replace("_", " ")}</p>}
        </div>
        {canEdit && (
          <Button asChild>
            <Link href={`/dashboard/events/${event.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
              <div className="grid gap-4 sm:grid-cols-2">
                {(event.date_debut || event.date_fin) && (
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Dates</p>
                      <p className="text-sm text-muted-foreground">
                        {event.date_debut && formatDate(event.date_debut)}
                        {event.date_fin && event.date_fin !== event.date_debut && ` - ${formatDate(event.date_fin)}`}
                      </p>
                    </div>
                  </div>
                )}
                {event.lieu && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Lieu</p>
                      <p className="text-sm text-muted-foreground">{event.lieu}</p>
                    </div>
                  </div>
                )}
                {event.responsable && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Responsable</p>
                      <p className="text-sm text-muted-foreground">{event.responsable.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="tasks">
            <TabsList>
              <TabsTrigger value="tasks" className="gap-2">
                <CheckSquare className="h-4 w-4" />
                Tâches ({event.tasks?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="editorial" className="gap-2">
                <Calendar className="h-4 w-4" />
                Éditorial ({event.editorial_items?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="newsletter" className="gap-2">
                <Mail className="h-4 w-4" />
                Newsletter ({event.newsletter_topics?.length || 0})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {event.tasks && event.tasks.length > 0 ? (
                    <div className="space-y-3">
                      {event.tasks.map((task) => {
                        const taskStatus = taskStatusLabels[task.statut] || taskStatusLabels.a_faire
                        return (
                          <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                              <p className="font-medium">{task.titre}</p>
                              {task.responsable && (
                                <p className="text-sm text-muted-foreground">{task.responsable.name}</p>
                              )}
                            </div>
                            <Badge variant={taskStatus.variant}>{taskStatus.label}</Badge>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucune tâche associée</p>
                  )}
                  {canEdit && (
                    <Button asChild variant="outline" className="w-full mt-4 bg-transparent">
                      <Link href={`/dashboard/tasks?event=${event.id}`}>Gérer les tâches</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="editorial" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {event.editorial_items && event.editorial_items.length > 0 ? (
                    <div className="space-y-3">
                      {event.editorial_items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                          <p className="font-medium">{item.titre}</p>
                          <Badge variant="outline">{item.statut}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun sujet éditorial associé</p>
                  )}
                  {canEdit && (
                    <Button asChild variant="outline" className="w-full mt-4 bg-transparent">
                      <Link href={`/dashboard/editorial?event=${event.id}`}>Voir le calendrier éditorial</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="newsletter" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {event.newsletter_topics && event.newsletter_topics.length > 0 ? (
                    <div className="space-y-3">
                      {event.newsletter_topics.map((topic) => (
                        <div key={topic.id} className="flex items-center justify-between rounded-lg border p-3">
                          <p className="font-medium">{topic.sujet}</p>
                          <Badge variant="outline">{topic.statut}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun sujet newsletter associé</p>
                  )}
                  {canEdit && (
                    <Button asChild variant="outline" className="w-full mt-4 bg-transparent">
                      <Link href={`/dashboard/newsletter?event=${event.id}`}>Voir la newsletter</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tâches terminées</span>
                <span className="font-medium">
                  {event.tasks?.filter((t) => t.statut === "termine").length || 0} / {event.tasks?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sujets éditoriaux</span>
                <span className="font-medium">{event.editorial_items?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sujets newsletter</span>
                <span className="font-medium">{event.newsletter_topics?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
