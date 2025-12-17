"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { NewsletterTopic, NewsletterEdition, Event } from "@/types/database"

interface NewsletterTopicDialogProps {
  open: boolean
  onClose: () => void
  topic?: NewsletterTopic
  editions: NewsletterEdition[]
  events: Event[]
  currentYear: number
  defaultEditionId?: string
}

const categorieOptions = [
  { value: "prochainement", label: "Prochainement" },
  { value: "actualite", label: "Actualité" },
  { value: "ne_pas_manquer", label: "Ce qu'il ne fallait pas manquer" },
]

const statusOptions = [
  { value: "idee", label: "Idée" },
  { value: "en_preparation", label: "En préparation" },
  { value: "publie", label: "Publié" },
]

export function NewsletterTopicDialog({
  open,
  onClose,
  topic,
  editions,
  events,
  currentYear,
  defaultEditionId,
}: NewsletterTopicDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    sujet: "",
    notes: "",
    categorie: "" as string,
    statut: "idee" as string,
    edition_id: defaultEditionId || "",
    event_id: "",
  })

  useEffect(() => {
    if (topic) {
      setFormData({
        sujet: topic.sujet,
        notes: topic.notes || "",
        categorie: topic.categorie || "",
        statut: topic.statut,
        edition_id: topic.edition_id || "",
        event_id: topic.event_id || "",
      })
    } else {
      setFormData({
        sujet: "",
        notes: "",
        categorie: "",
        statut: "idee",
        edition_id: defaultEditionId || "",
        event_id: "",
      })
    }
  }, [topic, defaultEditionId, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const dataToSave = {
        sujet: formData.sujet,
        notes: formData.notes || null,
        categorie: formData.categorie || null,
        statut: formData.statut,
        edition_id: formData.edition_id || null,
        event_id: formData.event_id || null,
        annee: currentYear,
      }

      if (topic) {
        const { error } = await supabase
          .from("newsletter_topics")
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq("id", topic.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("newsletter_topics").insert(dataToSave)
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{topic ? "Modifier le sujet" : "Nouveau sujet de newsletter"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sujet">Sujet *</Label>
              <Input
                id="sujet"
                value={formData.sujet}
                onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                placeholder="Titre du sujet"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes internes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Voir avec..., Demander à..., Rappel..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="categorie">Catégorie</Label>
                <Select
                  value={formData.categorie}
                  onValueChange={(v) => setFormData({ ...formData, categorie: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucune" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    {categorieOptions.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="statut">Statut</Label>
                <Select value={formData.statut} onValueChange={(v) => setFormData({ ...formData, statut: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edition_id">Édition</Label>
              <Select
                value={formData.edition_id}
                onValueChange={(v) => setFormData({ ...formData, edition_id: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucune" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {editions.map((edition) => (
                    <SelectItem key={edition.id} value={edition.id}>
                      {edition.numero}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event_id">Événement lié</Label>
              <Select
                value={formData.event_id}
                onValueChange={(v) => setFormData({ ...formData, event_id: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.titre} ({event.edition_annee})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent">
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : topic ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
