"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EditorialTable } from "@/components/editorial/editorial-table"
import { EditorialCalendarView } from "@/components/editorial/editorial-calendar-view"
import { EditorialFilters } from "@/components/editorial/editorial-filters"
import { EditorialFormDialog } from "@/components/editorial/editorial-form-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Table, CalendarDays } from "lucide-react"
import type { EditorialCalendar, Event } from "@/types/database"

interface EditorialViewProps {
  items: EditorialCalendar[]
  events: Event[]
  canEdit: boolean
  filters: { event?: string; categorie?: string; statut?: string }
  currentView: string
}

export function EditorialView({ items, events, canEdit, filters, currentView }: EditorialViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EditorialCalendar | undefined>()

  const handleEdit = (item: EditorialCalendar) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setEditingItem(undefined)
    setIsFormOpen(true)
  }

  const handleClose = () => {
    setIsFormOpen(false)
    setEditingItem(undefined)
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-4">
        <EditorialFilters currentFilters={filters} />
        {canEdit && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau sujet
          </Button>
        )}
      </div>

      <Tabs defaultValue={currentView} className="flex-1 flex flex-col">
        <TabsList className="w-fit">
          <TabsTrigger value="table" className="gap-2">
            <Table className="h-4 w-4" />
            Tableau
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendrier
          </TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="flex-1 mt-4 overflow-auto">
          <EditorialTable items={items} canEdit={canEdit} onEdit={handleEdit} />
        </TabsContent>
        <TabsContent value="calendar" className="flex-1 mt-4 overflow-auto">
          <EditorialCalendarView items={items} onEdit={canEdit ? handleEdit : undefined} />
        </TabsContent>
      </Tabs>

      <EditorialFormDialog
        open={isFormOpen}
        onClose={handleClose}
        item={editingItem}
        events={events}
        defaultEventId={filters.event}
      />
    </div>
  )
}
