"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Mail, Send, ChevronLeft, ChevronRight } from "lucide-react"
import { NewsletterTopicsList } from "@/components/newsletter/newsletter-topics-list"
import { NewsletterEditionDialog } from "@/components/newsletter/newsletter-edition-dialog"
import { NewsletterTopicDialog } from "@/components/newsletter/newsletter-topic-dialog"
import type { NewsletterEdition, NewsletterTopic, Event } from "@/types/database"
import { formatDate } from "@/lib/format"

interface NewsletterViewProps {
  editions: NewsletterEdition[]
  topics: NewsletterTopic[]
  events: Event[]
  canEdit: boolean
  currentYear: number
  selectedEdition?: string
}

export function NewsletterView({
  editions,
  topics,
  events,
  canEdit,
  currentYear,
  selectedEdition,
}: NewsletterViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isEditionDialogOpen, setIsEditionDialogOpen] = useState(false)
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<NewsletterTopic | undefined>()

  const handleYearChange = (direction: number) => {
    const newYear = currentYear + direction
    const params = new URLSearchParams(searchParams.toString())
    params.set("annee", newYear.toString())
    params.delete("edition")
    router.push(`/dashboard/newsletter?${params.toString()}`)
  }

  const handleEditionChange = (editionId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (editionId && editionId !== "all") {
      params.set("edition", editionId)
    } else {
      params.delete("edition")
    }
    router.push(`/dashboard/newsletter?${params.toString()}`)
  }

  const handleEditTopic = (topic: NewsletterTopic) => {
    setEditingTopic(topic)
    setIsTopicDialogOpen(true)
  }

  const handleCreateTopic = () => {
    setEditingTopic(undefined)
    setIsTopicDialogOpen(true)
  }

  const handleCloseTopicDialog = () => {
    setIsTopicDialogOpen(false)
    setEditingTopic(undefined)
  }

  // Grouper les sujets par catégorie
  const topicsByCategory = {
    prochainement: topics.filter((t) => t.categorie === "prochainement"),
    actualite: topics.filter((t) => t.categorie === "actualite"),
    ne_pas_manquer: topics.filter((t) => t.categorie === "ne_pas_manquer"),
    sans_categorie: topics.filter((t) => !t.categorie),
  }

  return (
    <div className="flex h-full">
      {/* Sidebar des éditions */}
      <div className="w-72 border-r bg-muted/30 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleYearChange(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold">{currentYear}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleYearChange(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {canEdit && (
            <Button size="sm" variant="outline" onClick={() => setIsEditionDialogOpen(true)} className="bg-transparent">
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <button
            type="button"
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !selectedEdition ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
            onClick={() => handleEditionChange("")}
          >
            Tous les sujets ({topics.length})
          </button>

          {editions.map((edition) => {
            const editionTopics = topics.filter((t) => t.edition_id === edition.id)
            return (
              <button
                type="button"
                key={edition.id}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedEdition === edition.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
                onClick={() => handleEditionChange(edition.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{edition.numero}</span>
                  {edition.statut === "envoyee" ? (
                    <Send className="h-3 w-3" />
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Brouillon
                    </Badge>
                  )}
                </div>
                {edition.date_envoi && <span className="text-xs opacity-70">{formatDate(edition.date_envoi)}</span>}
                <span className="text-xs opacity-70 block">{editionTopics.length} sujets</span>
              </button>
            )
          })}

          {editions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Aucune édition cette année</p>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">
              {selectedEdition
                ? `Édition ${editions.find((e) => e.id === selectedEdition)?.numero || ""}`
                : `Tous les sujets (${currentYear})`}
            </h2>
            {selectedEdition && (
              <Select value={selectedEdition} onValueChange={handleEditionChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les sujets</SelectItem>
                  {editions.map((edition) => (
                    <SelectItem key={edition.id} value={edition.id}>
                      {edition.numero}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {canEdit && (
            <Button onClick={handleCreateTopic}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau sujet
            </Button>
          )}
        </div>

        {topics.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Aucun sujet</h3>
              <p className="text-sm text-muted-foreground">
                {selectedEdition
                  ? "Cette édition ne contient pas encore de sujets."
                  : "Créez votre premier sujet de newsletter."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Prochainement ({topicsByCategory.prochainement.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NewsletterTopicsList
                  topics={topicsByCategory.prochainement}
                  canEdit={canEdit}
                  onEdit={handleEditTopic}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Actualité ({topicsByCategory.actualite.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NewsletterTopicsList topics={topicsByCategory.actualite} canEdit={canEdit} onEdit={handleEditTopic} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Ce qu'il ne fallait pas manquer ({topicsByCategory.ne_pas_manquer.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NewsletterTopicsList
                  topics={topicsByCategory.ne_pas_manquer}
                  canEdit={canEdit}
                  onEdit={handleEditTopic}
                />
              </CardContent>
            </Card>

            {topicsByCategory.sans_categorie.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    Sans catégorie ({topicsByCategory.sans_categorie.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NewsletterTopicsList
                    topics={topicsByCategory.sans_categorie}
                    canEdit={canEdit}
                    onEdit={handleEditTopic}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <NewsletterEditionDialog
        open={isEditionDialogOpen}
        onClose={() => setIsEditionDialogOpen(false)}
        currentYear={currentYear}
      />

      <NewsletterTopicDialog
        open={isTopicDialogOpen}
        onClose={handleCloseTopicDialog}
        topic={editingTopic}
        editions={editions}
        events={events}
        currentYear={currentYear}
        defaultEditionId={selectedEdition}
      />
    </div>
  )
}
