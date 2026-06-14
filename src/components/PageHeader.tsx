import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">{title}</h1>
        <p className="mt-1.5 text-sm text-gray-500">{description}</p>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}
