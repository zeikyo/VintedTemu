import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Calculator, CircleDollarSign, TrendingUp } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { PageHeader } from '../components/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FieldShell, Input, Select } from '../components/ui/Field'
import { useData } from '../context/DataContext'
import { calculateSale } from '../lib/calculations'
import { formatCurrency, formatNumber, profitability } from '../lib/utils'

const schema = z.object({
  product_id: z.string().min(1, 'Choisissez un produit'),
  sale_platform: z.string().min(1, 'Choisissez une plateforme'),
  sale_price: z.number().positive('Le prix doit être positif'),
  discount: z.number().min(0),
  fees: z.number().min(0),
  shipping_paid_by_me: z.number().min(0),
  packaging_cost: z.number().min(0),
  sale_date: z.string().min(1, 'La date est obligatoire'),
  status: z.enum(['vendu', 'envoyé', 'payé', 'remboursé']),
})

type FormValues = z.infer<typeof schema>

export function SaleFormPage() {
  const { products, platforms, addSale } = useData()
  const navigate = useNavigate()
  const availableProducts = products.filter((product) => product.stock_remaining > 0)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      product_id: '',
      sale_platform: 'Vinted',
      sale_price: 0,
      discount: 0,
      fees: 0,
      shipping_paid_by_me: 0,
      packaging_cost: 0,
      sale_date: new Date().toISOString().slice(0, 10),
      status: 'vendu',
    },
  })

  const values = watch()
  const selectedProduct = products.find((product) => product.id === values.product_id)
  const computed = calculateSale(values, selectedProduct)
  const badge = profitability(computed.roi)

  const onSubmit = async (data: FormValues) => {
    try {
      await addSale(data)
      toast.success('Vente enregistrée et stock mis à jour')
      navigate('/ventes')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible d’enregistrer la vente')
    }
  }

  return (
    <>
      <PageHeader
        title="Enregistrer une vente"
        description="Le bénéfice net et le ROI sont calculés en temps réel."
        action={<Link to="/ventes" className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-gray-600"><ArrowLeft className="size-4" /> Retour</Link>}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 xl:grid-cols-[1fr_350px]">
        <Card className="p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-mint text-moss"><CircleDollarSign className="size-5" /></div>
            <div>
              <h2 className="font-bold text-ink">Détails de la vente</h2>
              <p className="text-xs text-gray-400">Chaque vente retire une unité du stock.</p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldShell label="Produit vendu *" error={errors.product_id?.message}>
                <Select
                  {...register('product_id')}
                  onChange={(event) => {
                    register('product_id').onChange(event)
                    const product = products.find((item) => item.id === event.target.value)
                    if (product) setValue('packaging_cost', product.packaging_cost)
                  }}
                >
                  <option value="">Sélectionner un produit en stock</option>
                  {availableProducts.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.stock_remaining} dispo.</option>)}
                </Select>
              </FieldShell>
            </div>
            <FieldShell label="Plateforme de vente *" error={errors.sale_platform?.message}>
              <Select {...register('sale_platform')}>
                {platforms.filter((platform) => platform.type !== 'achat').map((platform) => <option key={platform.id}>{platform.name}</option>)}
              </Select>
            </FieldShell>
            <FieldShell label="Statut *" error={errors.status?.message}>
              <Select {...register('status')}>
                <option value="vendu">Vendu</option>
                <option value="envoyé">Envoyé</option>
                <option value="payé">Payé</option>
                <option value="remboursé">Remboursé</option>
              </Select>
            </FieldShell>
            <FieldShell label="Prix de vente *" error={errors.sale_price?.message}>
              <Input type="number" min="0" step="0.01" {...register('sale_price', { valueAsNumber: true })} />
            </FieldShell>
            <FieldShell label="Remise accordée" error={errors.discount?.message}>
              <Input type="number" min="0" step="0.01" {...register('discount', { valueAsNumber: true })} />
            </FieldShell>
            <FieldShell label="Frais plateforme" error={errors.fees?.message}>
              <Input type="number" min="0" step="0.01" {...register('fees', { valueAsNumber: true })} />
            </FieldShell>
            <FieldShell label="Livraison à ma charge" error={errors.shipping_paid_by_me?.message}>
              <Input type="number" min="0" step="0.01" {...register('shipping_paid_by_me', { valueAsNumber: true })} />
            </FieldShell>
            <FieldShell label="Coût d’emballage" error={errors.packaging_cost?.message}>
              <Input type="number" min="0" step="0.01" {...register('packaging_cost', { valueAsNumber: true })} />
            </FieldShell>
            <FieldShell label="Date de vente *" error={errors.sale_date?.message}>
              <Input type="date" {...register('sale_date')} />
            </FieldShell>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="border-b border-line bg-[#fbfcfb] px-5 py-4">
              <div className="flex items-center gap-2"><Calculator className="size-4 text-moss" /><h2 className="text-sm font-bold">Rentabilité estimée</h2></div>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Coût unitaire</span>
                <span className="font-bold">{formatCurrency(selectedProduct?.unit_cost ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
                <span className="text-gray-500">Bénéfice net</span>
                <span className={computed.net_profit >= 0 ? 'text-xl font-extrabold text-emerald-600' : 'text-xl font-extrabold text-rose-600'}>{formatCurrency(computed.net_profit)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
                <span className="text-gray-500">ROI</span>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-ink">{formatNumber(computed.roi, 1)}%</p>
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                </div>
              </div>
            </div>
          </Card>
          <div className="rounded-2xl bg-moss p-5 text-white">
            <TrendingUp className="size-5 text-lime" />
            <p className="mt-3 text-sm font-bold">Objectif marge</p>
            <p className="mt-1 text-xs leading-5 text-white/50">Visez un ROI supérieur à 50 % pour absorber les dépenses générales.</p>
          </div>
          <Button type="submit" className="w-full" loading={isSubmitting}>Enregistrer la vente</Button>
        </div>
      </form>
    </>
  )
}
