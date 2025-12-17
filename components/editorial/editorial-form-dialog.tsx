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
import { Checkbox } from "@/components/ui/checkbox"
import type { EditorialCalendar, Event } from "@/types/database"

interface EditorialFormDialogProps {
  open: boolean
  onClose: () => void
  item?: EditorialCalendar
  events: Event[]
  defaultEventId?: string
}

const categorieOptions = ["IUT", "MMI", "GEII", "GBIO", "TC", "GEAT", "GEAD", "GIM", "GMP"] as const

const supportOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "site_web", label: "Site web" },
  { value: "tv", label: "TV" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "X (Twitter)" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
]

const typeCreationOptions = [
  { value: "video", label: "Vidéo" },
  { value: "post", label: "Post" },
  { value: "reel", label: "Réel" },
  { value: "affiche", label: "Affiche" },
  { value: "story", label: "Story" },
  { value: "article", label: "Article" },
  { value: "autre", label: "Autre" },
]

const dateTypeOptions = [
  { value: "date_precise", label: "Date précise" },
  { value: "mois", label: "Mois" },
  { value: "periode", label: "Période" },
  { value: "a_definir", label: "À définir" },
]

const statusOptions = [
  { value: "idee", label: "Idée" },
  { value: "en_cours", label: "En cours" },
  { value: "valide", label: "Validé" },
  { value: "publie", label: "Publié" },
]

export function EditorialFormDialog({ open, onClose, item, events, defaultEventId }: EditorialFormDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    titre: "",
    categorie: "" as string,
    support: [] as string[],
    type_creation: "" as string,
    date_type: "a_definir" as string,
    date_debut: "",
    date_fin: "",
    nb_publications: 1,
    commentaires: "",
    liens: "",
    statut: "idee" as string,
    event_id: defaultEventId || "",
  })

  useEffect(() => {
    if (item) {
      setFormData({
        titre: item.titre,
        categorie: item.categorie || "",
        support: item.support || [],
        type_creation: item.type_creation || "",
        date_type: item.date_type,
        date_debut: item.date_debut || "",
        date_fin: item.date_fin || "",
        nb_publications: item.nb_publications,
        commentaires: item.commentaires || "",
        liens: item.liens?.join("\n") || "",
        statut: item.statut,
        event_id: item.event_id || "",
      })
    } else {
      setFormData({
        titre: "",
        categorie: "",
        support: [],
        type_creation: "",
        date_type: "a_definir",
        date_debut: "",
        date_fin: "",
        nb_publications: 1,
        commentaires: "",
        liens: "",
        statut: "idee",
        event_id: defaultEventId || "",
      })
    }
  }, [item, defaultEventId, open])

  const handleSupportChange = (value: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, support: [...formData.support, value] })
    } else {
      setFormData({ ...formData, support: formData.support.filter((s) => s !== value) })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const dataToSave = {
        titre: formData.titre,
        categorie: formData.categorie || null,
        support: formData.support,
        type_creation: formData.type_creation || null,
        date_type: formData.date_type,
        date_debut: formData.date_debut || null,
        date_fin: formData.date_fin || null,
        nb_publications: formData.nb_publications,
        commentaires: formData.commentaires || null,
        liens: formData.liens
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
        statut: formData.statut,
        event_id: formData.event_id || null,
      }

      if (item) {
        const { error } = await supabase
          .from("editorial_calendar")
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("editorial_calendar").insert(dataToSave)
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Modifier le sujet" : "Nouveau sujet éditorial"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="titre">Titre *</Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Titre du sujet"
                required
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
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type_creation">Type de création</Label>
                <Select
                  value={formData.type_creation}
                  onValueChange={(v) => setFormData({ ...formData, type_creation: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {typeCreationOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Supports de publication</Label>
              <div className="grid grid-cols-4 gap-2">
                {supportOptions.map((support) => (
                  <label key={support.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={formData.support.includes(support.value)}
                      onCheckedChange={(checked) => handleSupportChange(support.value, checked as boolean)}
                    />
                    {support.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date_type">Type de date</Label>
              <Select value={formData.date_type} onValueChange={(v) => setFormData({ ...formData, date_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateTypeOptions.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.date_type !== "a_definir" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date_debut">
                    {formData.date_type === "mois" ? "Mois" : formData.date_type === "periode" ? "Date début" : "Date"}
                  </Label>
                  <Input
                    id="date_debut"
                    type={formData.date_type === "mois" ? "month" : "date"}
                    value={formData.date_debut}
                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  />
                </div>
                {formData.date_type === "periode" && (
                  <div className="grid gap-2">
                    <Label htmlFor="date_fin">Date fin</Label>
                    <Input
                      id="date_fin"
                      type="date"
                      value={formData.date_fin}
                      onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nb_publications">Nombre de publications</Label>
                <Input
                  id="nb_publications"
                  type="number"
                  min={1}
                  value={formData.nb_publications}
                  onChange={(e) => setFormData({ ...formData, nb_publications: Number.parseInt(e.target.value) || 1 })}
                />
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

            <div className="grid gap-2">
              <Label htmlFor="commentaires">Commentaires / Notes</Label>
              <Textarea
                id="commentaires"
                value={formData.commentaires}
                onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })}
                placeholder="Notes internes, rappels..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="liens">Liens (un par ligne)</Label>
              <Textarea
                id="liens"
                value={formData.liens}
                onChange={(e) => setFormData({ ...formData, liens: e.target.value })}
                placeholder="https://exemple.com&#10;https://autre-lien.com"
                rows={2}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent">
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : item ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
