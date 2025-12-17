"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NewsletterEditionDialogProps {
  open: boolean
  onClose: () => void
  currentYear: number
}

export function NewsletterEditionDialog({ open, onClose, currentYear }: NewsletterEditionDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    numero: "",
    date_envoi: "",
    statut: "brouillon" as string,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("newsletter_editions").insert({
        numero: formData.numero,
        date_envoi: formData.date_envoi || null,
        statut: formData.statut,
        annee: currentYear,
      })

      if (error) throw error

      router.refresh()
      onClose()
      setFormData({ numero: "", date_envoi: "", statut: "brouillon" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Nouvelle édition de newsletter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="numero">Numéro / Identifiant *</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                placeholder={`${currentYear}-01`}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date_envoi">Date d'envoi prévue</Label>
              <Input
                id="date_envoi"
                type="date"
                value={formData.date_envoi}
                onChange={(e) => setFormData({ ...formData, date_envoi: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="statut">Statut</Label>
              <Select value={formData.statut} onValueChange={(v) => setFormData({ ...formData, statut: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="envoyee">Envoyée</SelectItem>
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
              {isLoading ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
