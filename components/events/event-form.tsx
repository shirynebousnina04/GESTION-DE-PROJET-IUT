"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Event, Profile } from "@/types/database"

interface EventFormProps {
  event?: Event
  users: Profile[]
  currentUserId: string
}

const eventTypes = [
  { value: "conference", label: "Conférence" },
  { value: "atelier", label: "Atelier" },
  { value: "portes_ouvertes", label: "Portes ouvertes" },
  { value: "ceremonie", label: "Cérémonie" },
  { value: "salon", label: "Salon" },
  { value: "competition", label: "Compétition" },
  { value: "autre", label: "Autre" },
]

const statusOptions = [
  { value: "brouillon", label: "Brouillon" },
  { value: "planifie", label: "Planifié" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
  { value: "annule", label: "Annulé" },
]

export function EventForm({ event, users, currentUserId }: EventFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    titre: event?.titre || "",
    description: event?.description || "",
    date_debut: event?.date_debut || "",
    date_fin: event?.date_fin || "",
    lieu: event?.lieu || "",
    type: event?.type || "",
    statut: event?.statut || "brouillon",
    edition_annee: event?.edition_annee || new Date().getFullYear(),
    responsable_id: event?.responsable_id || currentUserId,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      console.log("[v0] Submitting event form with data:", formData)

      // Vérifier d'abord le profil de l'utilisateur pour le debug
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUserId)
        .single()

      console.log("[v0] Current user profile:", profile, "Error:", profileError)

      if (profileError) {
        throw new Error(`Erreur de profil: ${profileError.message}. Vérifiez que les scripts SQL ont été exécutés.`)
      }

      if (profile?.role === "contributeur") {
        throw new Error(
          "Vous n'avez pas les droits pour créer/modifier des événements. Votre rôle actuel est 'contributeur'. Exécutez le script 004 pour vous promouvoir en 'responsable'.",
        )
      }

      if (event) {
        // Mise à jour
        const { error } = await supabase
          .from("events")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", event.id)

        console.log("[v0] Update result - Error:", error)
        if (error) throw new Error(`Erreur de mise à jour: ${error.message} (Code: ${error.code})`)
      } else {
        // Création
        const { data, error } = await supabase.from("events").insert(formData).select()
        console.log("[v0] Insert result - Data:", data, "Error:", error)
        if (error) throw new Error(`Erreur de création: ${error.message} (Code: ${error.code})`)
      }

      router.push("/dashboard/events")
      router.refresh()
    } catch (err) {
      console.error("[v0] Form submission error:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="titre">Titre *</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Nom de l'événement"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de l'événement..."
                  rows={4}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="date_debut">Date de début</Label>
                  <Input
                    id="date_debut"
                    type="date"
                    value={formData.date_debut}
                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date_fin">Date de fin</Label>
                  <Input
                    id="date_fin"
                    type="date"
                    value={formData.date_fin}
                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lieu">Lieu</Label>
                <Input
                  id="lieu"
                  value={formData.lieu}
                  onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                  placeholder="Lieu de l'événement"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type d'événement</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="statut">Statut</Label>
                <Select
                  value={formData.statut}
                  onValueChange={(value) => setFormData({ ...formData, statut: value as typeof formData.statut })}
                >
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
                <Label htmlFor="edition_annee">Édition (année)</Label>
                <Input
                  id="edition_annee"
                  type="number"
                  value={formData.edition_annee}
                  onChange={(e) => setFormData({ ...formData, edition_annee: Number.parseInt(e.target.value) })}
                  min={2020}
                  max={2100}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="responsable_id">Responsable</Label>
                <Select
                  value={formData.responsable_id}
                  onValueChange={(value) => setFormData({ ...formData, responsable_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : event ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
