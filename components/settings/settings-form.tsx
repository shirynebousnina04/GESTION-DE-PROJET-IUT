"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Profile } from "@/types/database"

interface SettingsFormProps {
  profile: Profile
  users: Profile[]
}

const roleLabels: Record<string, string> = {
  responsable: "Responsable",
  charge_com: "Chargé(e) de communication",
  contributeur: "Contributeur",
}

export function SettingsForm({ profile, users }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: profile.name,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      setSuccess("Profil mis à jour avec succès")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

      if (error) throw error

      router.refresh()
    } catch (err) {
      console.error("Error updating role:", err)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profil personnel */}
      <Card>
        <CardHeader>
          <CardTitle>Mon profil</CardTitle>
          <CardDescription>Gérez vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled />
              <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Prénom Nom"
              />
            </div>

            <div className="grid gap-2">
              <Label>Rôle</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{roleLabels[profile.role]}</Badge>
                <span className="text-xs text-muted-foreground">Seul un responsable peut modifier les rôles</span>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Gestion des utilisateurs (responsable uniquement) */}
      {profile.role === "responsable" && users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gestion des utilisateurs</CardTitle>
            <CardDescription>Modifiez les rôles des membres de l'équipe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                    disabled={user.id === profile.id}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="responsable">Responsable</SelectItem>
                      <SelectItem value="charge_com">Chargé(e) de com</SelectItem>
                      <SelectItem value="contributeur">Contributeur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentation sécurité */}
      <Card>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
          <CardDescription>Informations sur la sécurité de l'application</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm text-muted-foreground">
          <ul className="list-disc pl-4 space-y-2 text-sm">
            <li>
              <strong>Authentification</strong> : Connexion sécurisée via email et mot de passe avec Supabase Auth
            </li>
            <li>
              <strong>Protection des données</strong> : Row Level Security (RLS) active sur toutes les tables
            </li>
            <li>
              <strong>Rôles</strong> :
              <ul className="list-circle pl-4 mt-1">
                <li>Responsable : accès complet, gestion des utilisateurs</li>
                <li>Chargé(e) de com : création et modification des contenus</li>
                <li>Contributeur : consultation et commentaires</li>
              </ul>
            </li>
            <li>
              <strong>Sessions</strong> : Tokens rafraîchis automatiquement, cookies HTTP-only
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
