import { z } from 'zod'

export const evidenceKindSchema = z.enum(['measured', 'modelled', 'analyst_reviewed'])
export const verificationStatusSchema = z.enum(['verified', 'source_claimed', 'unverified'])

export const occupationSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  sector: z.string().min(1),
  occupation_family: z.string().min(1),
  description: z.string().nullable(),
  is_published: z.boolean(),
})

export const vacancySchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  application_url: z.string().url(),
  employment_type: z.string().nullable(),
  salary_min_inr: z.coerce.number().nonnegative().nullable(),
  salary_max_inr: z.coerce.number().nonnegative().nullable(),
  salary_period: z.enum(['hour', 'day', 'month', 'year']).nullable(),
  is_remote: z.boolean(),
  is_fresher: z.boolean(),
  verification_status: verificationStatusSchema,
  posted_at: z.string().datetime({ offset: true }).nullable(),
  expires_at: z.string().datetime({ offset: true }).nullable(),
  fetched_at: z.string().datetime({ offset: true }),
  employer: z.object({ name: z.string(), is_verified: z.boolean() }).nullable().optional(),
  location: z.object({ name: z.string(), state_code: z.string().nullable() }).nullable().optional(),
  source: z.object({ name: z.string(), homepage_url: z.string().url().nullable() }).optional(),
})

export const profileInputSchema = z.object({
  display_name: z.string().trim().min(1).max(120).nullable().optional(),
  preferred_locale: z.string().min(2).max(20).default('en-IN'),
  home_location_id: z.number().int().positive().nullable().optional(),
  current_occupation_id: z.number().int().positive().nullable().optional(),
  experience_years: z.number().nonnegative().max(80).nullable().optional(),
  education_level: z.string().max(120).nullable().optional(),
  current_salary_inr_year: z.number().nonnegative().max(1_000_000_000).nullable().optional(),
})

export type Occupation = z.infer<typeof occupationSchema>
export type Vacancy = z.infer<typeof vacancySchema>
export type ProfileInput = z.infer<typeof profileInputSchema>

