import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Calculator, ImagePlus, PackagePlus } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FieldShell, Input, Select } from '../components/ui/Field'
import { useData } from '../context/DataContext'
import { calculateUnitCost } from '../lib/calculations'
import { formatCurrency } from '../lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  category: z.string().min(1, 'Choisissez une catégorie'),
  size: z.string(),
  color: z.string(),
  purchase_platform: z.string().min(1, 'Choisissez une plateforme'),
  purchase_link: z.string().url('URL invalide').or(z.literal('')),
  total_purchase_price: z.number().positive('Le prix doit être positif'),
  quantity_bought: z.number().int().positive('La quantité doit être positive'),
  shipping_cost: z.number().min(0),
  packaging_cost: z.number().min(0),
  stock_remaining: z.number().int().min(0),
  photo_url: z.string().url('URL invalide').or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export function ProductFormPage() {
  const { id } = useParams()
  const { products, categories, platforms, addProduct, updateProduct } = useData()
  const navigate = useNavigate()
  const product = products.find((item) => item.id === id)
  const isEdit = Boolean(id)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      category: '',
      size: '',
      color: '',
      purchase_platform: 'Temu',
      purchase_link: '',
      total_purchase_price: 0,
      quantity_bought: 1,
      shipping_cost: 0,
      packaging_cost: 0,
      stock_remaining: 1,
      photo_url: '',
    },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        category: product.category,
        size: product.size ?? '',
        color: product.color ?? '',
        purchase_platform: product.purchase_platform,
        purchase_link: product.purchase_link ?? '',
        total_purchase_price: product.total_purchase_price,
        quantity_bought: product.quantity_bought,
        shipping_cost: product.shipping_cost,
        packaging_cost: product.packaging_cost,
        stock_remaining: product.stock_remaining,
        photo_url: product.photo_url ?? '',
      })
    }
  }, [product, reset])

  const values = watch()
  const unitCost = calculateUnitCost(
    Number(values.total_purchase_price) || 0,
    Number(values.quantity_bought) || 0,
    Number(values.shipping_cost) || 0,
  )

  const onSubmit = async (data: FormValues) => {
    try {
      const input = {
        ...data,
        size: data.size || null,
        color: data.color || null,
        purchase_link: data.purchase_link || null,
        photo_url: data.photo_url || null,
      }
      if (isEdit && id) {
        await updateProduct(id, input)
        toast.success('Produit mis à jour')
      } else {
        await addProduct(input)
        toast.success('Produit ajouté au stock')
      }
      navigate('/produits')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  return (
    <>
      <PageHeader
        title={isEdit ? 'Modifier le produit' : 'Ajouter un produit'}
        description="Renseignez votre achat pour calculer automatiquement le coût unitaire."
        action={
          <Link to="/produits" className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            <ArrowLeft className="size-4" /> Retour
          </Link>
        }
      />
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card className="p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-mint text-moss"><PackagePlus className="size-5" /></div>
            <div>
              <h2 className="font-bold text-ink">Informations produit</h2>
              <p className="text-xs text-gray-400">Les champs marqués sont nécessaires au suivi.</p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldShell label="Nom du produit *" error={errors.name?.message}>
                <Input placeholder="Ex. Coffret Pokémon 151" {...register('name')} />
              </FieldShell>
            </div>
            <FieldShell label="Catégorie *" error={errors.category?.message}>
              <Select {...register('category')}>
                <option value="">Sélectionner</option>
                {categories.map((category) => <option key={category.id}>{category.name}</option>)}
                <option>Autre</option>
              </Select>
            </FieldShell>
            <FieldShell label="Plateforme d’achat *" error={errors.purchase_platform?.message}>
              <Select {...register('purchase_platform')}>
                {platforms.filter((platform) => platform.type !== 'vente').map((platform) => <option key={platform.id}>{platform.name}</option>)}
              </Select>
            </FieldShell>
            <FieldShell label="Taille" error={errors.size?.message}>
              <Input placeholder="M, 42, Unique…" {...register('size')} />
            </FieldShell>
            <FieldShell label="Couleur" error={errors.color?.message}>
              <Input placeholder="Crème, bleu…" {...register('color')} />
            </FieldShell>
            <FieldShell label="Prix d’achat total *" error={errors.total_purchase_price?.message}>
              <Input type="number" step="0.01" min="0" {...register('total_purchase_price', { valueAsNumber: true })} />
            </FieldShell>
            <FieldShell label="Quantité achetée *" error={errors.quantity_bought?.message}>
              <Input type="number" min="1" {...register('quantity_bought', { valueAsNumber: true })} />
            </FieldShell>
            <FieldShell label="Frais de livraison" error={errors.shipping_cost?.message}>
              <Input type="number" step="0.01" min="0" {...register('shipping_cost', { valueAsNumber: true })} />
            </FieldShell>
            <FieldShell label="Emballage par unité" error={errors.packaging_cost?.message}>
              <Input type="number" step="0.01" min="0" {...register('packaging_cost', { valueAsNumber: true })} />
            </FieldShell>
            <FieldShell label="Stock actuel *" error={errors.stock_remaining?.message}>
              <Input type="number" min="0" {...register('stock_remaining', { valueAsNumber: true })} />
            </FieldShell>
            <FieldShell label="Lien d’achat" error={errors.purchase_link?.message}>
              <Input type="url" placeholder="https://…" {...register('purchase_link')} />
            </FieldShell>
            <div className="sm:col-span-2">
              <FieldShell label="URL de la photo" error={errors.photo_url?.message} hint="Une URL publique vers une photo carrée fonctionne le mieux.">
                <Input type="url" placeholder="https://…" {...register('photo_url')} />
              </FieldShell>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="border-b border-line bg-[#fbfcfb] px-5 py-4">
              <div className="flex items-center gap-2">
                <Calculator className="size-4 text-moss" />
                <h2 className="text-sm font-bold text-ink">Calcul automatique</h2>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Coût unitaire complet</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-moss">{formatCurrency(unitCost)}</p>
              <p className="mt-3 text-xs leading-5 text-gray-400">Prix total et livraison répartis sur la quantité achetée.</p>
            </div>
          </Card>
          <Card className="p-5">
            <div className="grid min-h-40 place-items-center overflow-hidden rounded-xl bg-gray-50">
              {values.photo_url ? (
                <img src={values.photo_url} alt="Aperçu" className="h-48 w-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <ImagePlus className="mx-auto size-7" />
                  <p className="mt-2 text-xs font-semibold">Aperçu produit</p>
                </div>
              )}
            </div>
          </Card>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            {isEdit ? 'Enregistrer les modifications' : 'Ajouter au stock'}
          </Button>
        </div>
      </form>
    </>
  )
}
