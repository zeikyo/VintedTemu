-- Ajoute le statut "offert" aux ventes existantes.
-- À exécuter une seule fois dans Supabase SQL Editor.

alter table public.sales
drop constraint if exists sales_status_check;

alter table public.sales
add constraint sales_status_check
check (status in ('vendu', 'envoyé', 'payé', 'remboursé', 'offert'));
