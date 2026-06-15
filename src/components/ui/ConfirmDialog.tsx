import { AlertTriangle, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/30 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="size-5" />
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="size-5" />
          </button>
        </div>
        <h3 id="confirm-dialog-title" className="text-lg font-bold text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant="danger" onClick={onConfirm}>Supprimer</Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
