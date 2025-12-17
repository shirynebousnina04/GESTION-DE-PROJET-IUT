-- =====================================================
-- Script 002: Activation de Row Level Security (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Politiques RLS pour PROFILES
-- =====================================================
-- Tous les utilisateurs authentifiés peuvent voir tous les profils
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- Politiques RLS pour EVENTS
-- =====================================================
-- Tous les utilisateurs authentifiés peuvent voir les événements
CREATE POLICY "events_select_authenticated" ON public.events
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Responsables et chargés de com peuvent créer des événements
CREATE POLICY "events_insert_authorized" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('responsable', 'charge_com')
    )
  );

-- Responsables et chargés de com peuvent modifier les événements
CREATE POLICY "events_update_authorized" ON public.events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('responsable', 'charge_com')
    )
  );

-- Seuls les responsables peuvent supprimer les événements
CREATE POLICY "events_delete_responsable" ON public.events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'responsable'
    )
  );

-- =====================================================
-- Politiques RLS pour TASKS
-- =====================================================
CREATE POLICY "tasks_select_authenticated" ON public.tasks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "tasks_insert_authorized" ON public.tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('responsable', 'charge_com')
    )
  );

CREATE POLICY "tasks_update_authorized" ON public.tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('responsable', 'charge_com')
    )
  );

CREATE POLICY "tasks_delete_responsable" ON public.tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'responsable'
    )
  );

-- =====================================================
-- Politiques RLS pour EDITORIAL_CALENDAR
-- =====================================================
CREATE POLICY "editorial_select_authenticated" ON public.editorial_calendar
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "editorial_insert_authorized" ON public.editorial_calendar
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('responsable', 'charge_com')
    )
  );

CREATE POLICY "editorial_update_authorized" ON public.editorial_calendar
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('responsable', 'charge_com')
    )
  );

CREATE POLICY "editorial_delete_responsable" ON public.editorial_calendar
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'responsable'
    )
  );

-- =====================================================
-- Politiques RLS pour EDITORIAL_FILES
-- =====================================================
CREATE POLICY "editorial_files_select_authenticated" ON public.editorial_files
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "editorial_files_insert_authorized" ON public.editorial_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('responsable', 'charge_com')
    )
  );

CREATE POLICY "editorial_files_delete_responsable" ON public.editorial_files
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'responsable'
    )
  );

-- =====================================================
-- Politiques RLS pour NEWSLETTER_EDITIONS
-- =====================================================
CREATE POLICY "newsletter_editions_select_authenticated" ON public.newsletter_editions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "newsletter_editions_insert_authorized" ON public.newsletter_editions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('responsable', 'charge_com')
    )
  );

CREATE POLICY "newsletter_editions_update_authorized" ON public.newsletter_editions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('responsable', 'charge_com')
    )
  );

CREATE POLICY "newsletter_editions_delete_responsable" ON public.newsletter_editions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'responsable'
    )
  );

-- =====================================================
-- Politiques RLS pour NEWSLETTER_TOPICS
-- =====================================================
CREATE POLICY "newsletter_topics_select_authenticated" ON public.newsletter_topics
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "newsletter_topics_insert_authorized" ON public.newsletter_topics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('responsable', 'charge_com')
    )
  );

CREATE POLICY "newsletter_topics_update_authorized" ON public.newsletter_topics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('responsable', 'charge_com')
    )
  );

CREATE POLICY "newsletter_topics_delete_responsable" ON public.newsletter_topics
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'responsable'
    )
  );

-- =====================================================
-- Politiques RLS pour COMMENTS (tous peuvent commenter)
-- =====================================================
CREATE POLICY "comments_select_authenticated" ON public.comments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "comments_insert_authenticated" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update_own" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "comments_delete_own_or_responsable" ON public.comments
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'responsable'
    )
  );

-- =====================================================
-- Politiques RLS pour FEEDBACK
-- =====================================================
CREATE POLICY "feedback_select_authenticated" ON public.feedback
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "feedback_insert_authenticated" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feedback_update_own" ON public.feedback
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "feedback_delete_own_or_responsable" ON public.feedback
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'responsable'
    )
  );

-- =====================================================
-- Politiques RLS pour FILES (tous peuvent ajouter des fichiers)
-- =====================================================
CREATE POLICY "files_select_authenticated" ON public.files
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "files_insert_authenticated" ON public.files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "files_delete_own_or_responsable" ON public.files
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'responsable'
    )
  );
