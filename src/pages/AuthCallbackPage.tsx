import { AlertCircle, CheckCircle2, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { supabase } from '../lib/supabase'

type CallbackState = 'loading' | 'success' | 'error'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<CallbackState>('loading')
  const [message, setMessage] = useState('Validation de votre adresse e-mail…')

  useEffect(() => {
    const finishConfirmation = async () => {
      const url = new URL(window.location.href)
      const hash = new URLSearchParams(url.hash.replace(/^#/, ''))
      const errorDescription =
        url.searchParams.get('error_description') || hash.get('error_description')

      if (errorDescription) {
        setState('error')
        setMessage(decodeURIComponent(errorDescription.replace(/\+/g, ' ')))
        return
      }

      const tokenHash = url.searchParams.get('token_hash')
      const type = url.searchParams.get('type')
      const code = url.searchParams.get('code')

      if (tokenHash && type === 'email') {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email',
        })
        if (error) {
          setState('error')
          setMessage(error.message)
          return
        }
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setState('error')
          setMessage(error.message)
          return
        }
      } else {
        const { data, error } = await supabase.auth.getSession()
        if (error || !data.session) {
          setState('error')
          setMessage(
            error?.message ||
              'Le lien est invalide ou a expiré. Demandez un nouvel e-mail de confirmation.',
          )
          return
        }
      }

      setState('success')
      setMessage('Adresse e-mail confirmée. Votre espace est prêt.')
      window.setTimeout(() => navigate('/', { replace: true }), 1200)
    }

    void finishConfirmation()
  }, [navigate])

  return (
    <div className="grid min-h-screen place-items-center bg-canvas p-5">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
        <div
          className={`mx-auto grid size-14 place-items-center rounded-2xl ${
            state === 'error'
              ? 'bg-rose-50 text-rose-600'
              : 'bg-mint text-moss'
          }`}
        >
          {state === 'loading' && <LoaderCircle className="size-7 animate-spin" />}
          {state === 'success' && <CheckCircle2 className="size-7" />}
          {state === 'error' && <AlertCircle className="size-7" />}
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-ink">
          {state === 'loading'
            ? 'Confirmation en cours'
            : state === 'success'
              ? 'E-mail confirmé'
              : 'Confirmation impossible'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">{message}</p>
        {state === 'error' && (
          <Link to="/" className="mt-6 block">
            <Button className="w-full">Retour à la connexion</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
