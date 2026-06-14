import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, BarChart3, CircleDollarSign, Eye, EyeOff, PackageCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { Button } from '../components/ui/Button'
import { FieldShell, Input } from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

const schema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(6, '6 caractères minimum'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { signIn, signUp, enterDemo } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <div className="hidden bg-moss p-10 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-lime text-moss"><CircleDollarSign className="size-6" /></div><div><p className="text-lg font-extrabold">StockPilot</p><p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/40">Resell manager</p></div></div>
        <div className="my-auto max-w-xl">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-lime">Le cockpit des revendeurs</span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.08] tracking-tight">Transformez chaque achat en décision rentable.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/55">Stock, ventes, marge nette et ROI réunis dans un tableau de bord simple à piloter.</p>
          <div className="mt-10 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/[.06] p-4"><PackageCheck className="size-5 text-lime" /><p className="mt-3 text-sm font-bold">Stock maîtrisé</p><p className="mt-1 text-xs text-white/40">Chaque unité suivie.</p></div>
            <div className="rounded-2xl bg-white/[.06] p-4"><BarChart3 className="size-5 text-lime" /><p className="mt-3 text-sm font-bold">Marge visible</p><p className="mt-1 text-xs text-white/40">Chaque coût intégré.</p></div>
          </div>
        </div>
        <p className="text-xs text-white/30">© 2026 StockPilot · Conçu pour Temu, Vinted et Pokémon.</p>
      </div>

      <div className="grid place-items-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-9 flex items-center gap-3 lg:hidden"><div className="grid size-10 place-items-center rounded-xl bg-moss text-lime"><CircleDollarSign className="size-6" /></div><p className="text-lg font-extrabold">StockPilot</p></div>
          <h2 className="text-3xl font-extrabold tracking-tight">{mode === 'login' ? 'Bon retour parmi nous' : 'Créer votre espace'}</h2>
          <p className="mt-2 text-sm text-gray-500">{mode === 'login' ? 'Connectez-vous pour retrouver votre activité.' : 'Commencez à suivre votre rentabilité dès aujourd’hui.'}</p>
          <form
            className="mt-8 space-y-5"
            onSubmit={handleSubmit(async (data) => {
              try {
                if (mode === 'login') await signIn(data.email, data.password)
                else {
                  await signUp(data.email, data.password)
                  toast.success('Compte créé. Vérifiez votre boîte e-mail.')
                }
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Authentification impossible')
              }
            })}
          >
            <FieldShell label="Adresse e-mail" error={errors.email?.message}><Input type="email" placeholder="vous@exemple.fr" {...register('email')} /></FieldShell>
            <FieldShell label="Mot de passe" error={errors.password?.message}>
              <div className="relative"><Input type={showPassword ? 'text' : 'password'} className="pr-11" placeholder="••••••••" {...register('password')} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
            </FieldShell>
            <Button type="submit" className="w-full" loading={isSubmitting}>{mode === 'login' ? 'Se connecter' : 'Créer mon compte'} <ArrowRight className="size-4" /></Button>
          </form>
          <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-line" /><span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">ou</span><span className="h-px flex-1 bg-line" /></div>
          <Button variant="secondary" className="w-full" onClick={enterDemo}>Explorer la démo</Button>
          {!isSupabaseConfigured && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-center text-xs leading-5 text-amber-700">Supabase n’est pas encore configuré : le mode démo est ouvert automatiquement.</p>}
          <p className="mt-7 text-center text-sm text-gray-500">{mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'} <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="font-bold text-moss hover:underline">{mode === 'login' ? 'Créer un compte' : 'Se connecter'}</button></p>
        </div>
      </div>
    </div>
  )
}
