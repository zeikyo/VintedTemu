import { Bell, Check, Cloud, Database, LogOut, RotateCcw, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FieldShell, Input } from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

export function SettingsPage() {
  const { user, isDemo, signOut } = useAuth()
  const [notifications, setNotifications] = useState(true)

  return (
    <>
      <PageHeader title="Paramètres" description="Gérez votre profil et la configuration de votre espace." />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="mb-6 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-mint text-moss"><UserRound className="size-5" /></div><div><h2 className="font-bold">Profil</h2><p className="text-xs text-gray-400">Informations visibles dans votre espace.</p></div></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <FieldShell label="Nom complet"><Input defaultValue={user?.user_metadata.full_name || ''} /></FieldShell>
              <FieldShell label="Adresse e-mail"><Input type="email" defaultValue={user?.email || ''} disabled /></FieldShell>
            </div>
            <Button className="mt-5" onClick={() => toast.success('Profil enregistré')}>Enregistrer le profil</Button>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Bell className="size-5" /></div><div><h2 className="font-bold">Notifications</h2><p className="text-xs text-gray-400">Alertes de stock et rappels d’activité.</p></div></div>
            <button onClick={() => setNotifications((value) => !value)} className="flex w-full items-center justify-between rounded-xl border border-line p-4 text-left">
              <div><p className="text-sm font-bold">Alerte stock faible</p><p className="mt-1 text-xs text-gray-400">Prévenir lorsqu’il reste moins de 3 unités.</p></div>
              <span className={`relative h-6 w-11 rounded-full transition ${notifications ? 'bg-moss' : 'bg-gray-200'}`}><span className={`absolute top-1 size-4 rounded-full bg-white transition ${notifications ? 'left-6' : 'left-1'}`} /></span>
            </button>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-mint text-moss"><Database className="size-5" /></div><div><p className="text-sm font-bold">Connexion données</p><p className="text-xs text-gray-400">{isSupabaseConfigured && !isDemo ? 'Supabase connecté' : 'Mode démonstration local'}</p></div></div>
            <div className="mt-5 space-y-3 border-t border-line pt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500"><Check className="size-4 text-emerald-600" /> Calculs automatiques actifs</div>
              <div className="flex items-center gap-2 text-xs text-gray-500"><ShieldCheck className="size-4 text-emerald-600" /> Isolation des données par utilisateur</div>
              <div className="flex items-center gap-2 text-xs text-gray-500"><Cloud className="size-4 text-emerald-600" /> Prêt pour Vercel</div>
            </div>
          </Card>

          {isDemo && (
            <Card className="p-5">
              <p className="text-sm font-bold">Effacer les données locales</p>
              <p className="mt-1 text-xs leading-5 text-gray-400">Supprime tous les produits, ventes et dépenses enregistrés sur cet appareil.</p>
              <Button variant="secondary" className="mt-4 w-full" onClick={() => { localStorage.removeItem('stockpilot-user-data-v2'); window.location.reload() }}><RotateCcw className="size-4" /> Tout effacer</Button>
            </Card>
          )}

          <Button variant="danger" className="w-full" onClick={async () => { await signOut(); toast.success('Déconnexion réussie') }}><LogOut className="size-4" /> Se déconnecter</Button>
        </div>
      </div>
    </>
  )
}
