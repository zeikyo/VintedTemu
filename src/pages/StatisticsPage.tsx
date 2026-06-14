import { Award, CircleDollarSign, Percent, TrendingDown } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { useData } from '../context/DataContext'
import { dashboardMetrics } from '../lib/calculations'
import { formatCurrency, formatNumber, profitability } from '../lib/utils'

export function StatisticsPage() {
  const { products, sales, expenses } = useData()
  const metrics = dashboardMetrics(products, sales, expenses)
  const byProduct = products
    .map((product) => {
      const productSales = sales.filter((sale) => sale.product_id === product.id && sale.status !== 'remboursé')
      return {
        name: product.name,
        shortName: product.name.length > 18 ? `${product.name.slice(0, 18)}…` : product.name,
        profit: productSales.reduce((sum, sale) => sum + sale.net_profit, 0),
        revenue: productSales.reduce((sum, sale) => sum + sale.sale_price - sale.discount, 0),
        roi: productSales.length ? productSales.reduce((sum, sale) => sum + sale.roi, 0) / productSales.length : 0,
        count: productSales.length,
      }
    })
    .filter((item) => item.count > 0)
    .sort((a, b) => b.profit - a.profit)

  const best = byProduct[0]
  const worst = [...byProduct].sort((a, b) => a.roi - b.roi)[0]
  const byCategory = products.map((product) => {
    const categorySales = sales.filter((sale) => {
      const soldProduct = products.find((item) => item.id === sale.product_id)
      return soldProduct?.category === product.category && sale.status !== 'remboursé'
    })
    return {
      category: product.category,
      profit: categorySales.reduce((sum, sale) => sum + sale.net_profit, 0),
    }
  }).filter((item, index, array) => array.findIndex((other) => other.category === item.category) === index)

  return (
    <>
      <PageHeader title="Statistiques" description="Comprenez ce qui génère réellement votre rentabilité." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Marge nette" value={`${formatNumber(metrics.averageMargin, 1)} %`} detail="du chiffre d’affaires" icon={Percent} />
        <StatCard label="Bénéfice moyen / vente" value={formatCurrency(metrics.soldCount ? metrics.grossProfit / metrics.soldCount : 0)} detail="hors dépenses générales" icon={CircleDollarSign} />
        <StatCard label="Produit champion" value={best?.shortName ?? '—'} detail={best ? formatCurrency(best.profit) : 'Aucune vente'} icon={Award} featured />
        <StatCard label="ROI le plus faible" value={worst ? `${formatNumber(worst.roi, 0)} %` : '—'} detail={worst?.shortName ?? 'Aucune vente'} icon={TrendingDown} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card>
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-bold">Bénéfice par produit</h2>
            <p className="mt-0.5 text-xs text-gray-400">Contribution nette de chaque référence</p>
          </div>
          <div className="h-80 p-5">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={byProduct} layout="vertical" margin={{ left: 20, right: 15 }}>
                <CartesianGrid stroke="#edf0ed" strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(value) => `${value}€`} />
                <YAxis dataKey="shortName" type="category" axisLine={false} tickLine={false} width={120} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: 12, border: '1px solid #e4e9e5', fontSize: 12 }} />
                <Bar dataKey="profit" fill="#173e32" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-bold">Bénéfice par catégorie</h2>
            <p className="mt-0.5 text-xs text-gray-400">Les univers les plus performants</p>
          </div>
          <div className="h-80 p-5">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={byCategory} margin={{ top: 10, right: 10, left: -10 }}>
                <CartesianGrid stroke="#edf0ed" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(value) => `${value}€`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: 12, border: '1px solid #e4e9e5', fontSize: 12 }} />
                <Bar dataKey="profit" fill="#80c9ad" radius={[6, 6, 0, 0]} barSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-5">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-bold">Classement de rentabilité</h2>
          <p className="mt-0.5 text-xs text-gray-400">Du produit le plus rentable au moins performant</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead><tr className="border-b border-line bg-[#fbfcfb] text-[10px] font-bold uppercase tracking-wider text-gray-400"><th className="px-5 py-3">Rang</th><th className="px-4 py-3">Produit</th><th className="px-4 py-3">Ventes</th><th className="px-4 py-3">CA</th><th className="px-4 py-3">Bénéfice</th><th className="px-5 py-3">ROI</th></tr></thead>
            <tbody>
              {byProduct.map((item, index) => {
                const badge = profitability(item.roi)
                return <tr key={item.name} className="border-b border-line/70 last:border-0"><td className="px-5 py-4 text-sm font-extrabold text-gray-400">#{index + 1}</td><td className="px-4 py-4 text-sm font-bold">{item.name}</td><td className="px-4 py-4 text-sm text-gray-500">{item.count}</td><td className="px-4 py-4 text-sm font-semibold">{formatCurrency(item.revenue)}</td><td className="px-4 py-4 text-sm font-extrabold text-emerald-600">{formatCurrency(item.profit)}</td><td className="px-5 py-4"><Badge tone={badge.tone}>{formatNumber(item.roi, 0)}% · {badge.label}</Badge></td></tr>
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
