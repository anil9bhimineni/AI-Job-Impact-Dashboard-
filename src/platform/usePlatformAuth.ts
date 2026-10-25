import { useEffect, useState } from 'react'
import type { JwtPayload } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabaseClient'

type AuthState = {
  status: 'unconfigured' | 'loading' | 'signed_out' | 'signed_in'
  claims: JwtPayload | null
}

export function usePlatformAuth(): AuthState {
  const [state, setState] = useState<AuthState>(() => ({
    status: isSupabaseConfigured ? 'loading' : 'unconfigured',
    claims: null,
  }))

  useEffect(() => {
    if (!supabase) return undefined
    let active = true
    const refresh = async () => {
      const { data } = await supabase.auth.getClaims()
      if (!active) return
      setState(data?.claims ? { status: 'signed_in', claims: data.claims } : { status: 'signed_out', claims: null })
    }
    void refresh()
    const { data: listener } = supabase.auth.onAuthStateChange(() => { void refresh() })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return state
}

