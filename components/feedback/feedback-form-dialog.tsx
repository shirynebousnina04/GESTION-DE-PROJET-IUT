"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Feedback, Event } from "@/types/database"

interface FeedbackFormDialogProps {
  open: boolean
  onClose: () => void
  feedback?: Feedback
  events: Event[]
  currentUserId: string
}

export function FeedbackFormDialog({ open, onClose, feedback, events, currentUserId }: FeedbackFormDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    event_id: "",
    points_forts: "",
    points_faibles: "",
    suggestions: "",
  })

  useEffect(() => {
    if (feedback) {
      setFormData({
        event_id: feedback.event_id,
        points_forts: feedback.points_forts || "",
        points_faibles: feedback.points_faibles || "",
        suggestions: feedback.suggestions || "",
      })
    } else {
      setFormData({
        event_id: "",
        points_forts: "",
        points_faibles: "",
        suggestions: "",
      })
    }
  }, [feedback, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!formData.event_id) {
      setError("Veuillez sélectionner un événement")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const dataToSave = {
        event_id: formData.event_id,
        points_forts: formData.points_forts || null,
        points_faibles: formData.points_faibles || null,
        suggestions: formData.suggestions || null,
        user_id: currentUserId,
      }

      if (feedback) {
        const { error } = await supabase.from("feedback").update(dataToSave).eq("id", feedback.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("feedback").insert(dataToSave)
        if (error) throw error
      }

      router.refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{feedback ? "Modifier le bilan" : "Nouveau bilan d'événement"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event_id">Événement *</Label>
              <Select value={formData.event_id} onValueChange={(v) => setFormData({ ...formData, event_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un événement terminé" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.titre} ({event.edition_annee})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Seuls les événements terminés ou annulés sont listés</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="points_forts" className="text-green-700">
                Points forts
              </Label>
              <Textarea
                id="points_forts"
                value={formData.points_forts}
                onChange={(e) => setFormData({ ...formData, points_forts: e.target.value })}
                placeholder="Ce qui a bien fonctionné..."
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="points_faibles" className="text-red-700">
                Points faibles
              </Label>
              <Textarea
                id="points_faibles"
                value={formData.points_faibles}
                onChange={(e) => setFormData({ ...formData, points_faibles: e.target.value })}
                placeholder="Ce qui pourrait être amélioré..."
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="suggestions" className="text-blue-700">
                Suggestions pour la prochaine édition
              </Label>
              <Textarea
                id="suggestions"
                value={formData.suggestions}
                onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                placeholder="Idées et recommandations..."
                rows={4}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent">
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : feedback ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
