-- Recalcule le stock depuis la quantité achetée et les ventes non remboursées.
-- Ce script est sans danger et peut être relancé.

update public.products as product
set stock_remaining = greatest(
  product.quantity_bought - (
    select count(*)::integer
    from public.sales as sale
    where sale.product_id = product.id
      and sale.status <> 'remboursé'
  ),
  0
);
