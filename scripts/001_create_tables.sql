-- =====================================================
-- Script 001: Création des tables principales
-- Application: Gestion d'événements et organisation éditoriale IUT
-- =====================================================

-- Table des profils utilisateurs (extension de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'contributeur' CHECK (role IN ('responsable', 'charge_com', 'contributeur')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des événements
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  description TEXT,
  date_debut DATE,
  date_fin DATE,
  lieu TEXT,
  edition_annee INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  type TEXT,
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'planifie', 'en_cours', 'termine', 'annule')),
  responsable_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des tâches
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL CHECK (phase IN ('pre_evenement', 'evenement', 'post_evenement')),
  domaine TEXT CHECK (domaine IN ('communication', 'logistique', 'administratif', 'technique', 'autre')),
  statut TEXT NOT NULL DEFAULT 'a_faire' CHECK (statut IN ('a_faire', 'en_cours', 'termine', 'bloque')),
  date_echeance DATE,
  responsable_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table du calendrier éditorial
CREATE TABLE IF NOT EXISTS public.editorial_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  categorie TEXT CHECK (categorie IN ('IUT', 'MMI', 'GEII', 'GBIO', 'TC', 'GEAT', 'GEAD', 'GIM', 'GMP')),
  support TEXT[] DEFAULT '{}',
  type_creation TEXT CHECK (type_creation IN ('video', 'post', 'reel', 'affiche', 'story', 'article', 'autre')),
  date_type TEXT NOT NULL DEFAULT 'a_definir' CHECK (date_type IN ('date_precise', 'mois', 'periode', 'a_definir')),
  date_debut DATE,
  date_fin DATE,
  nb_publications INTEGER DEFAULT 1,
  publications_dates DATE[] DEFAULT '{}',
  commentaires TEXT,
  liens TEXT[] DEFAULT '{}',
  statut TEXT NOT NULL DEFAULT 'idee' CHECK (statut IN ('idee', 'en_cours', 'valide', 'publie')),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des fichiers éditoriaux
CREATE TABLE IF NOT EXISTS public.editorial_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  editorial_id UUID NOT NULL REFERENCES public.editorial_calendar(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des éditions de newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  date_envoi DATE,
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'envoyee')),
  annee INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des sujets de newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES public.newsletter_editions(id) ON DELETE SET NULL,
  sujet TEXT NOT NULL,
  notes TEXT,
  categorie TEXT CHECK (categorie IN ('prochainement', 'actualite', 'ne_pas_manquer')),
  statut TEXT NOT NULL DEFAULT 'idee' CHECK (statut IN ('idee', 'en_preparation', 'publie')),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  annee INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des commentaires (polymorphique)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  editorial_id UUID REFERENCES public.editorial_calendar(id) ON DELETE CASCADE,
  newsletter_topic_id UUID REFERENCES public.newsletter_topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des retours d'expérience
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  points_forts TEXT,
  points_faibles TEXT,
  suggestions TEXT,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des fichiers partagés
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances des requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_events_edition_annee ON public.events(edition_annee);
CREATE INDEX IF NOT EXISTS idx_events_responsable ON public.events(responsable_id);
CREATE INDEX IF NOT EXISTS idx_tasks_event ON public.tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_responsable ON public.tasks(responsable_id);
CREATE INDEX IF NOT EXISTS idx_editorial_event ON public.editorial_calendar(event_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_topics_edition ON public.newsletter_topics(edition_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_topics_event ON public.newsletter_topics(event_id);
CREATE INDEX IF NOT EXISTS idx_comments_event ON public.comments(event_id);
CREATE INDEX IF NOT EXISTS idx_comments_task ON public.comments(task_id);
CREATE INDEX IF NOT EXISTS idx_feedback_event ON public.feedback(event_id);
