-- StockPilot - correction minimale des permissions API Supabase.
-- Ce script ne modifie ni les données, ni les fonctions, ni les politiques RLS.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete
on table
  public.products,
  public.sales,
  public.expenses,
  public.platforms,
  public.categories
to anon, authenticated;
