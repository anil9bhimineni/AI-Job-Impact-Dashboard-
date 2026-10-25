import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

const configResult = z.object({
  url: z.string().url(),
  publishableKey: z.string().min(20),
}).safeParse({
  url: import.meta.env.VITE_SUPABASE_URL,
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
})

export const isSupabaseConfigured = configResult.success

export const supabase: SupabaseClient | null = configResult.success
  ? createClient(configResult.data.url, configResult.data.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase is not configured. Add the project URL and publishable key.')
  return supabase
}

