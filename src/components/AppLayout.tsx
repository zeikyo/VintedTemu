import {
  BarChart3,
  Boxes,
  ChevronDown,
  CircleDollarSign,
  LayoutDashboard,
  Menu,
  PackagePlus,
  PlusCircle,
  ReceiptText,
  Settings,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

const navigation = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Produits', to: '/produits', icon: Boxes },
  { label: 'Ajouter produit', to: '/produits/nouveau', icon: PackagePlus },
  { label: 'Ventes', to: '/ventes', icon: ShoppingBag },
  { label: 'Ajouter vente', to: '/ventes/nouvelle', icon: PlusCircle },
  { label: 'Dépenses', to: '/depenses', icon: ReceiptText },
  { label: 'Statistiques', to: '/statistiques', icon: BarChart3 },
  { label: 'Paramètres', to: '/parametres', icon: Settings },
]

function SidebarContent({ close }: { close?: () => void }) {
  const { user, isDemo } = useAuth()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center gap-3 px-5">
        <div className="grid size-10 place-items-center rounded-xl bg-lime text-moss shadow-sm">
          <CircleDollarSign className="size-6" strokeWidth={2.4} />
        </div>
        <div>
          <p className="text-[17px] font-extrabold tracking-tight text-white">StockPilot</p>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/40">Resell manager</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-white/30">Espace de travail</p>
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={close}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/55 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <item.icon className="size-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="m-3 rounded-2xl bg-white/[.06] p-3.5">
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f3c8a5] text-xs font-extrabold text-moss">
            {(user?.user_metadata.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">
              {user?.user_metadata.full_name || 'Mon compte'}
            </p>
            <p className="truncate text-xs text-white/35">{isDemo ? 'Mode démonstration' : user?.email}</p>
          </div>
          <ChevronDown className="size-4 text-white/30" />
        </div>
      </div>
    </div>
  )
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-moss lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-label="Fermer le menu" />
          <aside className="relative h-full w-72 bg-moss shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 rounded-lg p-2 text-white/60 hover:bg-white/10">
              <X className="size-5" />
            </button>
            <SidebarContent close={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line/80 bg-canvas/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <button onClick={() => setMobileOpen(true)} className="rounded-xl border border-line bg-white p-2 text-gray-600 lg:hidden">
            <Menu className="size-5" />
          </button>
          <div className="hidden items-center gap-2 text-sm text-gray-400 lg:flex">
            <Sparkles className="size-4 text-emerald-500" />
            <span>Pilotez votre marge, pas seulement vos ventes.</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-gray-500">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_#dcfce7]" />
            Données à jour
          </div>
        </header>
        <main key={location.pathname} className="animate-rise px-4 py-6 sm:px-7 lg:px-9 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
