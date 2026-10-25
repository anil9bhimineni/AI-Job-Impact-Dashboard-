import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  hiringDemandIndex,
  layoffRiskScore,
} from '../src/jobs-dashboard/scoringModel.js'

const root = resolve(import.meta.dirname, '..')
const input = await readFile(resolve(root, 'data/sample_occupations.jsonl'), 'utf8')
const roles = input.trim().split('\n').map((line) => JSON.parse(line))
const outputPath = resolve(root, 'supabase/migrations/20260804143000_reference_occupations.sql')

const slugify = (value) => String(value ?? '')
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

const literal = (value) => `'${String(value ?? '').replaceAll("'", "''")}'`
const pct = (value) => Math.max(0, Math.min(100, Number(value) * 10))

const occupationValues = roles.map((role) => `(
  ${literal(slugify(role.job_role || role.occupation_title))},
  ${literal(role.job_role || role.occupation_title)},
  ${literal(role.india_sector)},
  ${literal(role.job_family)},
  ${literal(role.scores_rationale)},
  true
)`).join(',\n')

const scoreValues = roles.map((role) => `(
  ${literal(slugify(role.job_role || role.occupation_title))},
  ${pct(role.automation_risk_score)},
  ${layoffRiskScore(role) * 10},
  ${hiringDemandIndex(role)},
  ${pct(role.remote_work_score)},
  0.72,
  ${literal(role.scores_rationale)}
)`).join(',\n')

const sql = `-- Generated from data/sample_occupations.jsonl. Re-run npm run generate:platform-seed after source changes.
-- These are analyst-reviewed model records, not vacancy counts or national employment totals.

insert into public.data_sources (
  source_key, name, source_type, homepage_url, refresh_cadence, is_verified, last_checked_at
) values (
  'india-role-model-2026-08',
  'India role model 2026.08',
  'model',
  'https://global-ai-jobs-impact-dashboard.netlify.app/methodology',
  'versioned release',
  true,
  '2026-08-04T00:00:00Z'
) on conflict (source_key) do update set
  name = excluded.name,
  last_checked_at = excluded.last_checked_at;

insert into public.score_versions (version_key, label, methodology_url, rules, published_at)
values (
  '2026.08-v2',
  'India career outlook 2026.08 v2',
  'https://global-ai-jobs-impact-dashboard.netlify.app/methodology',
  '{"scale":"0-100","employment_basis":"modelled","vacancies_separate":true}'::jsonb,
  '2026-08-04T00:00:00Z'
) on conflict (version_key) do update set
  label = excluded.label,
  rules = excluded.rules,
  published_at = excluded.published_at;

insert into public.occupations (slug, title, sector, occupation_family, description, is_published)
values
${occupationValues}
on conflict (slug) do update set
  title = excluded.title,
  sector = excluded.sector,
  occupation_family = excluded.occupation_family,
  description = excluded.description,
  is_published = excluded.is_published,
  updated_at = now();

with score_input (slug, ai_exposure, layoff_pressure, demand_outlook, remote_feasibility, confidence, rationale) as (
  values
${scoreValues}
), resolved as (
  select
    o.id as occupation_id,
    sv.id as score_version_id,
    ds.id as source_id,
    si.ai_exposure,
    si.layoff_pressure,
    si.demand_outlook,
    si.remote_feasibility,
    si.confidence,
    si.rationale
  from score_input si
  join public.occupations o on o.slug = si.slug
  cross join public.score_versions sv
  cross join public.data_sources ds
  where sv.version_key = '2026.08-v2'
    and ds.source_key = 'india-role-model-2026-08'
)
insert into public.occupation_scores (
  occupation_id, location_id, score_version_id, source_id, evidence_kind, as_of_date,
  ai_exposure, layoff_pressure, demand_outlook, remote_feasibility, confidence, rationale
)
select
  occupation_id, null, score_version_id, source_id, 'analyst_reviewed', '2026-08-04',
  ai_exposure, layoff_pressure, demand_outlook, remote_feasibility, confidence, rationale
from resolved
on conflict (occupation_id, location_id, score_version_id, as_of_date) do update set
  source_id = excluded.source_id,
  evidence_kind = excluded.evidence_kind,
  ai_exposure = excluded.ai_exposure,
  layoff_pressure = excluded.layoff_pressure,
  demand_outlook = excluded.demand_outlook,
  remote_feasibility = excluded.remote_feasibility,
  confidence = excluded.confidence,
  rationale = excluded.rationale;
`

await writeFile(outputPath, sql)
console.log(`Wrote ${roles.length} occupations to ${outputPath}`)
