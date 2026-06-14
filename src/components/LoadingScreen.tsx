import { PackageOpen } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas">
      <div className="text-center">
        <div className="mx-auto grid size-14 animate-pulse place-items-center rounded-2xl bg-moss text-lime">
          <PackageOpen className="size-7" />
        </div>
        <p className="mt-4 text-sm font-semibold text-gray-500">Chargement de votre activité…</p>
      </div>
    </div>
  )
}
