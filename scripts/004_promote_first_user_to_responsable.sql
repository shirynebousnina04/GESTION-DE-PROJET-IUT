-- =====================================================
-- Script 004: Promouvoir le premier utilisateur en responsable
-- =====================================================
-- Ce script met à jour le rôle du premier utilisateur inscrit
-- pour lui donner le rôle "responsable" (administrateur)

-- Option 1: Promouvoir le premier utilisateur créé
UPDATE public.profiles
SET role = 'responsable'
WHERE id = (
  SELECT id 
  FROM public.profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Vérification: afficher les utilisateurs et leurs rôles
SELECT id, email, name, role, created_at 
FROM public.profiles 
ORDER BY created_at ASC;
