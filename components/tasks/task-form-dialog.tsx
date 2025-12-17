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
import type { Task, Event, Profile } from "@/types/database"

interface TaskFormDialogProps {
  open: boolean
  onClose: () => void
  task?: Task
  events: Event[]
  users: Profile[]
  defaultEventId?: string
}

const phaseOptions = [
  { value: "pre_evenement", label: "Pré-événement" },
  { value: "evenement", label: "Événement" },
  { value: "post_evenement", label: "Post-événement" },
]

const domaineOptions = [
  { value: "communication", label: "Communication" },
  { value: "logistique", label: "Logistique" },
  { value: "administratif", label: "Administratif" },
  { value: "technique", label: "Technique" },
  { value: "autre", label: "Autre" },
]

const statusOptions = [
  { value: "a_faire", label: "À faire" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
  { value: "bloque", label: "Bloqué" },
]

export function TaskFormDialog({ open, onClose, task, events, users, defaultEventId }: TaskFormDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    event_id: defaultEventId || "",
    phase: "pre_evenement" as string,
    domaine: "" as string,
    statut: "a_faire" as string,
    date_echeance: "",
    responsable_id: "",
  })

  useEffect(() => {
    if (task) {
      setFormData({
        titre: task.titre,
        description: task.description || "",
        event_id: task.event_id,
        phase: task.phase,
        domaine: task.domaine || "",
        statut: task.statut,
        date_echeance: task.date_echeance || "",
        responsable_id: task.responsable_id || "",
      })
    } else {
      setFormData({
        titre: "",
        description: "",
        event_id: defaultEventId || "",
        phase: "pre_evenement",
        domaine: "",
        statut: "a_faire",
        date_echeance: "",
        responsable_id: "",
      })
    }
  }, [task, defaultEventId, open])

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
        ...formData,
        domaine: formData.domaine || null,
        responsable_id: formData.responsable_id || null,
        date_echeance: formData.date_echeance || null,
      }

      if (task) {
        const { error } = await supabase
          .from("tasks")
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq("id", task.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("tasks").insert(dataToSave)
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
          <DialogTitle>{task ? "Modifier la tâche" : "Nouvelle tâche"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="titre">Titre *</Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Nom de la tâche"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event_id">Événement *</Label>
              <Select value={formData.event_id} onValueChange={(v) => setFormData({ ...formData, event_id: v })}>
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la tâche..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phase">Phase *</Label>
                <Select value={formData.phase} onValueChange={(v) => setFormData({ ...formData, phase: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {phaseOptions.map((phase) => (
                      <SelectItem key={phase.value} value={phase.value}>
                        {phase.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="domaine">Domaine</Label>
                <Select
                  value={formData.domaine}
                  onValueChange={(v) => setFormData({ ...formData, domaine: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {domaineOptions.map((domaine) => (
                      <SelectItem key={domaine.value} value={domaine.value}>
                        {domaine.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div className="grid gap-2">
                <Label htmlFor="date_echeance">Date d'échéance</Label>
                <Input
                  id="date_echeance"
                  type="date"
                  value={formData.date_echeance}
                  onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="responsable_id">Responsable</Label>
              <Select
                value={formData.responsable_id}
                onValueChange={(v) => setFormData({ ...formData, responsable_id: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Non assigné" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Non assigné</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
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
              {isLoading ? "Enregistrement..." : task ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
