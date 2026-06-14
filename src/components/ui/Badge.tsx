import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Tone = 'emerald' | 'blue' | 'amber' | 'rose' | 'gray' | 'purple'

export function Badge({
  children,
  tone = 'gray',
  dot = false,
}: {
  children: ReactNode
  tone?: Tone
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        tone === 'emerald' && 'bg-emerald-50 text-emerald-700',
        tone === 'blue' && 'bg-blue-50 text-blue-700',
        tone === 'amber' && 'bg-amber-50 text-amber-700',
        tone === 'rose' && 'bg-rose-50 text-rose-700',
        tone === 'purple' && 'bg-purple-50 text-purple-700',
        tone === 'gray' && 'bg-gray-100 text-gray-600',
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
