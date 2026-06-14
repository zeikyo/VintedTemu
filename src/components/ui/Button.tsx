import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
  children: ReactNode
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-9 px-3 text-sm' : 'h-11 px-4 text-sm',
        variant === 'primary' && 'bg-moss text-white shadow-sm hover:bg-[#205140]',
        variant === 'secondary' && 'border border-line bg-white text-ink hover:bg-gray-50',
        variant === 'ghost' && 'text-gray-600 hover:bg-gray-100 hover:text-ink',
        variant === 'danger' && 'bg-rose-50 text-rose-700 hover:bg-rose-100',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  )
}
