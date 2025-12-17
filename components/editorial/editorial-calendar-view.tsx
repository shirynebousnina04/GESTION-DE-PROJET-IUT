"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { EditorialCalendar } from "@/types/database"

interface EditorialCalendarViewProps {
  items: EditorialCalendar[]
  onEdit?: (item: EditorialCalendar) => void
}

const statusColors: Record<string, string> = {
  idee: "bg-gray-100 border-gray-300 text-gray-700",
  en_cours: "bg-blue-100 border-blue-300 text-blue-700",
  valide: "bg-green-100 border-green-300 text-green-700",
  publie: "bg-purple-100 border-purple-300 text-purple-700",
}

export function EditorialCalendarView({ items, onEdit }: EditorialCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const { weeks, monthItems } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Premier jour du mois
    const firstDay = new Date(year, month, 1)
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0)

    // Calculer le premier lundi à afficher
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7))

    // Générer les semaines
    const weeks: Date[][] = []
    const current = new Date(startDate)

    while (current <= lastDay || weeks.length < 6) {
      const week: Date[] = []
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
      weeks.push(week)
      if (weeks.length >= 6) break
    }

    // Filtrer les items du mois
    const monthItems = items.filter((item) => {
      if (!item.date_debut) return false
      const itemDate = new Date(item.date_debut)
      return itemDate.getMonth() === month && itemDate.getFullYear() === year
    })

    return { weeks, monthItems }
  }, [currentDate, items])

  const getItemsForDate = (date: Date) => {
    return items.filter((item) => {
      if (!item.date_debut) return false

      const itemStart = new Date(item.date_debut)
      itemStart.setHours(0, 0, 0, 0)

      const itemEnd = item.date_fin ? new Date(item.date_fin) : itemStart
      itemEnd.setHours(23, 59, 59, 999)

      const checkDate = new Date(date)
      checkDate.setHours(12, 0, 0, 0)

      return checkDate >= itemStart && checkDate <= itemEnd
    })
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth()
  const isToday = (date: Date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  }

  const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>
          {currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          <span className="ml-2 text-sm font-normal text-muted-foreground">({monthItems.length} sujets)</span>
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={prevMonth} className="bg-transparent">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="bg-transparent px-3"
          >
            Aujourd'hui
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="bg-transparent">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
          {/* Header des jours */}
          {daysOfWeek.map((day) => (
            <div key={day} className="bg-muted/50 p-2 text-center text-sm font-medium">
              {day}
            </div>
          ))}

          {/* Grille des jours */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="contents">
              {week.map((date, dayIndex) => {
                const dateItems = getItemsForDate(date)
                const inMonth = isCurrentMonth(date)
                const isTodayDate = isToday(date)

                return (
                  <div
                    key={dayIndex}
                    className={`min-h-[100px] bg-background p-1 ${
                      !inMonth ? "bg-muted/30" : ""
                    } ${isTodayDate ? "ring-2 ring-primary ring-inset" : ""}`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        !inMonth ? "text-muted-foreground" : ""
                      } ${isTodayDate ? "text-primary" : ""}`}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dateItems.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className={`text-xs p-1 rounded border truncate cursor-pointer hover:opacity-80 ${statusColors[item.statut]}`}
                          onClick={() => onEdit?.(item)}
                          title={item.titre}
                        >
                          {item.titre}
                        </div>
                      ))}
                      {dateItems.length > 3 && (
                        <div className="text-xs text-muted-foreground px-1">+{dateItems.length - 3} autres</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Légende */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs">
          <span className="text-muted-foreground">Statuts :</span>
          <Badge variant="outline" className="bg-gray-100">
            Idée
          </Badge>
          <Badge variant="outline" className="bg-blue-100">
            En cours
          </Badge>
          <Badge variant="outline" className="bg-green-100">
            Validé
          </Badge>
          <Badge variant="outline" className="bg-purple-100">
            Publié
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
