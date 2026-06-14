import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value)

export const formatNumber = (value: number, digits = 0) =>
  new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))

export const uid = () => crypto.randomUUID()

export const profitability = (roi: number) => {
  if (roi >= 100) return { label: 'Très rentable', tone: 'emerald' as const }
  if (roi >= 50) return { label: 'Rentable', tone: 'blue' as const }
  if (roi >= 10) return { label: 'Moyen', tone: 'amber' as const }
  return { label: 'Mauvais achat', tone: 'rose' as const }
}
