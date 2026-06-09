-- =====================================================
-- Script 005: Suppression des tables de fichiers
-- Les fichiers sont désormais gérés via liens externes
-- (Google Drive, OneDrive, etc.) stockés dans les champs
-- existants (liens[] dans editorial_calendar, etc.)
-- =====================================================

-- Supprimer les politiques RLS avant de supprimer les tables
DROP POLICY IF EXISTS "editorial_files_select_authenticated" ON public.editorial_files;
DROP POLICY IF EXISTS "editorial_files_insert_authorized" ON public.editorial_files;
DROP POLICY IF EXISTS "editorial_files_delete_responsable" ON public.editorial_files;

DROP POLICY IF EXISTS "files_select_authenticated" ON public.files;
DROP POLICY IF EXISTS "files_insert_authenticated" ON public.files;
DROP POLICY IF EXISTS "files_delete_own_or_responsable" ON public.files;

-- Supprimer les tables
DROP TABLE IF EXISTS public.editorial_files CASCADE;
DROP TABLE IF EXISTS public.files CASCADE;
