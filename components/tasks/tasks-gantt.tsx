"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { Task } from "@/types/database"

interface TasksGanttProps {
  tasks: Task[]
}

const phaseColors: Record<string, string> = {
  pre_evenement: "bg-blue-500",
  evenement: "bg-green-500",
  post_evenement: "bg-orange-500",
}

const statusOpacity: Record<string, string> = {
  a_faire: "opacity-40",
  en_cours: "opacity-70",
  termine: "opacity-100",
  bloque: "opacity-30",
}

export function TasksGantt({ tasks }: TasksGanttProps) {
  const { tasksWithDates, dateRange, weeks } = useMemo(() => {
    // Filtrer les tâches avec dates d'échéance
    const tasksWithDates = tasks.filter((t) => t.date_echeance)

    if (tasksWithDates.length === 0) {
      return { tasksWithDates: [], dateRange: { start: new Date(), end: new Date() }, weeks: [] }
    }

    // Calculer la plage de dates
    const dates = tasksWithDates.map((t) => new Date(t.date_echeance!))
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

    // Étendre la plage d'une semaine de chaque côté
    minDate.setDate(minDate.getDate() - 7)
    maxDate.setDate(maxDate.getDate() + 7)

    // Générer les semaines
    const weeks: Date[] = []
    const current = new Date(minDate)
    current.setDate(current.getDate() - current.getDay() + 1) // Lundi

    while (current <= maxDate) {
      weeks.push(new Date(current))
      current.setDate(current.getDate() + 7)
    }

    return {
      tasksWithDates,
      dateRange: { start: minDate, end: maxDate },
      weeks,
    }
  }, [tasks])

  if (tasksWithDates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            Aucune tâche avec date d'échéance. Ajoutez des dates pour voir le diagramme de Gantt.
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))

  const getPosition = (date: Date) => {
    const days = Math.ceil((date.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
    return (days / totalDays) * 100
  }

  const formatWeek = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header avec les semaines */}
            <div className="flex border-b mb-4 pb-2">
              <div className="w-48 shrink-0 font-medium text-sm">Tâche</div>
              <div className="flex-1 flex">
                {weeks.map((week, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center text-xs text-muted-foreground border-l first:border-l-0 px-1"
                  >
                    {formatWeek(week)}
                  </div>
                ))}
              </div>
            </div>

            {/* Tâches */}
            <div className="space-y-2">
              {tasksWithDates.map((task) => {
                const position = getPosition(new Date(task.date_echeance!))
                const color = phaseColors[task.phase] || "bg-gray-500"
                const opacity = statusOpacity[task.statut] || "opacity-50"

                return (
                  <div key={task.id} className="flex items-center h-8">
                    <div className="w-48 shrink-0 text-sm truncate pr-2" title={task.titre}>
                      {task.titre}
                    </div>
                    <div className="flex-1 relative h-6 bg-muted/30 rounded">
                      {/* Grille des semaines */}
                      {weeks.map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 border-l border-muted first:border-l-0"
                          style={{ left: `${(i / weeks.length) * 100}%` }}
                        />
                      ))}
                      {/* Marqueur de la tâche */}
                      <div
                        className={`absolute top-1 h-4 w-4 rounded-full ${color} ${opacity}`}
                        style={{ left: `calc(${position}% - 8px)` }}
                        title={`${task.titre} - ${new Date(task.date_echeance!).toLocaleDateString("fr-FR")}`}
                      />
                      {/* Ligne jusqu'à aujourd'hui si en cours */}
                      {task.statut === "en_cours" && (
                        <div
                          className={`absolute top-2.5 h-1 ${color} opacity-30 rounded`}
                          style={{
                            left: `${Math.min(getPosition(new Date()), position)}%`,
                            width: `${Math.abs(position - getPosition(new Date()))}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Ligne "Aujourd'hui" */}
            <div className="relative mt-4 h-0">
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-destructive -mt-[calc(100%+1rem)]"
                style={{
                  left: `calc(192px + ${getPosition(new Date())}% * (100% - 192px) / 100)`,
                  height: `${tasksWithDates.length * 2 + 2}rem`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Légende */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t text-xs">
          <span className="text-muted-foreground">Phases :</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" /> Pré-événement
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500" /> Événement
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-500" /> Post-événement
          </span>
          <span className="text-muted-foreground ml-4">|</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-500 opacity-40" /> À faire
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-500 opacity-70" /> En cours
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-500" /> Terminé
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
