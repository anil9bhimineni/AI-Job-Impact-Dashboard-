import { z } from 'zod'
import { occupationSchema, profileInputSchema, vacancySchema, type ProfileInput } from './contracts'
import { requireSupabase } from './supabaseClient'

const savedRoleSchema = z.object({
  id: z.number().int().positive(),
  occupation_id: z.number().int().positive(),
  location_id: z.number().int().positive().nullable(),
  created_at: z.string().datetime({ offset: true }),
  occupation: occupationSchema,
})

async function authenticatedUserId() {
  const client = requireSupabase()
  const { data, error } = await client.auth.getClaims()
  if (error || !data?.claims?.sub) throw error ?? new Error('Sign in is required.')
  return String(data.claims.sub)
}

async function occupationIdForSlug(slug: string) {
  const client = requireSupabase()
  const parsedSlug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).parse(slug)
  const { data, error } = await client.from('occupations').select('id').eq('slug', parsedSlug).single()
  if (error) throw error
  return z.object({ id: z.number().int().positive() }).parse(data).id
}

export async function sendMagicLink(email: string) {
  const client = requireSupabase()
  const parsedEmail = z.string().email().parse(email.trim())
  const redirectTo = `${window.location.origin}${window.location.pathname}${window.location.search}`
  const { error } = await client.auth.signInWithOtp({ email: parsedEmail, options: { emailRedirectTo: redirectTo } })
  if (error) throw error
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut()
  if (error) throw error
}

export async function upsertProfile(input: ProfileInput) {
  const client = requireSupabase()
  const userId = await authenticatedUserId()
  const profile = profileInputSchema.parse(input)
  const { data, error } = await client.from('profiles').upsert({ id: userId, ...profile }).select().single()
  if (error) throw error
  return data
}

export async function listSavedRoles() {
  const client = requireSupabase()
  await authenticatedUserId()
  const { data, error } = await client
    .from('saved_roles')
    .select('id, occupation_id, location_id, created_at, occupation:occupations!saved_roles_occupation_id_fkey(id, slug, title, sector, occupation_family, description, is_published)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return z.array(savedRoleSchema).parse(data)
}

export async function saveRoleBySlug(slug: string, locationId: number | null = null) {
  const client = requireSupabase()
  const userId = await authenticatedUserId()
  const { data: occupation, error: occupationError } = await client
    .from('occupations')
    .select('id')
    .eq('slug', slug)
    .single()
  if (occupationError) throw occupationError
  const { error } = await client.from('saved_roles').upsert({
    user_id: userId,
    occupation_id: occupation.id,
    location_id: locationId,
  }, { onConflict: 'user_id,occupation_id,location_id' })
  if (error) throw error
}

export async function toggleWatchlistBySlug(slug: string) {
  const client = requireSupabase()
  const userId = await authenticatedUserId()
  const occupationId = await occupationIdForSlug(slug)
  const { data: existing, error: readError } = await client
    .from('watchlists')
    .select('id')
    .eq('user_id', userId)
    .eq('occupation_id', occupationId)
    .is('location_id', null)
    .maybeSingle()
  if (readError) throw readError
  if (existing) {
    const { error } = await client.from('watchlists').delete().eq('id', existing.id)
    if (error) throw error
    return false
  }
  const { error } = await client.from('watchlists').insert({ user_id: userId, occupation_id: occupationId })
  if (error) throw error
  return true
}

export async function listWatchlists() {
  const client = requireSupabase()
  await authenticatedUserId()
  const { data, error } = await client
    .from('watchlists')
    .select('id,risk_alert,demand_alert,salary_alert,layoff_alert,weekly_digest,created_at,occupation:occupations!watchlists_occupation_id_fkey(id,slug,title,sector,occupation_family,description,is_published)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return z.array(z.object({
    id: z.number().int().positive(),
    risk_alert: z.boolean(),
    demand_alert: z.boolean(),
    salary_alert: z.boolean(),
    layoff_alert: z.boolean(),
    weekly_digest: z.boolean(),
    created_at: z.string().datetime({ offset: true }),
    occupation: occupationSchema,
  })).parse(data)
}

export async function getAlertPreferences() {
  const client = requireSupabase()
  const userId = await authenticatedUserId()
  const { data, error } = await client.from('alert_preferences').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data ? z.object({
    email_enabled: z.boolean(),
    weekly_day: z.number().int().min(0).max(6),
    timezone: z.string(),
    monthly_digest: z.boolean(),
  }).parse(data) : { email_enabled: true, weekly_day: 1, timezone: 'Asia/Kolkata', monthly_digest: true }
}

export async function saveAlertPreferences(input: { email_enabled: boolean; weekly_day: number; monthly_digest: boolean }) {
  const client = requireSupabase()
  const userId = await authenticatedUserId()
  const parsed = z.object({ email_enabled: z.boolean(), weekly_day: z.number().int().min(0).max(6), monthly_digest: z.boolean() }).parse(input)
  const { error } = await client.from('alert_preferences').upsert({
    user_id: userId,
    ...parsed,
    timezone: 'Asia/Kolkata',
    unsubscribed_at: parsed.email_enabled ? null : new Date().toISOString(),
  })
  if (error) throw error
}

export async function listVerifiedVacancies(filters: {
  occupationId: number
  locationId?: number
  remoteOnly?: boolean
  fresherOnly?: boolean
}) {
  const client = requireSupabase()
  let query = client
    .from('vacancy_observations')
    .select('id,title,application_url,employment_type,salary_min_inr,salary_max_inr,salary_period,is_remote,is_fresher,verification_status,posted_at,expires_at,fetched_at,employer:employers(name,is_verified),location:locations(name,state_code),source:data_sources(name,homepage_url)')
    .eq('occupation_id', filters.occupationId)
    .eq('is_active', true)
    .order('posted_at', { ascending: false, nullsFirst: false })
    .limit(100)
  if (filters.locationId) query = query.eq('location_id', filters.locationId)
  if (filters.remoteOnly) query = query.eq('is_remote', true)
  if (filters.fresherOnly) query = query.eq('is_fresher', true)
  const { data, error } = await query
  if (error) throw error
  return z.array(vacancySchema).parse(data)
}
