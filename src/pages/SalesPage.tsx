import { CircleDollarSign, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Input, Select } from '../components/ui/Field'
import { useData } from '../context/DataContext'
import { formatCurrency, formatDate, formatNumber, profitability } from '../lib/utils'
import type { Sale, SaleStatus } from '../types'

const statusTone: Record<SaleStatus, 'gray' | 'blue' | 'emerald' | 'rose'> = {
  vendu: 'gray',
  envoyé: 'blue',
  payé: 'emerald',
  remboursé: 'rose',
}

export function SalesPage() {
  const { sales, products, updateSaleStatus, deleteSale } = useData()
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('Toutes')
  const [toDelete, setToDelete] = useState<Sale | null>(null)
  const platforms = ['Toutes', ...new Set(sales.map((sale) => sale.sale_platform))]
  const productName = (id: string) => products.find((product) => product.id === id)?.name ?? 'Produit supprimé'
  const filtered = sales.filter((sale) => {
    return productName(sale.product_id).toLowerCase().includes(search.toLowerCase()) &&
      (platform === 'Toutes' || sale.sale_platform === platform)
  })

  return (
    <>
      <PageHeader
        title="Ventes"
        description={`${sales.length} ventes enregistrées · ${formatCurrency(sales.filter((sale) => sale.status !== 'remboursé').reduce((sum, sale) => sum + sale.net_profit, 0))} de bénéfice brut`}
        action={<Link to="/ventes/nouvelle" className="inline-flex h-11 items-center gap-2 rounded-xl bg-moss px-4 text-sm font-semibold text-white"><Plus className="size-4" /> Nouvelle vente</Link>}
      />
      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input className="pl-10" placeholder="Rechercher un produit vendu…" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <Select className="sm:w-44" value={platform} onChange={(event) => setPlatform(event.target.value)}>
            {platforms.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={CircleDollarSign} title="Aucune vente trouvée" description="Enregistrez une vente pour voir votre rentabilité." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead>
                <tr className="border-b border-line bg-[#fbfcfb] text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-3">Produit</th>
                  <th className="px-4 py-3">Plateforme</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Prix vente</th>
                  <th className="px-4 py-3">Bénéfice</th>
                  <th className="px-4 py-3">ROI</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-5 py-3 text-right"><MoreHorizontal className="ml-auto size-4" /></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sale) => {
                  const product = products.find((item) => item.id === sale.product_id)
                  const performance = profitability(sale.roi)
                  return (
                    <tr key={sale.id} className="border-b border-line/70 last:border-0 hover:bg-[#fbfcfb]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={product?.photo_url || ''} alt="" className="size-10 rounded-xl bg-gray-100 object-cover" />
                          <div><p className="text-sm font-bold text-ink">{productName(sale.product_id)}</p><Badge tone={performance.tone}>{performance.label}</Badge></div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-gray-600">{sale.sale_platform}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">{formatDate(sale.sale_date)}</td>
                      <td className="px-4 py-3.5 text-sm font-bold text-ink">{formatCurrency(sale.sale_price)}</td>
                      <td className={sale.net_profit >= 0 ? 'px-4 py-3.5 text-sm font-bold text-emerald-600' : 'px-4 py-3.5 text-sm font-bold text-rose-600'}>{formatCurrency(sale.net_profit)}</td>
                      <td className="px-4 py-3.5 text-sm font-bold">{formatNumber(sale.roi, 0)}%</td>
                      <td className="px-4 py-3.5">
                        <Select
                          className="h-8 w-32 rounded-lg py-0 text-xs font-semibold"
                          value={sale.status}
                          onChange={async (event) => {
                            await updateSaleStatus(sale.id, event.target.value as SaleStatus)
                            toast.success('Statut mis à jour')
                          }}
                        >
                          {Object.keys(statusTone).map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
                        </Select>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => setToDelete(sale)} className="rounded-lg p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="size-4" /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.entries(statusTone) as [SaleStatus, typeof statusTone[SaleStatus]][]).map(([status, tone]) => (
          <Badge key={status} tone={tone} dot>{status[0].toUpperCase() + status.slice(1)}</Badge>
        ))}
      </div>
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer cette vente ?"
        description="L’unité correspondante sera automatiquement remise en stock."
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return
          await deleteSale(toDelete.id)
          toast.success('Vente supprimée et stock restauré')
          setToDelete(null)
        }}
      />
    </>
  )
}
