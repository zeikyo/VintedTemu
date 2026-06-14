import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
      <div>
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-mint text-moss">
          <Icon className="size-5" />
        </div>
        <h3 className="font-bold text-ink">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  )
}
