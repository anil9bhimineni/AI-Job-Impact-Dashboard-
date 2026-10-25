import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const migrationUrl = new URL('../supabase/migrations/20260804135057_platform_foundation.sql', import.meta.url)
const advisorMigrationUrl = new URL('../supabase/migrations/20260804141037_advisor_fixes.sql', import.meta.url)
const grantsMigrationUrl = new URL('../supabase/migrations/20260804141349_least_privilege_grants.sql', import.meta.url)
const referenceMigrationUrl = new URL('../supabase/migrations/20260804143000_reference_occupations.sql', import.meta.url)
const envUrl = new URL('../.env.example', import.meta.url)

const tableNames = [
  'data_sources', 'occupations', 'occupation_aliases', 'locations', 'employers', 'skills',
  'occupation_skills', 'ingestion_runs', 'raw_source_records', 'ingestion_quarantine',
  'score_versions', 'occupation_scores', 'vacancy_observations', 'salary_observations',
  'employer_events', 'education_pathways', 'course_recommendations', 'content_translations',
  'profiles', 'saved_roles', 'saved_comparisons', 'watchlists', 'alert_preferences',
  'change_events', 'alert_deliveries', 'quiz_results', 'transition_plans', 'transition_steps',
  'skill_simulations', 'referral_events', 'institutions', 'institution_members', 'cohorts',
  'cohort_members', 'report_exports', 'api_clients', 'embeddable_widgets', 'score_disputes',
]

test('every foundation table is included in the RLS activation block', async () => {
  const sql = await readFile(migrationUrl, 'utf8')
  const rlsBlock = sql.slice(sql.indexOf('do $$\ndeclare table_name text;'), sql.indexOf('-- Explicit Data API grants'))
  for (const table of tableNames) assert.match(rlsBlock, new RegExp(`'${table}'`), `${table} missing from RLS block`)
  assert.match(rlsBlock, /enable row level security/)
})

test('personal policies bind rows to auth.uid and updates use WITH CHECK', async () => {
  const sql = await readFile(migrationUrl, 'utf8')
  for (const table of ['profiles', 'saved_roles', 'saved_comparisons', 'watchlists', 'alert_preferences', 'transition_plans']) {
    assert.match(sql, new RegExp(`create policy ${table}[^;]+auth\\.uid\\(\\)[^;]+`, 's'))
  }
  assert.match(sql, /profiles_owner_update[\s\S]+with check \(\(select auth\.uid\(\)\) = id\)/)
  assert.match(sql, /transition_plans_owner_all[\s\S]+with check \(\(select auth\.uid\(\)\) = user_id\)/)
})

test('market evidence contracts do not conflate postings with employment', async () => {
  const sql = await readFile(migrationUrl, 'utf8')
  assert.match(sql, /evidence_kind in \('measured', 'modelled', 'analyst_reviewed'\)/)
  assert.match(sql, /Observed vacancy postings only; never interpreted as total labour-force employment/)
  assert.match(sql, /verification_status in \('verified', 'source_claimed', 'unverified'\)/)
  assert.match(sql, /ingestion_quarantine/)
})

test('browser environment never asks for a service-role key', async () => {
  const env = await readFile(envUrl, 'utf8')
  assert.doesNotMatch(env, /VITE_[A-Z0-9_]*SERVICE_ROLE/)
  assert.match(env, /^VITE_SUPABASE_PUBLISHABLE_KEY=$/m)
  assert.match(env, /^SUPABASE_SERVICE_ROLE_KEY=$/m)
})

test('API client hashes are not granted as readable browser columns', async () => {
  const sql = await readFile(migrationUrl, 'utf8')
  const grant = sql.match(/grant select \(([^)]+)\)\s+on public\.api_clients to authenticated;/s)
  assert.ok(grant)
  assert.doesNotMatch(grant[1], /key_hash/)
})

test('migration avoids writes to managed auth schema and extension version pinning', async () => {
  const sql = await readFile(migrationUrl, 'utf8')
  assert.doesNotMatch(sql, /create\s+(table|function|trigger).*auth\./i)
  assert.doesNotMatch(sql, /create extension[^;]+version/i)
})

test('advisor follow-up indexes nullable foreign keys and removes overlapping widget reads', async () => {
  const sql = await readFile(advisorMigrationUrl, 'utf8')
  assert.match(sql, /salary_observations_location_id_idx/)
  assert.match(sql, /watchlists_location_id_idx/)
  assert.match(sql, /drop policy widgets_public_read/)
  assert.match(sql, /widgets_anon_read[\s\S]+to anon/)
  assert.match(sql, /widgets_authenticated_read[\s\S]+created_by = \(select auth\.uid\(\)\)/)
  assert.doesNotMatch(sql, /for all/)
})

test('least-privilege migration removes legacy defaults before explicit grants', async () => {
  const sql = await readFile(grantsMigrationUrl, 'utf8')
  assert.match(sql, /revoke all privileges on all tables in schema public from anon, authenticated/)
  assert.match(sql, /alter default privileges in schema public revoke all on tables from anon, authenticated/)
  assert.match(sql, /grant insert on public\.quiz_results, public\.referral_events, public\.score_disputes to anon/)
  assert.doesNotMatch(sql, /grant select[^;]+public\.profiles[^;]+to anon/s)
  assert.doesNotMatch(sql, /grant (?:select, )?insert, update, delete[^;]+public\.api_clients/s)
})

test('reference migration publishes every audited role and keeps evidence labels explicit', async () => {
  const sql = await readFile(referenceMigrationUrl, 'utf8')
  const source = await readFile(new URL('../data/sample_occupations.jsonl', import.meta.url), 'utf8')
  const expectedRoles = source.trim().split('\n').length
  const publishedRows = sql.match(/\n  true\n\)/g) ?? []
  assert.equal(publishedRows.length, expectedRoles)
  assert.match(sql, /'analyst_reviewed'/)
  assert.match(sql, /"employment_basis":"modelled"/)
  assert.match(sql, /"vacancies_separate":true/)
  assert.match(sql, /customer-support-executive/)
  assert.match(sql, /plumber/)
})
