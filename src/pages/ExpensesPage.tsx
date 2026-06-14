import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, ReceiptText, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { PageHeader } from '../components/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { FieldShell, Input, Select, Textarea } from '../components/ui/Field'
import { useData } from '../context/DataContext'
import { formatCurrency, formatDate } from '../lib/utils'
import type { Expense } from '../types'

const schema = z.object({
  name: z.string().min(2, 'Indiquez un libellé'),
  amount: z.number().positive('Le montant doit être positif'),
  category: z.string().min(1, 'Choisissez une catégorie'),
  date: z.string().min(1, 'La date est obligatoire'),
  note: z.string(),
})

type FormValues = z.infer<typeof schema>

export function ExpensesPage() {
  const { expenses, addExpense, deleteExpense } = useData()
  const [open, setOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Expense | null>(null)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', amount: 0, category: 'Emballage', date: new Date().toISOString().slice(0, 10), note: '' },
  })
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <>
      <PageHeader
        title="Dépenses"
        description="Suivez les coûts généraux qui réduisent votre bénéfice réel."
        action={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> Ajouter une dépense</Button>}
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-xs font-semibold text-gray-400">Dépenses totales</p><p className="mt-2 text-2xl font-extrabold">{formatCurrency(total)}</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold text-gray-400">Nombre d’opérations</p><p className="mt-2 text-2xl font-extrabold">{expenses.length}</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold text-gray-400">Dépense moyenne</p><p className="mt-2 text-2xl font-extrabold">{formatCurrency(expenses.length ? total / expenses.length : 0)}</p></Card>
      </div>
      <Card>
        {expenses.length === 0 ? (
          <EmptyState icon={ReceiptText} title="Aucune dépense" description="Ajoutez vos emballages, logiciels et autres coûts d’activité." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead><tr className="border-b border-line bg-[#fbfcfb] text-[10px] font-bold uppercase tracking-wider text-gray-400"><th className="px-5 py-3">Dépense</th><th className="px-4 py-3">Catégorie</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Montant</th><th className="px-5 py-3" /></tr></thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-line/70 last:border-0">
                    <td className="px-5 py-4"><p className="text-sm font-bold">{expense.name}</p><p className="mt-0.5 text-xs text-gray-400">{expense.note || 'Aucune note'}</p></td>
                    <td className="px-4 py-4"><Badge tone="gray">{expense.category}</Badge></td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatDate(expense.date)}</td>
                    <td className="px-4 py-4 text-sm font-extrabold">{formatCurrency(expense.amount)}</td>
                    <td className="px-5 py-4 text-right"><button onClick={() => setToDelete(expense)} className="rounded-lg p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="size-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg animate-rise p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div><h2 className="text-lg font-extrabold">Nouvelle dépense</h2><p className="mt-1 text-xs text-gray-400">Elle sera déduite du bénéfice net global.</p></div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X className="size-5" /></button>
            </div>
            <form
              className="space-y-4"
              onSubmit={handleSubmit(async (data) => {
                await addExpense({ ...data, note: data.note || null })
                toast.success('Dépense ajoutée')
                reset()
                setOpen(false)
              })}
            >
              <FieldShell label="Libellé *" error={errors.name?.message}><Input placeholder="Ex. Lot de cartons" {...register('name')} /></FieldShell>
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldShell label="Montant *" error={errors.amount?.message}><Input type="number" min="0" step="0.01" {...register('amount', { valueAsNumber: true })} /></FieldShell>
                <FieldShell label="Date *" error={errors.date?.message}><Input type="date" {...register('date')} /></FieldShell>
              </div>
              <FieldShell label="Catégorie *" error={errors.category?.message}><Select {...register('category')}><option>Emballage</option><option>Matériel</option><option>Logiciel</option><option>Transport</option><option>Marketing</option><option>Autre</option></Select></FieldShell>
              <FieldShell label="Note" error={errors.note?.message}><Textarea placeholder="Détails facultatifs…" {...register('note')} /></FieldShell>
              <div className="flex justify-end gap-3 pt-2"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" loading={isSubmitting}>Ajouter</Button></div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmDialog open={Boolean(toDelete)} title="Supprimer cette dépense ?" description="Le bénéfice net global sera recalculé automatiquement." onClose={() => setToDelete(null)} onConfirm={async () => { if (!toDelete) return; await deleteExpense(toDelete.id); toast.success('Dépense supprimée'); setToDelete(null) }} />
    </>
  )
}
