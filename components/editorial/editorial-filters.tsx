"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface EditorialFiltersProps {
  currentFilters: { event?: string; categorie?: string; statut?: string }
}

const categorieOptions = [
  { value: "IUT", label: "IUT" },
  { value: "MMI", label: "MMI" },
  { value: "GEII", label: "GEII" },
  { value: "GBIO", label: "GBIO" },
  { value: "TC", label: "TC" },
  { value: "GEAT", label: "GEAT" },
  { value: "GEAD", label: "GEAD" },
  { value: "GIM", label: "GIM" },
  { value: "GMP", label: "GMP" },
]

const statusOptions = [
  { value: "idee", label: "Idée" },
  { value: "en_cours", label: "En cours" },
  { value: "valide", label: "Validé" },
  { value: "publie", label: "Publié" },
]

export function EditorialFilters({ currentFilters }: EditorialFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/dashboard/editorial?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/dashboard/editorial")
  }

  const hasFilters = currentFilters.event || currentFilters.categorie || currentFilters.statut

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={currentFilters.categorie || ""} onValueChange={(v) => updateFilter("categorie", v || null)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes</SelectItem>
          {categorieOptions.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentFilters.statut || ""} onValueChange={(v) => updateFilter("statut", v || null)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
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
