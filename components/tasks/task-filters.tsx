"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { Event } from "@/types/database"

interface TaskFiltersProps {
  events: Event[]
  currentFilters: { event?: string; phase?: string; statut?: string }
}

const phaseOptions = [
  { value: "pre_evenement", label: "Pré-événement" },
  { value: "evenement", label: "Événement" },
  { value: "post_evenement", label: "Post-événement" },
]

const statusOptions = [
  { value: "a_faire", label: "À faire" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
  { value: "bloque", label: "Bloqué" },
]

export function TaskFilters({ events, currentFilters }: TaskFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/dashboard/tasks?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/dashboard/tasks")
  }

  const hasFilters = currentFilters.event || currentFilters.phase || currentFilters.statut

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={currentFilters.event || ""} onValueChange={(v) => updateFilter("event", v || null)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Tous les événements" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les événements</SelectItem>
          {events.map((event) => (
            <SelectItem key={event.id} value={event.id}>
              {event.titre} ({event.edition_annee})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentFilters.phase || ""} onValueChange={(v) => updateFilter("phase", v || null)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Toutes les phases" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les phases</SelectItem>
          {phaseOptions.map((phase) => (
            <SelectItem key={phase.value} value={phase.value}>
              {phase.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentFilters.statut || ""} onValueChange={(v) => updateFilter("statut", v || null)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Tous les statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          {statusOptions.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
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
  )
}
