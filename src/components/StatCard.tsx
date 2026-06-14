import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Card } from './ui/Card'

export function StatCard({
  label,
  value,
  detail,
  trend,
  icon: Icon,
  featured = false,
}: {
  label: string
  value: string
  detail?: string
  trend?: number
  icon: LucideIcon
  featured?: boolean
}) {
  const positive = (trend ?? 0) >= 0
  return (
    <Card className={featured ? 'bg-moss text-white' : ''}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={featured ? 'text-sm text-white/65' : 'text-sm text-gray-500'}>{label}</p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight">{value}</p>
          </div>
          <div className={featured ? 'grid size-10 place-items-center rounded-xl bg-white/10 text-lime' : 'grid size-10 place-items-center rounded-xl bg-mint text-moss'}>
            <Icon className="size-5" />
          </div>
        </div>
        {(detail || trend !== undefined) && (
          <div className="mt-4 flex items-center gap-2 text-xs">
            {trend !== undefined && (
              <span className={featured ? 'inline-flex items-center gap-0.5 font-bold text-lime' : positive ? 'inline-flex items-center gap-0.5 font-bold text-emerald-600' : 'inline-flex items-center gap-0.5 font-bold text-rose-600'}>
                {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                {Math.abs(trend)}%
              </span>
            )}
            {detail && <span className={featured ? 'text-white/50' : 'text-gray-400'}>{detail}</span>}
          </div>
        )}
      </div>
    </Card>
  )
}
