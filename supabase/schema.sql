-- StockPilot - schéma Supabase complet
-- À exécuter dans Supabase > SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  size text,
  color text,
  purchase_platform text not null,
  purchase_link text,
  total_purchase_price numeric(12, 2) not null check (total_purchase_price >= 0),
  quantity_bought integer not null check (quantity_bought > 0),
  unit_cost numeric(12, 2) not null default 0,
  shipping_cost numeric(12, 2) not null default 0 check (shipping_cost >= 0),
  packaging_cost numeric(12, 2) not null default 0 check (packaging_cost >= 0),
  stock_remaining integer not null check (stock_remaining >= 0),
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sale_platform text not null,
  sale_price numeric(12, 2) not null check (sale_price >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  fees numeric(12, 2) not null default 0 check (fees >= 0),
  shipping_paid_by_me numeric(12, 2) not null default 0 check (shipping_paid_by_me >= 0),
  packaging_cost numeric(12, 2) not null default 0 check (packaging_cost >= 0),
  net_profit numeric(12, 2) not null default 0,
  roi numeric(12, 2) not null default 0,
  sale_date date not null default current_date,
  status text not null default 'vendu' check (status in ('vendu', 'envoyé', 'payé', 'remboursé'))
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  category text not null,
  date date not null default current_date,
  note text
);

create table if not exists public.platforms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'les deux' check (type in ('achat', 'vente', 'les deux')),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists products_user_id_idx on public.products(user_id);
create index if not exists sales_user_id_idx on public.sales(user_id);
create index if not exists sales_product_id_idx on public.sales(product_id);
create index if not exists expenses_user_id_idx on public.expenses(user_id);

create or replace function public.calculate_product_unit_cost()
returns trigger
language plpgsql
as $$
begin
  new.unit_cost := round(
    (new.total_purchase_price + new.shipping_cost) / new.quantity_bought,
    2
  );
  return new;
end;
$$;

drop trigger if exists before_product_unit_cost on public.products;
create trigger before_product_unit_cost
before insert or update of total_purchase_price, shipping_cost, quantity_bought
on public.products
for each row execute function public.calculate_product_unit_cost();

alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.expenses enable row level security;
alter table public.platforms enable row level security;
alter table public.categories enable row level security;

create policy "Users manage their products"
  on public.products for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their sales"
  on public.sales for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.products
      where products.id = product_id and products.user_id = auth.uid()
    )
  );

create policy "Users manage their expenses"
  on public.expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their platforms"
  on public.platforms for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their categories"
  on public.categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Calcule le bénéfice et le ROI côté base afin de ne pas faire confiance au client.
create or replace function public.calculate_sale_profit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  product_cost numeric(12, 2);
begin
  select unit_cost into product_cost
  from public.products
  where id = new.product_id and user_id = new.user_id;

  if product_cost is null then
    raise exception 'Produit introuvable pour cet utilisateur';
  end if;

  new.net_profit := round(
    new.sale_price - product_cost - new.fees - new.packaging_cost
    - new.discount - new.shipping_paid_by_me,
    2
  );
  new.roi := case
    when product_cost > 0 then round((new.net_profit / product_cost) * 100, 2)
    else 0
  end;
  return new;
end;
$$;

drop trigger if exists before_sale_profit on public.sales;
create trigger before_sale_profit
before insert or update on public.sales
for each row execute function public.calculate_sale_profit();

-- Ajoute les listes de base au premier compte créé.
create or replace function public.seed_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.platforms (user_id, name, type) values
    (new.id, 'Temu', 'achat'),
    (new.id, 'Vinted', 'les deux'),
    (new.id, 'Leboncoin', 'vente'),
    (new.id, 'eBay', 'vente');

  insert into public.categories (user_id, name) values
    (new.id, 'Pokémon'),
    (new.id, 'Vêtements'),
    (new.id, 'Accessoires');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.seed_new_user();
