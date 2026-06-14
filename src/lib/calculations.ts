import type { Expense, Product, Sale, SaleInput } from '../types'

export const calculateUnitCost = (
  totalPurchasePrice: number,
  quantity: number,
  shippingCost = 0,
) => (quantity > 0 ? (totalPurchasePrice + shippingCost) / quantity : 0)

export const calculateSale = (sale: SaleInput, product?: Product) => {
  const unitCost = product?.unit_cost ?? 0
  const net_profit =
    sale.sale_price -
    unitCost -
    sale.fees -
    sale.packaging_cost -
    sale.discount -
    sale.shipping_paid_by_me
  const roi = unitCost > 0 ? (net_profit / unitCost) * 100 : 0
  return { net_profit, roi }
}

export const dashboardMetrics = (
  products: Product[],
  sales: Sale[],
  expenses: Expense[],
) => {
  const validSales = sales.filter((sale) => sale.status !== 'remboursé')
  const revenue = validSales.reduce((sum, sale) => sum + sale.sale_price - sale.discount, 0)
  const grossProfit = validSales.reduce((sum, sale) => sum + sale.net_profit, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netProfit = grossProfit - totalExpenses
  const averageRoi = validSales.length
    ? validSales.reduce((sum, sale) => sum + sale.roi, 0) / validSales.length
    : 0
  const stock = products.reduce((sum, product) => sum + product.stock_remaining, 0)
  const tiedUpCash = products.reduce(
    (sum, product) => sum + product.stock_remaining * product.unit_cost,
    0,
  )
  const averageMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0

  return {
    revenue,
    grossProfit,
    totalExpenses,
    netProfit,
    averageRoi,
    stock,
    tiedUpCash,
    averageMargin,
    soldCount: validSales.length,
  }
}
