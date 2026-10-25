import { useState, type FormEvent } from 'react'
import { CircleUserRound, LogOut, Mail, X } from 'lucide-react'
import { sendMagicLink, signOut } from './platformRepository'
import { usePlatformAuth } from './usePlatformAuth'

export function AccountMenu() {
  const auth = usePlatformAuth()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('sending')
    try {
      await sendMagicLink(email)
      setStatus('sent')
      setMessage('Check your email for the secure sign-in link.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Sign-in could not be started.')
    }
  }

  if (auth.status === 'unconfigured') return null

  if (auth.status === 'signed_in') {
    return (
      <button className="account-trigger" type="button" onClick={() => void signOut()} title="Sign out">
        <LogOut size={15} /> Sign out
      </button>
    )
  }

  return (
    <>
      <button className="account-trigger" type="button" onClick={() => setOpen(true)} disabled={auth.status === 'loading'}>
        <CircleUserRound size={16} /> {auth.status === 'loading' ? 'Account…' : 'Sign in'}
      </button>
      {open && (
        <div className="account-dialog-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section className="account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="account-dialog-close" type="button" aria-label="Close sign-in" onClick={() => setOpen(false)}><X size={18} /></button>
            <span className="account-dialog-icon"><Mail size={22} /></span>
            <h2 id="account-dialog-title">Save your career plan</h2>
            <p>Sign in with a secure email link to sync roles, comparisons, watchlists, and learning progress.</p>
            <form onSubmit={submit}>
              <label htmlFor="account-email">Email address</label>
              <input id="account-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Email me a sign-in link'}</button>
            </form>
            {message && <small role={status === 'error' ? 'alert' : 'status'}>{message}</small>}
            <em>No password required. We never expose the Supabase service key in the browser.</em>
          </section>
        </div>
      )}
    </>
  )
}
