export type UserRole = "responsable" | "charge_com" | "contributeur"

export type EventStatus = "brouillon" | "planifie" | "en_cours" | "termine" | "annule"

export type TaskPhase = "pre_evenement" | "evenement" | "post_evenement"

export type TaskDomain = "communication" | "logistique" | "administratif" | "technique" | "autre"

export type TaskStatus = "a_faire" | "en_cours" | "termine" | "bloque"

export type EditorialCategory = "IUT" | "MMI" | "GEII" | "GBIO" | "TC" | "GEAT" | "GEAD" | "GIM" | "GMP"

export type EditorialSupport =
  | "instagram"
  | "facebook"
  | "site_web"
  | "tv"
  | "linkedin"
  | "twitter"
  | "youtube"
  | "tiktok"

export type EditorialCreationType = "video" | "post" | "reel" | "affiche" | "story" | "article" | "autre"

export type EditorialDateType = "date_precise" | "mois" | "periode" | "a_definir"

export type EditorialStatus = "idee" | "en_cours" | "valide" | "publie"

export type NewsletterTopicCategory = "prochainement" | "actualite" | "ne_pas_manquer"

export type NewsletterTopicStatus = "idee" | "en_preparation" | "publie"

export type NewsletterEditionStatus = "brouillon" | "envoyee"

export interface Profile {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  titre: string
  description: string | null
  date_debut: string | null
  date_fin: string | null
  lieu: string | null
  edition_annee: number
  type: string | null
  statut: EventStatus
  responsable_id: string | null
  template_id: string | null
  created_at: string
  updated_at: string
  // Relations
  responsable?: Profile
  tasks?: Task[]
  editorial_items?: EditorialCalendar[]
  newsletter_topics?: NewsletterTopic[]
  feedback?: Feedback[]
  comments?: Comment[]
}

export interface Task {
  id: string
  event_id: string
  titre: string
  description: string | null
  phase: TaskPhase
  domaine: TaskDomain | null
  statut: TaskStatus
  date_echeance: string | null
  responsable_id: string | null
  ordre: number
  created_at: string
  updated_at: string
  // Relations
  event?: Event
  responsable?: Profile
  comments?: Comment[]
}

export interface EditorialCalendar {
  id: string
  titre: string
  categorie: EditorialCategory | null
  support: string[]
  type_creation: EditorialCreationType | null
  date_type: EditorialDateType
  date_debut: string | null
  date_fin: string | null
  nb_publications: number
  publications_dates: string[]
  commentaires: string | null
  liens: string[]
  statut: EditorialStatus
  event_id: string | null
  created_at: string
  updated_at: string
  // Relations
  event?: Event
  comments?: Comment[]
}

export interface NewsletterEdition {
  id: string
  numero: string
  date_envoi: string | null
  statut: NewsletterEditionStatus
  annee: number
  created_at: string
  // Relations
  topics?: NewsletterTopic[]
}

export interface NewsletterTopic {
  id: string
  edition_id: string | null
  sujet: string
  notes: string | null
  categorie: NewsletterTopicCategory | null
  statut: NewsletterTopicStatus
  event_id: string | null
  annee: number
  created_at: string
  updated_at: string
  // Relations
  edition?: NewsletterEdition
  event?: Event
  comments?: Comment[]
}

export interface Comment {
  id: string
  content: string
  user_id: string
  event_id: string | null
  task_id: string | null
  editorial_id: string | null
  newsletter_topic_id: string | null
  created_at: string
  // Relations
  user?: Profile
}

export interface Feedback {
  id: string
  event_id: string
  points_forts: string | null
  points_faibles: string | null
  suggestions: string | null
  user_id: string
  created_at: string
  // Relations
  event?: Event
  user?: Profile
}
