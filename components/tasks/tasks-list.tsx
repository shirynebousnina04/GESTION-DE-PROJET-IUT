"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarDays, MoreHorizontal, Edit, Trash, CheckSquare, User } from "lucide-react"
import type { Task } from "@/types/database"
import { formatShortDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface TasksListProps {
  tasks: Task[]
  canEdit: boolean
  onEdit: (task: Task) => void
}

const phaseLabels: Record<string, { label: string; color: string }> = {
  pre_evenement: { label: "Pré-événement", color: "bg-blue-100 text-blue-800" },
  evenement: { label: "Événement", color: "bg-green-100 text-green-800" },
  post_evenement: { label: "Post-événement", color: "bg-orange-100 text-orange-800" },
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  a_faire: { label: "À faire", variant: "outline" },
  en_cours: { label: "En cours", variant: "default" },
  termine: { label: "Terminé", variant: "secondary" },
  bloque: { label: "Bloqué", variant: "destructive" },
}

const domaineLabels: Record<string, string> = {
  communication: "Com",
  logistique: "Log",
  administratif: "Admin",
  technique: "Tech",
  autre: "Autre",
}

export function TasksList({ tasks, canEdit, onEdit }: TasksListProps) {
  const router = useRouter()

  const handleStatusToggle = async (task: Task) => {
    const supabase = createClient()
    const newStatus = task.statut === "termine" ? "a_faire" : "termine"

    await supabase.from("tasks").update({ statut: newStatus, updated_at: new Date().toISOString() }).eq("id", task.id)

    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) return

    const supabase = createClient()
    await supabase.from("tasks").delete().eq("id", id)
    router.refresh()
  }

  // Grouper les tâches par phase
  const groupedTasks = tasks.reduce(
    (acc, task) => {
      const phase = task.phase
      if (!acc[phase]) acc[phase] = []
      acc[phase].push(task)
      return acc
    },
    {} as Record<string, Task[]>,
  )

  const phases = ["pre_evenement", "evenement", "post_evenement"]

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckSquare className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Aucune tâche</h3>
          <p className="text-sm text-muted-foreground">Créez votre première tâche pour commencer.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {phases.map((phase) => {
        const phaseTasks = groupedTasks[phase]
        if (!phaseTasks || phaseTasks.length === 0) return null

        const phaseInfo = phaseLabels[phase]

        return (
          <div key={phase}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${phaseInfo.color}`}>{phaseInfo.label}</span>
              <span className="text-sm text-muted-foreground">({phaseTasks.length})</span>
            </div>
            <div className="space-y-2">
              {phaseTasks.map((task) => {
                const status = statusLabels[task.statut]
                const isOverdue =
                  task.date_echeance && new Date(task.date_echeance) < new Date() && task.statut !== "termine"

                return (
                  <Card key={task.id} className={isOverdue ? "border-destructive/50" : ""}>
                    <CardContent className="flex items-center gap-4 p-4">
                      {canEdit && (
                        <Checkbox
                          checked={task.statut === "termine"}
                          onCheckedChange={() => handleStatusToggle(task)}
                          className="h-5 w-5"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-medium ${task.statut === "termine" ? "line-through text-muted-foreground" : ""}`}
                          >
                            {task.titre}
                          </span>
                          <Badge variant={status.variant}>{status.label}</Badge>
                          {task.domaine && (
                            <span className="text-xs px-2 py-0.5 rounded bg-muted">{domaineLabels[task.domaine]}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {task.event && <span>{task.event.titre}</span>}
                          {task.date_echeance && (
                            <span className={`flex items-center gap-1 ${isOverdue ? "text-destructive" : ""}`}>
                              <CalendarDays className="h-3 w-3" />
                              {formatShortDate(task.date_echeance)}
                            </span>
                          )}
                          {task.responsable && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {task.responsable.name}
                            </span>
                          )}
                        </div>
                      </div>
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(task)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-destructive">
                              <Trash className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
