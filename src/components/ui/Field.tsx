import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface FieldShellProps {
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

export function FieldShell({ label, error, hint, children }: FieldShellProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-gray-400">{hint}</span>
      ) : null}
    </label>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-gray-400 focus:border-moss focus:ring-3 focus:ring-mint',
        className,
      )}
      {...props}
    />
  )
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition focus:border-moss focus:ring-3 focus:ring-mint',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full resize-y rounded-xl border border-line bg-white px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-gray-400 focus:border-moss focus:ring-3 focus:ring-mint',
        className,
      )}
      {...props}
    />
  )
}
