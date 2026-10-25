-- India Jobs Dashboard platform foundation.
-- Public reference data is source-labelled; personal and institutional data is protected by RLS.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.data_sources (
  id bigint generated always as identity primary key,
  source_key text not null unique,
  name text not null,
  source_type text not null check (source_type in ('survey', 'administrative', 'job_board', 'employer', 'salary_report', 'analyst', 'model')),
  homepage_url text,
  licence_url text,
  refresh_cadence text,
  is_verified boolean not null default false,
  last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.occupations (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  sector text not null,
  occupation_family text not null,
  description text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.occupation_aliases (
  id bigint generated always as identity primary key,
  occupation_id bigint not null references public.occupations(id) on delete cascade,
  alias text not null,
  normalized_alias text not null unique,
  created_at timestamptz not null default now()
);
create index occupation_aliases_occupation_id_idx on public.occupation_aliases (occupation_id);

create table public.locations (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  location_type text not null check (location_type in ('country', 'state', 'union_territory', 'metro', 'city', 'district')),
  parent_id bigint references public.locations(id) on delete restrict,
  state_code text,
  city_tier text check (city_tier is null or city_tier in ('tier_1', 'tier_2', 'tier_3', 'rural')),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index locations_parent_id_idx on public.locations (parent_id);
create index locations_type_published_idx on public.locations (location_type, name) where is_published;

create table public.employers (
  id bigint generated always as identity primary key,
  name text not null,
  normalized_name text not null unique,
  employer_type text check (employer_type is null or employer_type in ('private', 'public_sector', 'government', 'nonprofit', 'staffing', 'self_employment')),
  website_url text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.skills (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  skill_type text not null check (skill_type in ('technical', 'digital', 'domain', 'human', 'language', 'tool', 'licence')),
  is_published boolean not null default true
);

create table public.occupation_skills (
  occupation_id bigint not null references public.occupations(id) on delete cascade,
  skill_id bigint not null references public.skills(id) on delete cascade,
  importance smallint not null check (importance between 1 and 5),
  source_id bigint references public.data_sources(id) on delete restrict,
  reviewed_at timestamptz,
  primary key (occupation_id, skill_id)
);
create index occupation_skills_skill_id_idx on public.occupation_skills (skill_id);
create index occupation_skills_source_id_idx on public.occupation_skills (source_id);

create table public.ingestion_runs (
  id bigint generated always as identity primary key,
  source_id bigint not null references public.data_sources(id) on delete restrict,
  status text not null check (status in ('started', 'succeeded', 'partial', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  raw_count bigint not null default 0 check (raw_count >= 0),
  accepted_count bigint not null default 0 check (accepted_count >= 0),
  quarantined_count bigint not null default 0 check (quarantined_count >= 0),
  error_summary text
);
create index ingestion_runs_source_started_idx on public.ingestion_runs (source_id, started_at desc);

create table public.raw_source_records (
  id bigint generated always as identity primary key,
  ingestion_run_id bigint not null references public.ingestion_runs(id) on delete cascade,
  source_record_key text,
  observed_at timestamptz,
  payload jsonb not null,
  payload_hash text not null,
  created_at timestamptz not null default now(),
  unique (ingestion_run_id, payload_hash)
);
create index raw_source_records_ingestion_run_id_idx on public.raw_source_records (ingestion_run_id);

create table public.ingestion_quarantine (
  id bigint generated always as identity primary key,
  ingestion_run_id bigint not null references public.ingestion_runs(id) on delete cascade,
  raw_record_id bigint references public.raw_source_records(id) on delete set null,
  reason_code text not null,
  reason_detail text,
  created_at timestamptz not null default now()
);
create index ingestion_quarantine_run_id_idx on public.ingestion_quarantine (ingestion_run_id);
create index ingestion_quarantine_raw_record_id_idx on public.ingestion_quarantine (raw_record_id);

create table public.score_versions (
  id bigint generated always as identity primary key,
  version_key text not null unique,
  label text not null,
  methodology_url text,
  rules jsonb not null,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.occupation_scores (
  id bigint generated always as identity primary key,
  occupation_id bigint not null references public.occupations(id) on delete cascade,
  location_id bigint references public.locations(id) on delete cascade,
  score_version_id bigint not null references public.score_versions(id) on delete restrict,
  source_id bigint not null references public.data_sources(id) on delete restrict,
  evidence_kind text not null check (evidence_kind in ('measured', 'modelled', 'analyst_reviewed')),
  as_of_date date not null,
  ai_exposure numeric(5,2) not null check (ai_exposure between 0 and 100),
  layoff_pressure numeric(5,2) not null check (layoff_pressure between 0 and 100),
  demand_outlook numeric(5,2) not null check (demand_outlook between 0 and 100),
  remote_feasibility numeric(5,2) not null check (remote_feasibility between 0 and 100),
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  rationale text not null,
  created_at timestamptz not null default now(),
  unique nulls not distinct (occupation_id, location_id, score_version_id, as_of_date)
);
create index occupation_scores_occupation_date_idx on public.occupation_scores (occupation_id, as_of_date desc);
create index occupation_scores_location_date_idx on public.occupation_scores (location_id, as_of_date desc) where location_id is not null;
create index occupation_scores_version_id_idx on public.occupation_scores (score_version_id);
create index occupation_scores_source_id_idx on public.occupation_scores (source_id);

create table public.vacancy_observations (
  id bigint generated always as identity primary key,
  occupation_id bigint not null references public.occupations(id) on delete restrict,
  employer_id bigint references public.employers(id) on delete restrict,
  location_id bigint references public.locations(id) on delete restrict,
  source_id bigint not null references public.data_sources(id) on delete restrict,
  source_record_key text not null,
  title text not null,
  application_url text not null,
  employment_type text,
  experience_min_years numeric(4,1) check (experience_min_years is null or experience_min_years >= 0),
  experience_max_years numeric(4,1) check (experience_max_years is null or experience_max_years >= experience_min_years),
  salary_min_inr numeric(14,2) check (salary_min_inr is null or salary_min_inr >= 0),
  salary_max_inr numeric(14,2) check (salary_max_inr is null or salary_max_inr >= salary_min_inr),
  salary_period text check (salary_period is null or salary_period in ('hour', 'day', 'month', 'year')),
  is_remote boolean not null default false,
  is_fresher boolean not null default false,
  verification_status text not null check (verification_status in ('verified', 'source_claimed', 'unverified')),
  posted_at timestamptz,
  expires_at timestamptz,
  fetched_at timestamptz not null default now(),
  is_active boolean not null default true,
  unique (source_id, source_record_key)
);
create index vacancy_observations_occupation_active_idx on public.vacancy_observations (occupation_id, posted_at desc) where is_active;
create index vacancy_observations_location_active_idx on public.vacancy_observations (location_id, posted_at desc) where is_active;
create index vacancy_observations_source_id_idx on public.vacancy_observations (source_id);
create index vacancy_observations_employer_id_idx on public.vacancy_observations (employer_id);
create index vacancy_observations_remote_active_idx on public.vacancy_observations (occupation_id, posted_at desc) where is_active and is_remote;
create index vacancy_observations_fresher_active_idx on public.vacancy_observations (occupation_id, posted_at desc) where is_active and is_fresher;

create table public.salary_observations (
  id bigint generated always as identity primary key,
  occupation_id bigint not null references public.occupations(id) on delete restrict,
  location_id bigint references public.locations(id) on delete restrict,
  employer_id bigint references public.employers(id) on delete restrict,
  source_id bigint not null references public.data_sources(id) on delete restrict,
  evidence_kind text not null check (evidence_kind in ('measured', 'modelled', 'analyst_reviewed')),
  experience_band text not null,
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  sample_size bigint check (sample_size is null or sample_size > 0),
  p10_inr_year numeric(14,2),
  p25_inr_year numeric(14,2),
  p50_inr_year numeric(14,2) not null,
  p75_inr_year numeric(14,2),
  p90_inr_year numeric(14,2),
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  created_at timestamptz not null default now(),
  check (p10_inr_year is null or p10_inr_year <= p50_inr_year),
  check (p25_inr_year is null or p25_inr_year <= p50_inr_year),
  check (p75_inr_year is null or p75_inr_year >= p50_inr_year),
  check (p90_inr_year is null or p90_inr_year >= p50_inr_year)
);
create index salary_observations_lookup_idx on public.salary_observations (occupation_id, location_id, experience_band, period_end desc);
create index salary_observations_source_id_idx on public.salary_observations (source_id);
create index salary_observations_employer_id_idx on public.salary_observations (employer_id) where employer_id is not null;

create table public.employer_events (
  id bigint generated always as identity primary key,
  employer_id bigint not null references public.employers(id) on delete restrict,
  occupation_id bigint references public.occupations(id) on delete restrict,
  location_id bigint references public.locations(id) on delete restrict,
  source_id bigint not null references public.data_sources(id) on delete restrict,
  event_type text not null check (event_type in ('hiring', 'layoff', 'expansion', 'freeze')),
  event_date date not null,
  affected_count bigint check (affected_count is null or affected_count >= 0),
  title text not null,
  source_url text not null,
  verification_status text not null check (verification_status in ('verified', 'source_claimed', 'unverified')),
  created_at timestamptz not null default now()
);
create index employer_events_employer_date_idx on public.employer_events (employer_id, event_date desc);
create index employer_events_occupation_date_idx on public.employer_events (occupation_id, event_date desc) where occupation_id is not null;
create index employer_events_source_id_idx on public.employer_events (source_id);
create index employer_events_location_id_idx on public.employer_events (location_id) where location_id is not null;

create table public.education_pathways (
  id bigint generated always as identity primary key,
  occupation_id bigint not null references public.occupations(id) on delete cascade,
  pathway_type text not null check (pathway_type in ('degree', 'iti', 'diploma', 'certification', 'apprenticeship', 'government_exam', 'short_course')),
  title text not null,
  provider text,
  official_url text,
  duration_text text,
  eligibility_text text,
  verification_status text not null check (verification_status in ('verified', 'provider_claimed', 'editorial')),
  source_id bigint references public.data_sources(id) on delete restrict,
  is_published boolean not null default false,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index education_pathways_occupation_published_idx on public.education_pathways (occupation_id, pathway_type) where is_published;
create index education_pathways_source_id_idx on public.education_pathways (source_id) where source_id is not null;

create table public.course_recommendations (
  id bigint generated always as identity primary key,
  skill_id bigint not null references public.skills(id) on delete cascade,
  title text not null,
  provider text not null,
  provider_url text not null,
  referral_url text,
  referral_disclosure text,
  verification_status text not null check (verification_status in ('verified', 'provider_claimed', 'editorial')),
  is_published boolean not null default false,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index course_recommendations_skill_published_idx on public.course_recommendations (skill_id, provider) where is_published;

create table public.content_translations (
  id bigint generated always as identity primary key,
  entity_type text not null check (entity_type in ('occupation', 'location', 'education_pathway', 'market_page', 'ui')),
  entity_key text not null,
  locale text not null,
  content jsonb not null,
  review_status text not null check (review_status in ('draft', 'machine_reviewed', 'human_reviewed', 'published')),
  reviewer_note text,
  published_at timestamptz,
  unique (entity_type, entity_key, locale)
);
create index content_translations_published_idx on public.content_translations (locale, entity_type, entity_key) where review_status = 'published';

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_locale text not null default 'en-IN',
  home_location_id bigint references public.locations(id) on delete set null,
  current_occupation_id bigint references public.occupations(id) on delete set null,
  experience_years numeric(4,1) check (experience_years is null or experience_years >= 0),
  education_level text,
  current_salary_inr_year numeric(14,2) check (current_salary_inr_year is null or current_salary_inr_year >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_home_location_id_idx on public.profiles (home_location_id) where home_location_id is not null;
create index profiles_current_occupation_id_idx on public.profiles (current_occupation_id) where current_occupation_id is not null;

create table public.saved_roles (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  occupation_id bigint not null references public.occupations(id) on delete cascade,
  location_id bigint references public.locations(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique nulls not distinct (user_id, occupation_id, location_id)
);
create index saved_roles_user_created_idx on public.saved_roles (user_id, created_at desc);
create index saved_roles_occupation_id_idx on public.saved_roles (occupation_id);
create index saved_roles_location_id_idx on public.saved_roles (location_id) where location_id is not null;

create table public.saved_comparisons (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  left_occupation_id bigint not null references public.occupations(id) on delete cascade,
  right_occupation_id bigint not null references public.occupations(id) on delete cascade,
  location_id bigint references public.locations(id) on delete cascade,
  label text,
  created_at timestamptz not null default now(),
  check (left_occupation_id <> right_occupation_id)
);
create index saved_comparisons_user_created_idx on public.saved_comparisons (user_id, created_at desc);
create index saved_comparisons_left_id_idx on public.saved_comparisons (left_occupation_id);
create index saved_comparisons_right_id_idx on public.saved_comparisons (right_occupation_id);
create index saved_comparisons_location_id_idx on public.saved_comparisons (location_id) where location_id is not null;

create table public.watchlists (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  occupation_id bigint not null references public.occupations(id) on delete cascade,
  location_id bigint references public.locations(id) on delete cascade,
  risk_alert boolean not null default true,
  demand_alert boolean not null default true,
  salary_alert boolean not null default true,
  layoff_alert boolean not null default true,
  weekly_digest boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (user_id, occupation_id, location_id)
);
create index watchlists_user_id_idx on public.watchlists (user_id);
create index watchlists_occupation_location_idx on public.watchlists (occupation_id, location_id);

create table public.alert_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_enabled boolean not null default true,
  weekly_day smallint not null default 1 check (weekly_day between 0 and 6),
  timezone text not null default 'Asia/Kolkata',
  monthly_digest boolean not null default true,
  unsubscribed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.change_events (
  id bigint generated always as identity primary key,
  occupation_id bigint not null references public.occupations(id) on delete cascade,
  location_id bigint references public.locations(id) on delete cascade,
  event_type text not null check (event_type in ('risk', 'demand', 'salary', 'layoff')),
  old_value numeric(14,3),
  new_value numeric(14,3) not null,
  change_percent numeric(8,3),
  source_id bigint not null references public.data_sources(id) on delete restrict,
  evidence_kind text not null check (evidence_kind in ('measured', 'modelled', 'analyst_reviewed')),
  rationale text not null,
  detected_at timestamptz not null default now()
);
create index change_events_occupation_detected_idx on public.change_events (occupation_id, detected_at desc);
create index change_events_location_id_idx on public.change_events (location_id) where location_id is not null;
create index change_events_source_id_idx on public.change_events (source_id);

create table public.alert_deliveries (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  change_event_id bigint references public.change_events(id) on delete set null,
  delivery_kind text not null check (delivery_kind in ('immediate', 'weekly', 'monthly')),
  status text not null check (status in ('pending', 'sent', 'failed', 'suppressed')),
  provider_message_id text,
  attempted_at timestamptz,
  sent_at timestamptz,
  error_detail text,
  created_at timestamptz not null default now()
);
create index alert_deliveries_user_created_idx on public.alert_deliveries (user_id, created_at desc);
create index alert_deliveries_pending_idx on public.alert_deliveries (created_at) where status = 'pending';
create index alert_deliveries_change_event_id_idx on public.alert_deliveries (change_event_id) where change_event_id is not null;

create table public.quiz_results (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  anonymous_session_id text,
  occupation_id bigint references public.occupations(id) on delete set null,
  location_id bigint references public.locations(id) on delete set null,
  answers jsonb not null,
  result jsonb not null,
  scoring_version text not null,
  created_at timestamptz not null default now(),
  check (user_id is not null or anonymous_session_id is not null)
);
create index quiz_results_user_created_idx on public.quiz_results (user_id, created_at desc) where user_id is not null;
create index quiz_results_session_created_idx on public.quiz_results (anonymous_session_id, created_at desc) where anonymous_session_id is not null;
create index quiz_results_occupation_id_idx on public.quiz_results (occupation_id) where occupation_id is not null;
create index quiz_results_location_id_idx on public.quiz_results (location_id) where location_id is not null;

create table public.transition_plans (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  from_occupation_id bigint not null references public.occupations(id) on delete restrict,
  to_occupation_id bigint references public.occupations(id) on delete restrict,
  location_id bigint references public.locations(id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived', 'uncertain')),
  confidence numeric(4,3) check (confidence is null or confidence between 0 and 1),
  rationale text not null,
  assumptions jsonb not null default '{}'::jsonb,
  model_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index transition_plans_user_status_idx on public.transition_plans (user_id, status, updated_at desc);
create index transition_plans_from_id_idx on public.transition_plans (from_occupation_id);
create index transition_plans_to_id_idx on public.transition_plans (to_occupation_id) where to_occupation_id is not null;
create index transition_plans_location_id_idx on public.transition_plans (location_id) where location_id is not null;

create table public.transition_steps (
  id bigint generated always as identity primary key,
  plan_id bigint not null references public.transition_plans(id) on delete cascade,
  skill_id bigint references public.skills(id) on delete set null,
  course_id bigint references public.course_recommendations(id) on delete set null,
  sequence_no smallint not null check (sequence_no > 0),
  title text not null,
  detail text,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed', 'skipped')),
  target_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (plan_id, sequence_no)
);
create index transition_steps_plan_status_idx on public.transition_steps (plan_id, status, sequence_no);
create index transition_steps_skill_id_idx on public.transition_steps (skill_id) where skill_id is not null;
create index transition_steps_course_id_idx on public.transition_steps (course_id) where course_id is not null;

create table public.skill_simulations (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  occupation_id bigint not null references public.occupations(id) on delete cascade,
  location_id bigint references public.locations(id) on delete cascade,
  selected_skill_ids bigint[] not null,
  baseline jsonb not null,
  simulated jsonb not null,
  model_version text not null,
  created_at timestamptz not null default now()
);
create index skill_simulations_user_created_idx on public.skill_simulations (user_id, created_at desc) where user_id is not null;
create index skill_simulations_occupation_id_idx on public.skill_simulations (occupation_id);
create index skill_simulations_location_id_idx on public.skill_simulations (location_id) where location_id is not null;

create table public.referral_events (
  id bigint generated always as identity primary key,
  anonymous_session_id text,
  user_id uuid references auth.users(id) on delete set null,
  referral_code text,
  source_path text not null,
  destination_url text not null,
  provider text,
  campaign text,
  event_type text not null check (event_type in ('share', 'widget_view', 'outbound_click', 'conversion_claim')),
  created_at timestamptz not null default now()
);
create index referral_events_code_created_idx on public.referral_events (referral_code, created_at desc) where referral_code is not null;
create index referral_events_user_created_idx on public.referral_events (user_id, created_at desc) where user_id is not null;

create table public.institutions (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  institution_type text not null check (institution_type in ('college', 'school', 'counselling', 'employer', 'government', 'nonprofit')),
  location_id bigint references public.locations(id) on delete set null,
  created_at timestamptz not null default now()
);
create index institutions_location_id_idx on public.institutions (location_id) where location_id is not null;

create table public.institution_members (
  institution_id bigint not null references public.institutions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role text not null check (member_role in ('owner', 'admin', 'counsellor', 'placement_officer', 'analyst', 'employer_planner', 'student')),
  created_at timestamptz not null default now(),
  primary key (institution_id, user_id)
);
create index institution_members_user_id_idx on public.institution_members (user_id, institution_id);

create table public.cohorts (
  id bigint generated always as identity primary key,
  institution_id bigint not null references public.institutions(id) on delete cascade,
  name text not null,
  academic_year text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index cohorts_institution_id_idx on public.cohorts (institution_id, created_at desc);
create index cohorts_created_by_idx on public.cohorts (created_by);

create table public.cohort_members (
  cohort_id bigint not null references public.cohorts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  external_student_key text,
  consent_status text not null default 'pending' check (consent_status in ('pending', 'granted', 'revoked')),
  added_at timestamptz not null default now(),
  primary key (cohort_id, user_id)
);
create index cohort_members_user_id_idx on public.cohort_members (user_id, cohort_id);

create table public.report_exports (
  id bigint generated always as identity primary key,
  requested_by uuid not null references auth.users(id) on delete cascade,
  institution_id bigint references public.institutions(id) on delete cascade,
  report_type text not null check (report_type in ('career', 'cohort', 'placement', 'workforce')),
  file_format text not null check (file_format in ('pdf', 'csv')),
  parameters jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'processing', 'ready', 'failed', 'expired')),
  storage_path text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index report_exports_user_created_idx on public.report_exports (requested_by, created_at desc);
create index report_exports_institution_id_idx on public.report_exports (institution_id) where institution_id is not null;
create index report_exports_queued_idx on public.report_exports (created_at) where status = 'queued';

create table public.api_clients (
  id bigint generated always as identity primary key,
  institution_id bigint not null references public.institutions(id) on delete cascade,
  name text not null,
  key_prefix text not null unique,
  key_hash text not null unique,
  scopes text[] not null default '{}'::text[],
  rate_limit_per_minute bigint not null default 60 check (rate_limit_per_minute > 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index api_clients_institution_active_idx on public.api_clients (institution_id, created_at desc) where revoked_at is null;
create index api_clients_created_by_idx on public.api_clients (created_by);

create table public.embeddable_widgets (
  id bigint generated always as identity primary key,
  institution_id bigint references public.institutions(id) on delete cascade,
  widget_key text not null unique,
  widget_type text not null check (widget_type in ('occupation_score', 'role_comparison', 'market_snapshot')),
  configuration jsonb not null,
  allowed_origins text[] not null default '{}'::text[],
  is_active boolean not null default true,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index embeddable_widgets_institution_id_idx on public.embeddable_widgets (institution_id) where institution_id is not null;
create index embeddable_widgets_created_by_idx on public.embeddable_widgets (created_by);

create table public.score_disputes (
  id bigint generated always as identity primary key,
  occupation_id bigint not null references public.occupations(id) on delete cascade,
  score_id bigint references public.occupation_scores(id) on delete set null,
  submitted_by uuid references auth.users(id) on delete set null,
  submitter_email text,
  reason text not null,
  evidence_url text,
  status text not null default 'open' check (status in ('open', 'triaged', 'accepted', 'rejected', 'resolved')),
  resolution_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index score_disputes_status_created_idx on public.score_disputes (status, created_at);
create index score_disputes_occupation_id_idx on public.score_disputes (occupation_id);
create index score_disputes_score_id_idx on public.score_disputes (score_id) where score_id is not null;
create index score_disputes_submitted_by_idx on public.score_disputes (submitted_by) where submitted_by is not null;
create index score_disputes_reviewed_by_idx on public.score_disputes (reviewed_by) where reviewed_by is not null;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger occupations_set_updated_at before update on public.occupations
for each row execute function private.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger watchlists_set_updated_at before update on public.watchlists
for each row execute function private.set_updated_at();
create trigger alert_preferences_set_updated_at before update on public.alert_preferences
for each row execute function private.set_updated_at();
create trigger transition_plans_set_updated_at before update on public.transition_plans
for each row execute function private.set_updated_at();

-- RLS is enabled for every table in the exposed public schema.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'data_sources','occupations','occupation_aliases','locations','employers','skills','occupation_skills',
    'ingestion_runs','raw_source_records','ingestion_quarantine','score_versions','occupation_scores',
    'vacancy_observations','salary_observations','employer_events','education_pathways','course_recommendations',
    'content_translations','profiles','saved_roles','saved_comparisons','watchlists','alert_preferences',
    'change_events','alert_deliveries','quiz_results','transition_plans','transition_steps','skill_simulations',
    'referral_events','institutions','institution_members','cohorts','cohort_members','report_exports',
    'api_clients','embeddable_widgets','score_disputes'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

-- Explicit Data API grants: public reference data is read-only; personal data is owner-scoped.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.data_sources, public.occupations, public.occupation_aliases, public.locations,
  public.employers, public.skills, public.occupation_skills, public.score_versions, public.occupation_scores,
  public.vacancy_observations, public.salary_observations, public.employer_events, public.education_pathways,
  public.course_recommendations, public.content_translations, public.change_events, public.embeddable_widgets
to anon, authenticated;

grant select, insert, update, delete on public.profiles, public.saved_roles, public.saved_comparisons,
  public.watchlists, public.alert_preferences, public.transition_plans, public.transition_steps,
  public.skill_simulations, public.institution_members, public.cohorts, public.cohort_members,
  public.report_exports
to authenticated;
grant select on public.alert_deliveries to authenticated;
grant select (id, institution_id, name, key_prefix, scopes, rate_limit_per_minute, last_used_at, revoked_at, created_at)
  on public.api_clients to authenticated;
grant select, insert on public.quiz_results, public.referral_events, public.score_disputes to anon, authenticated;
grant select, insert, update, delete on public.institutions, public.embeddable_widgets to authenticated;
grant all privileges on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant usage, select on sequence public.quiz_results_id_seq, public.referral_events_id_seq, public.score_disputes_id_seq to anon;

-- Published reference policies.
create policy occupations_public_read on public.occupations for select to anon, authenticated using (is_published);
create policy occupation_aliases_public_read on public.occupation_aliases for select to anon, authenticated
using (exists (select 1 from public.occupations o where o.id = occupation_id and o.is_published));
create policy locations_public_read on public.locations for select to anon, authenticated using (is_published);
create policy employers_public_read on public.employers for select to anon, authenticated using (is_verified);
create policy skills_public_read on public.skills for select to anon, authenticated using (is_published);
create policy occupation_skills_public_read on public.occupation_skills for select to anon, authenticated
using (exists (select 1 from public.occupations o where o.id = occupation_id and o.is_published));
create policy data_sources_public_read on public.data_sources for select to anon, authenticated using (is_verified);
create policy score_versions_public_read on public.score_versions for select to anon, authenticated using (published_at is not null);
create policy occupation_scores_public_read on public.occupation_scores for select to anon, authenticated
using (exists (select 1 from public.occupations o where o.id = occupation_id and o.is_published));
create policy vacancies_public_read on public.vacancy_observations for select to anon, authenticated
using (is_active and verification_status in ('verified', 'source_claimed'));
create policy salaries_public_read on public.salary_observations for select to anon, authenticated
using (exists (select 1 from public.data_sources s where s.id = source_id and s.is_verified));
create policy employer_events_public_read on public.employer_events for select to anon, authenticated
using (verification_status in ('verified', 'source_claimed'));
create policy education_pathways_public_read on public.education_pathways for select to anon, authenticated using (is_published);
create policy courses_public_read on public.course_recommendations for select to anon, authenticated using (is_published);
create policy translations_public_read on public.content_translations for select to anon, authenticated using (review_status = 'published');
create policy changes_public_read on public.change_events for select to anon, authenticated
using (exists (select 1 from public.data_sources s where s.id = source_id and s.is_verified));
create policy widgets_public_read on public.embeddable_widgets for select to anon, authenticated using (is_active);

-- Owner-scoped personal data policies.
create policy profiles_owner_select on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_owner_insert on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_owner_update on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy profiles_owner_delete on public.profiles for delete to authenticated using ((select auth.uid()) = id);

create policy saved_roles_owner_all on public.saved_roles for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy saved_comparisons_owner_all on public.saved_comparisons for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy watchlists_owner_all on public.watchlists for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy alert_preferences_owner_all on public.alert_preferences for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy alert_deliveries_owner_select on public.alert_deliveries for select to authenticated
using ((select auth.uid()) = user_id);
create policy quiz_results_owner_select on public.quiz_results for select to authenticated
using ((select auth.uid()) = user_id);
create policy quiz_results_authenticated_insert on public.quiz_results for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy quiz_results_anon_insert on public.quiz_results for insert to anon
with check (user_id is null and anonymous_session_id is not null);
create policy transition_plans_owner_all on public.transition_plans for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy transition_steps_owner_all on public.transition_steps for all to authenticated
using (exists (select 1 from public.transition_plans p where p.id = plan_id and p.user_id = (select auth.uid())))
with check (exists (select 1 from public.transition_plans p where p.id = plan_id and p.user_id = (select auth.uid())));
create policy simulations_owner_select on public.skill_simulations for select to authenticated
using ((select auth.uid()) = user_id);
create policy simulations_owner_insert on public.skill_simulations for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy referrals_authenticated_insert on public.referral_events for insert to authenticated
with check (user_id is null or (select auth.uid()) = user_id);
create policy referrals_anon_insert on public.referral_events for insert to anon with check (user_id is null);
create policy referrals_owner_select on public.referral_events for select to authenticated using ((select auth.uid()) = user_id);
create policy disputes_authenticated_insert on public.score_disputes for insert to authenticated
with check (submitted_by = (select auth.uid()));
create policy disputes_anon_insert on public.score_disputes for insert to anon with check (submitted_by is null);
create policy disputes_owner_select on public.score_disputes for select to authenticated
using (submitted_by = (select auth.uid()));

-- Institution data is visible only to members; member creation is service/admin mediated.
create policy institutions_member_select on public.institutions for select to authenticated
using (exists (select 1 from public.institution_members m where m.institution_id = id and m.user_id = (select auth.uid())));
create policy institution_members_self_select on public.institution_members for select to authenticated
using (user_id = (select auth.uid()));
create policy cohorts_member_select on public.cohorts for select to authenticated
using (exists (select 1 from public.institution_members m where m.institution_id = institution_id and m.user_id = (select auth.uid())));
create policy cohorts_privileged_insert on public.cohorts for insert to authenticated
with check (created_by = (select auth.uid()) and exists (
  select 1 from public.institution_members m where m.institution_id = institution_id and m.user_id = (select auth.uid())
  and m.member_role in ('owner','admin','counsellor','placement_officer')
));
create policy cohorts_creator_update on public.cohorts for update to authenticated
using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));
create policy cohorts_creator_delete on public.cohorts for delete to authenticated using (created_by = (select auth.uid()));
create policy cohort_members_institution_select on public.cohort_members for select to authenticated
using (user_id = (select auth.uid()) or exists (
  select 1 from public.cohorts c join public.institution_members m on m.institution_id = c.institution_id
  where c.id = cohort_id and m.user_id = (select auth.uid()) and m.member_role in ('owner','admin','counsellor','placement_officer')
));
create policy cohort_members_privileged_insert on public.cohort_members for insert to authenticated
with check (exists (
  select 1 from public.cohorts c join public.institution_members m on m.institution_id = c.institution_id
  where c.id = cohort_id and m.user_id = (select auth.uid()) and m.member_role in ('owner','admin','counsellor','placement_officer')
));
create policy cohort_members_privileged_update on public.cohort_members for update to authenticated
using (exists (
  select 1 from public.cohorts c join public.institution_members m on m.institution_id = c.institution_id
  where c.id = cohort_id and m.user_id = (select auth.uid()) and m.member_role in ('owner','admin','counsellor','placement_officer')
)) with check (exists (
  select 1 from public.cohorts c join public.institution_members m on m.institution_id = c.institution_id
  where c.id = cohort_id and m.user_id = (select auth.uid()) and m.member_role in ('owner','admin','counsellor','placement_officer')
));
create policy cohort_members_privileged_delete on public.cohort_members for delete to authenticated
using (exists (
  select 1 from public.cohorts c join public.institution_members m on m.institution_id = c.institution_id
  where c.id = cohort_id and m.user_id = (select auth.uid()) and m.member_role in ('owner','admin','counsellor','placement_officer')
));
create policy exports_owner_select on public.report_exports for select to authenticated using (requested_by = (select auth.uid()));
create policy exports_owner_insert on public.report_exports for insert to authenticated with check (requested_by = (select auth.uid()));
create policy api_clients_creator_select on public.api_clients for select to authenticated using (created_by = (select auth.uid()));
create policy api_clients_creator_insert on public.api_clients for insert to authenticated with check (created_by = (select auth.uid()));
create policy api_clients_creator_update on public.api_clients for update to authenticated
using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));
create policy widgets_creator_all on public.embeddable_widgets for all to authenticated
using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));

-- Internal ingestion/audit tables intentionally have no anon/authenticated policies or grants.
revoke all on public.ingestion_runs, public.raw_source_records, public.ingestion_quarantine from anon, authenticated;
revoke all on public.alert_deliveries from anon;

comment on table public.vacancy_observations is 'Observed vacancy postings only; never interpreted as total labour-force employment.';
comment on column public.occupation_scores.evidence_kind is 'Distinguishes measured, modelled, and analyst-reviewed values shown in the UI.';
comment on column public.salary_observations.evidence_kind is 'Distinguishes measured, modelled, and analyst-reviewed salary values shown in the UI.';
