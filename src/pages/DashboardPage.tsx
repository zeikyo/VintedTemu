import {
  ArrowRight,
  Banknote,
  Boxes,
  CircleDollarSign,
  PackageCheck,
  ReceiptText,
  Target,
  Trophy,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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

const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
const chartColors = ['#173e32', '#80c9ad', '#cbf477', '#f3c8a5', '#8aa39a']

export function DashboardPage() {
  const { products, sales, expenses } = useData()
  const metrics = dashboardMetrics(products, sales, expenses)

  const monthlyData = monthNames.map((month, index) => {
    const monthSales = sales.filter((sale) => new Date(sale.sale_date).getMonth() === index && sale.status !== 'remboursé')
    return {
      month,
      bénéfice: Number(monthSales.reduce((sum, sale) => sum + sale.net_profit, 0).toFixed(2)),
      ca: Number(monthSales.reduce((sum, sale) => sum + sale.sale_price - sale.discount, 0).toFixed(2)),
    }
  }).filter((item, index) => item.ca > 0 || index <= new Date().getMonth())

  const platformMap = sales.reduce<Record<string, number>>((acc, sale) => {
    if (sale.status !== 'remboursé') acc[sale.sale_platform] = (acc[sale.sale_platform] ?? 0) + sale.sale_price
    return acc
  }, {})
  const platformData = Object.entries(platformMap).map(([name, value]) => ({ name, value }))

  const productPerformance = products
    .map((product) => {
      const productSales = sales.filter((sale) => sale.product_id === product.id && sale.status !== 'remboursé')
      return {
        product,
        sales: productSales.length,
        profit: productSales.reduce((sum, sale) => sum + sale.net_profit, 0),
        roi: productSales.length
          ? productSales.reduce((sum, sale) => sum + sale.roi, 0) / productSales.length
          : 0,
      }
    })
    .filter((item) => item.sales > 0)
    .sort((a, b) => b.profit - a.profit)

  return (
    <>
      <PageHeader
        title="Bonjour Ludovic, prêt à vendre ?"
        description="Voici l’état de votre activité au 14 juin 2026."
        action={
          <Link to="/ventes/nouvelle" className="inline-flex h-11 items-center gap-2 rounded-xl bg-moss px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#205140]">
            <CircleDollarSign className="size-4" />
            Enregistrer une vente
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Chiffre d’affaires" value={formatCurrency(metrics.revenue)} detail="vs période précédente" trend={18.4} icon={Banknote} />
        <StatCard label="Bénéfice net" value={formatCurrency(metrics.netProfit)} detail="après dépenses" trend={12.7} icon={Target} featured />
        <StatCard label="ROI moyen" value={`${formatNumber(metrics.averageRoi, 1)} %`} detail="sur les ventes actives" trend={8.2} icon={Trophy} />
        <StatCard label="Articles vendus" value={String(metrics.soldCount)} detail={`${metrics.stock} encore en stock`} icon={PackageCheck} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <Card>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="font-bold text-ink">Performance mensuelle</h2>
              <p className="mt-0.5 text-xs text-gray-400">CA et bénéfice net par mois</p>
            </div>
            <Badge tone="emerald" dot>2026</Badge>
          </div>
          <div className="h-72 px-2 py-5">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={monthlyData} margin={{ top: 8, right: 12, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="profit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#173e32" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#173e32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf0ed" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: 12, border: '1px solid #e4e9e5', boxShadow: '0 8px 30px rgba(20,42,31,.08)', fontSize: 12 }} />
                <Area type="monotone" dataKey="ca" stroke="#9dcfb9" strokeWidth={2} fill="transparent" />
                <Area type="monotone" dataKey="bénéfice" stroke="#173e32" strokeWidth={2.5} fill="url(#profit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-bold text-ink">Ventes par plateforme</h2>
            <p className="mt-0.5 text-xs text-gray-400">Répartition du chiffre d’affaires</p>
          </div>
          <div className="grid grid-cols-[1fr_120px] items-center gap-2 px-4 py-5">
            <div className="h-52 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie data={platformData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={78} paddingAngle={4} strokeWidth={0}>
                    {platformData.map((item, index) => <Cell key={item.name} fill={chartColors[index % chartColors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: 12, border: '1px solid #e4e9e5', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {platformData.map((item, index) => (
                <div key={item.name}>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: chartColors[index % chartColors.length] }} />
                    <span className="text-xs font-semibold text-gray-600">{item.name}</span>
                  </div>
                  <p className="ml-4 mt-0.5 text-xs text-gray-400">{formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Card>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="font-bold text-ink">Meilleurs produits</h2>
              <p className="mt-0.5 text-xs text-gray-400">Classés par bénéfice cumulé</p>
            </div>
            <Link to="/statistiques" className="flex items-center gap-1 text-xs font-bold text-moss hover:underline">
              Voir tout <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-line text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-3">Produit</th>
                  <th className="px-4 py-3">Ventes</th>
                  <th className="px-4 py-3">Bénéfice</th>
                  <th className="px-4 py-3">ROI</th>
                  <th className="px-5 py-3">Performance</th>
                </tr>
              </thead>
              <tbody>
                {productPerformance.slice(0, 4).map(({ product, sales: count, profit, roi }) => {
                  const badge = profitability(roi)
                  return (
                    <tr key={product.id} className="border-b border-line/70 last:border-0">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={product.photo_url || ''} alt="" className="size-10 rounded-xl bg-gray-100 object-cover" />
                          <div>
                            <p className="text-sm font-bold text-ink">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{count}</td>
                      <td className="px-4 py-3 text-sm font-bold text-ink">{formatCurrency(profit)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-600">{formatNumber(roi, 0)}%</td>
                      <td className="px-5 py-3"><Badge tone={badge.tone}>{badge.label}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="grid size-11 place-items-center rounded-xl bg-mint text-moss"><Boxes className="size-5" /></div>
              <div>
                <p className="text-xs font-semibold text-gray-400">Stock restant</p>
                <p className="mt-1 text-xl font-extrabold text-ink">{metrics.stock} articles</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-600"><CircleDollarSign className="size-5" /></div>
              <div>
                <p className="text-xs font-semibold text-gray-400">Argent immobilisé</p>
                <p className="mt-1 text-xl font-extrabold text-ink">{formatCurrency(metrics.tiedUpCash)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-600"><ReceiptText className="size-5" /></div>
              <div>
                <p className="text-xs font-semibold text-gray-400">Dépenses totales</p>
                <p className="mt-1 text-xl font-extrabold text-ink">{formatCurrency(metrics.totalExpenses)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
