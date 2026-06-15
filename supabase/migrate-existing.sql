-- StockPilot - migration pour un projet Supabase déjà initialisé.
-- Ce script est réexécutable sans supprimer les données existantes.

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table
  public.products,
  public.sales,
  public.expenses,
  public.platforms,
  public.categories
to anon, authenticated;

alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.expenses enable row level security;
alter table public.platforms enable row level security;
alter table public.categories enable row level security;

drop policy if exists "Users manage their products" on public.products;
create policy "Users manage their products"
  on public.products for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their sales" on public.sales;
create policy "Users manage their sales"
  on public.sales for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.products
      where products.id = product_id
        and products.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage their expenses" on public.expenses;
create policy "Users manage their expenses"
  on public.expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their platforms" on public.platforms;
create policy "Users manage their platforms"
  on public.platforms for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their categories" on public.categories;
create policy "Users manage their categories"
  on public.categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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

create or replace function public.sync_product_stock_from_sale()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.products
    set stock_remaining = stock_remaining - 1
    where id = new.product_id
      and user_id = new.user_id
      and stock_remaining > 0;

    if not found then
      raise exception 'Stock insuffisant ou produit introuvable';
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.products
    set stock_remaining = stock_remaining + 1
    where id = old.product_id
      and user_id = old.user_id;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists after_sale_insert_stock on public.sales;
create trigger after_sale_insert_stock
after insert on public.sales
for each row execute function public.sync_product_stock_from_sale();

drop trigger if exists after_sale_delete_stock on public.sales;
create trigger after_sale_delete_stock
after delete on public.sales
for each row execute function public.sync_product_stock_from_sale();

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
    (new.id, 'eBay', 'vente')
  on conflict (user_id, name) do nothing;

  insert into public.categories (user_id, name) values
    (new.id, 'Pokémon'),
    (new.id, 'Vêtements'),
    (new.id, 'Accessoires')
  on conflict (user_id, name) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.seed_new_user();

insert into public.platforms (user_id, name, type)
select users.id, defaults.name, defaults.type
from auth.users as users
cross join (
  values
    ('Temu', 'achat'),
    ('Vinted', 'les deux'),
    ('Leboncoin', 'vente'),
    ('eBay', 'vente')
) as defaults(name, type)
on conflict (user_id, name) do nothing;

insert into public.categories (user_id, name)
select users.id, defaults.name
from auth.users as users
cross join (
  values ('Pokémon'), ('Vêtements'), ('Accessoires')
) as defaults(name)
on conflict (user_id, name) do nothing;
