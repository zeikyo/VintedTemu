import { Download, FileUp, MoreHorizontal, PackageSearch, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import Papa from 'papaparse'
import { useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Input, Select } from '../components/ui/Field'
import { useData } from '../context/DataContext'
import { formatCurrency } from '../lib/utils'
import type { Product, ProductInput } from '../types'

export function ProductsPage() {
  const { products, deleteProduct, importProducts } = useData()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Toutes')
  const [stock, setStock] = useState('Tous')
  const [toDelete, setToDelete] = useState<Product | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const categories = ['Toutes', ...new Set(products.map((product) => product.category))]
  const filtered = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'Toutes' || product.category === category
    const matchesStock =
      stock === 'Tous' ||
      (stock === 'En stock' && product.stock_remaining > 0) ||
      (stock === 'Épuisé' && product.stock_remaining === 0)
    return matchesSearch && matchesCategory && matchesStock
  })

  const exportCsv = () => {
    const csv = Papa.unparse(products)
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `stockpilot-produits-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Export CSV téléchargé')
  }

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        try {
          const items: ProductInput[] = data.map((row) => ({
            name: row.name,
            category: row.category || 'Autre',
            size: row.size || null,
            color: row.color || null,
            purchase_platform: row.purchase_platform || 'Temu',
            purchase_link: row.purchase_link || null,
            total_purchase_price: Number(row.total_purchase_price) || 0,
            quantity_bought: Number(row.quantity_bought) || 1,
            shipping_cost: Number(row.shipping_cost) || 0,
            packaging_cost: Number(row.packaging_cost) || 0,
            stock_remaining: Number(row.stock_remaining) || 0,
            photo_url: row.photo_url || null,
          }))
          await importProducts(items.filter((item) => item.name))
          toast.success(`${items.length} produit(s) importé(s)`)
        } catch {
          toast.error('Le fichier CSV est invalide')
        }
      },
    })
    event.target.value = ''
  }

  return (
    <>
      <PageHeader
        title="Produits & stock"
        description={`${products.length} références · ${products.reduce((sum, product) => sum + product.stock_remaining, 0)} articles disponibles`}
        action={
          <>
            <input ref={fileInput} type="file" accept=".csv" className="hidden" onChange={handleImport} />
            <Button variant="secondary" onClick={() => fileInput.current?.click()}><FileUp className="size-4" /> Importer</Button>
            <Button variant="secondary" onClick={exportCsv}><Download className="size-4" /> Exporter</Button>
            <Link to="/produits/nouveau" className="inline-flex h-11 items-center gap-2 rounded-xl bg-moss px-4 text-sm font-semibold text-white"><Plus className="size-4" /> Ajouter</Link>
          </>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input className="pl-10" placeholder="Rechercher un produit…" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <Select className="sm:w-44" value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </Select>
          <Select className="sm:w-36" value={stock} onChange={(event) => setStock(event.target.value)}>
            <option>Tous</option>
            <option>En stock</option>
            <option>Épuisé</option>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={PackageSearch} title="Aucun produit trouvé" description="Modifiez vos filtres ou ajoutez votre premier achat." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead>
                <tr className="border-b border-line bg-[#fbfcfb] text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-3">Produit</th>
                  <th className="px-4 py-3">Achat</th>
                  <th className="px-4 py-3">Coût unité</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Valeur stock</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-5 py-3 text-right"><MoreHorizontal className="ml-auto size-4" /></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-line/70 transition last:border-0 hover:bg-[#fbfcfb]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={product.photo_url || ''} alt="" className="size-11 rounded-xl bg-gray-100 object-cover" />
                        <div>
                          <p className="text-sm font-bold text-ink">{product.name}</p>
                          <p className="mt-0.5 text-xs text-gray-400">{product.category}{product.size ? ` · ${product.size}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-gray-600">{formatCurrency(product.total_purchase_price)}</p>
                      <p className="text-xs text-gray-400">{product.purchase_platform}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-bold text-ink">{formatCurrency(product.unit_cost)}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-bold text-ink">{product.stock_remaining} / {product.quantity_bought}</p>
                      <div className="mt-1.5 h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, product.stock_remaining / product.quantity_bought * 100)}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{formatCurrency(product.stock_remaining * product.unit_cost)}</td>
                    <td className="px-4 py-3.5">
                      <Badge tone={product.stock_remaining > 2 ? 'emerald' : product.stock_remaining > 0 ? 'amber' : 'rose'} dot>
                        {product.stock_remaining > 2 ? 'En stock' : product.stock_remaining > 0 ? 'Stock faible' : 'Épuisé'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Link to={`/produits/${product.id}/modifier`} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-ink"><Pencil className="size-4" /></Link>
                        <button onClick={() => setToDelete(product)} className="rounded-lg p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer ce produit ?"
        description="Le produit et les ventes associées seront supprimés. Cette action est irréversible."
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return
          await deleteProduct(toDelete.id)
          toast.success('Produit supprimé')
          setToDelete(null)
        }}
      />
    </>
  )
}
