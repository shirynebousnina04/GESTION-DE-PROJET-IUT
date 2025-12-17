"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, MoreHorizontal, Edit, Trash, ExternalLink } from "lucide-react"
import type { EditorialCalendar } from "@/types/database"
import { formatShortDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface EditorialTableProps {
  items: EditorialCalendar[]
  canEdit: boolean
  onEdit: (item: EditorialCalendar) => void
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  idee: { label: "Idée", variant: "outline" },
  en_cours: { label: "En cours", variant: "default" },
  valide: { label: "Validé", variant: "secondary" },
  publie: { label: "Publié", variant: "secondary" },
}

const supportIcons: Record<string, string> = {
  instagram: "IG",
  facebook: "FB",
  site_web: "Web",
  tv: "TV",
  linkedin: "LI",
  twitter: "X",
  youtube: "YT",
  tiktok: "TT",
}

export function EditorialTable({ items, canEdit, onEdit }: EditorialTableProps) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce sujet ?")) return

    const supabase = createClient()
    await supabase.from("editorial_calendar").delete().eq("id", id)
    router.refresh()
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Aucun sujet éditorial</h3>
          <p className="text-sm text-muted-foreground">Créez votre premier sujet pour commencer.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Titre</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Catégorie</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Supports</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Événement</th>
              {canEdit && <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const status = statusLabels[item.statut] || statusLabels.idee
              return (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium">{item.titre}</span>
                      {item.commentaires && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.commentaires}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.categorie && <Badge variant="outline">{item.categorie}</Badge>}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {item.support?.map((s) => (
                        <span key={s} className="text-xs px-1.5 py-0.5 rounded bg-muted">
                          {supportIcons[s] || s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">{item.type_creation?.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-sm">
                    {item.date_type === "date_precise" && item.date_debut && formatShortDate(item.date_debut)}
                    {item.date_type === "periode" &&
                      item.date_debut &&
                      item.date_fin &&
                      `${formatShortDate(item.date_debut)} - ${formatShortDate(item.date_fin)}`}
                    {item.date_type === "mois" && item.date_debut && (
                      <span>
                        {new Date(item.date_debut).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                      </span>
                    )}
                    {item.date_type === "a_definir" && <span className="text-muted-foreground">À définir</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {item.event && (
                      <span className="text-muted-foreground truncate max-w-[120px] block">{item.event.titre}</span>
                    )}
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          {item.liens && item.liens.length > 0 && (
                            <DropdownMenuItem onClick={() => window.open(item.liens[0], "_blank")}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Ouvrir le lien
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
