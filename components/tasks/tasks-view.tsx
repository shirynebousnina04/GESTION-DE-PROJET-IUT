"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TasksList } from "@/components/tasks/tasks-list"
import { TasksGantt } from "@/components/tasks/tasks-gantt"
import { TaskFilters } from "@/components/tasks/task-filters"
import { TaskFormDialog } from "@/components/tasks/task-form-dialog"
import { Button } from "@/components/ui/button"
import { Plus, List, BarChart3 } from "lucide-react"
import type { Task, Event, Profile } from "@/types/database"

interface TasksViewProps {
  tasks: Task[]
  events: Event[]
  users: Profile[]
  canEdit: boolean
  filters: { event?: string; phase?: string; statut?: string }
}

export function TasksView({ tasks, events, users, canEdit, filters }: TasksViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setEditingTask(undefined)
    setIsFormOpen(true)
  }

  const handleClose = () => {
    setIsFormOpen(false)
    setEditingTask(undefined)
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-4">
        <TaskFilters events={events} currentFilters={filters} />
        {canEdit && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle tâche
          </Button>
        )}
      </div>

      <Tabs defaultValue="list" className="flex-1 flex flex-col">
        <TabsList className="w-fit">
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            Liste
          </TabsTrigger>
          <TabsTrigger value="gantt" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Gantt
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="flex-1 mt-4">
          <TasksList tasks={tasks} canEdit={canEdit} onEdit={handleEdit} />
        </TabsContent>
        <TabsContent value="gantt" className="flex-1 mt-4 overflow-auto">
          <TasksGantt tasks={tasks} />
        </TabsContent>
      </Tabs>

      <TaskFormDialog
        open={isFormOpen}
        onClose={handleClose}
        task={editingTask}
        events={events}
        users={users}
        defaultEventId={filters.event}
      />
    </div>
  )
}
