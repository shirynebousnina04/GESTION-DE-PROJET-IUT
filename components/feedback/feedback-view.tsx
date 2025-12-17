"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, X } from "lucide-react"
import { FeedbackList } from "@/components/feedback/feedback-list"
import { FeedbackFormDialog } from "@/components/feedback/feedback-form-dialog"
import type { Feedback, Event } from "@/types/database"

interface FeedbackViewProps {
  feedbacks: Feedback[]
  events: Event[]
  currentUserId: string
  filters: { event?: string; annee?: string }
}

export function FeedbackView({ feedbacks, events, currentUserId, filters }: FeedbackViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingFeedback, setEditingFeedback] = useState<Feedback | undefined>()

  // Extraire les années disponibles
  const years = [...new Set(events.map((e) => e.edition_annee))].sort((a, b) => b - a)

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/dashboard/feedback?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/dashboard/feedback")
  }

  const handleEdit = (feedback: Feedback) => {
    setEditingFeedback(feedback)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setEditingFeedback(undefined)
    setIsFormOpen(true)
  }

  const handleClose = () => {
    setIsFormOpen(false)
    setEditingFeedback(undefined)
  }

  const hasFilters = filters.event || filters.annee

  // Filtrer les événements selon l'année sélectionnée
  const filteredEvents = filters.annee
    ? events.filter((e) => e.edition_annee === Number.parseInt(filters.annee!))
    : events

  return (
    <div className="flex flex-col h-full p-6">
      {/* Filtres */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Select value={filters.annee || ""} onValueChange={(v) => updateFilter("annee", v || null)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.event || ""} onValueChange={(v) => updateFilter("event", v || null)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Événement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {filteredEvents.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.titre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" />
              Effacer
            </Button>
          )}
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau bilan
        </Button>
      </div>

      {/* Liste des bilans */}
      <div className="flex-1 overflow-y-auto">
        {feedbacks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Aucun bilan</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Les retours d'expérience permettent de capitaliser sur vos événements passés. Créez votre premier bilan
                pour un événement terminé.
              </p>
            </CardContent>
          </Card>
        ) : (
          <FeedbackList feedbacks={feedbacks} currentUserId={currentUserId} onEdit={handleEdit} />
        )}
      </div>

      {/* Dialog */}
      <FeedbackFormDialog
        open={isFormOpen}
        onClose={handleClose}
        feedback={editingFeedback}
        events={events}
        currentUserId={currentUserId}
      />
    </div>
  )
}
