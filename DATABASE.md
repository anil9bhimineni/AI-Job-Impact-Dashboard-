# PostgreSQL Schema

## Design Principles

- Keep raw data, normalized data, and published scores separate.
- Version scores so historical dashboard states remain reproducible.
- Model locations as first-class entities for metro/non-metro analysis.
- Preserve source metadata and confidence.

## Enumerations

```sql
CREATE TYPE india_sector AS ENUM (
  'IT & Digital Services',
  'BPO / KPO / Shared Services',
  'Manufacturing & Engineering',
  'Construction & Infrastructure',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Healthcare & Pharma',
  'Education & Training',
  'Retail & E-commerce',
  'Logistics & Supply Chain',
  'Agriculture & Allied Activities',
  'Govt & Public Administration',
  'Gig & Platform Work',
  'Hospitality & Tourism',
  'Media & Entertainment',
  'Other / Miscellaneous'
);

CREATE TYPE metro_category AS ENUM ('METRO_HEAVY', 'MIXED', 'NON_METRO_HEAVY');
CREATE TYPE skill_level AS ENUM ('ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_SPECIALIST');
CREATE TYPE education_band AS ENUM ('Up to 10th / 12th', 'Diploma / ITI', 'Graduate', 'Postgraduate / Professional');
CREATE TYPE city_tier AS ENUM ('TIER_1', 'TIER_2', 'TIER_3', 'RURAL', 'UNKNOWN');
CREATE TYPE source_type AS ENUM ('SURVEY', 'JOB_POSTING', 'EMPLOYER', 'SALARY_REPORT', 'GOVERNMENT_PORTAL', 'ANALYST_REVIEW', 'OTHER');
```

## Core Tables

```sql
CREATE TABLE occupations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_title TEXT NOT NULL UNIQUE,
  description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE occupation_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occupation_id UUID NOT NULL REFERENCES occupations(id) ON DELETE CASCADE,
  alias_title TEXT NOT NULL,
  source_note TEXT,
  UNIQUE (occupation_id, alias_title)
);

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT,
  district TEXT,
  state TEXT NOT NULL,
  region TEXT,
  tier city_tier NOT NULL DEFAULT 'UNKNOWN',
  is_metro BOOLEAN NOT NULL DEFAULT FALSE,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  UNIQUE (city, district, state)
);

CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_name TEXT NOT NULL UNIQUE,
  sector india_sector,
  employer_type TEXT,
  website_url TEXT
);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL UNIQUE,
  skill_group TEXT
);

CREATE TABLE occupation_skills (
  occupation_id UUID NOT NULL REFERENCES occupations(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  importance SMALLINT CHECK (importance BETWEEN 1 AND 5),
  PRIMARY KEY (occupation_id, skill_id)
);
```

## Source And Observation Tables

```sql
CREATE TABLE data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_type source_type NOT NULL,
  source_url TEXT,
  publisher TEXT,
  published_at DATE,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  license_note TEXT,
  reliability_score SMALLINT CHECK (reliability_score BETWEEN 0 AND 10)
);

CREATE TABLE raw_source_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES data_sources(id),
  ingestion_id UUID,
  raw_payload JSONB NOT NULL,
  record_hash TEXT NOT NULL,
  validation_status TEXT NOT NULL DEFAULT 'PENDING',
  validation_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_id, record_hash)
);

CREATE TABLE job_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occupation_id UUID REFERENCES occupations(id),
  source_id UUID NOT NULL REFERENCES data_sources(id),
  location_id UUID REFERENCES locations(id),
  employer_id UUID REFERENCES employers(id),
  observed_title TEXT NOT NULL,
  posting_count INTEGER,
  job_count_estimate INTEGER,
  salary_min_inr INTEGER,
  salary_max_inr INTEGER,
  experience_min_years NUMERIC(4,1),
  experience_max_years NUMERIC(4,1),
  observed_at DATE,
  confidence NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
```

## Scoring Tables

```sql
CREATE TABLE score_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_label TEXT NOT NULL UNIQUE,
  methodology_summary TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE TABLE occupation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occupation_id UUID NOT NULL REFERENCES occupations(id) ON DELETE CASCADE,
  score_version_id UUID NOT NULL REFERENCES score_versions(id) ON DELETE CASCADE,
  india_sector india_sector NOT NULL,
  metro_category metro_category NOT NULL,
  metro_score SMALLINT NOT NULL CHECK (metro_score BETWEEN 0 AND 10),
  india_skill_level skill_level NOT NULL,
  india_education_band education_band NOT NULL,
  tech_adoption_score SMALLINT NOT NULL CHECK (tech_adoption_score BETWEEN 0 AND 10),
  remote_work_score SMALLINT NOT NULL CHECK (remote_work_score BETWEEN 0 AND 10),
  growth_outlook_score SMALLINT NOT NULL CHECK (growth_outlook_score BETWEEN 0 AND 10),
  metro_rationale TEXT NOT NULL,
  sector_rationale TEXT NOT NULL,
  scores_rationale TEXT NOT NULL,
  confidence NUMERIC(4,3) NOT NULL DEFAULT 0.700 CHECK (confidence BETWEEN 0 AND 1),
  source_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (occupation_id, score_version_id)
);
```

## Salary And Geography Tables

```sql
CREATE TABLE salary_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occupation_id UUID NOT NULL REFERENCES occupations(id),
  location_id UUID REFERENCES locations(id),
  source_id UUID NOT NULL REFERENCES data_sources(id),
  salary_period TEXT NOT NULL CHECK (salary_period IN ('MONTHLY', 'ANNUAL', 'DAILY', 'HOURLY')),
  p10_inr INTEGER,
  p25_inr INTEGER,
  median_inr INTEGER,
  p75_inr INTEGER,
  p90_inr INTEGER,
  sample_size INTEGER,
  observed_at DATE
);

CREATE TABLE occupation_location_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occupation_id UUID NOT NULL REFERENCES occupations(id),
  score_version_id UUID NOT NULL REFERENCES score_versions(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  job_share NUMERIC(6,5) CHECK (job_share BETWEEN 0 AND 1),
  posting_share NUMERIC(6,5) CHECK (posting_share BETWEEN 0 AND 1),
  confidence NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
  UNIQUE (occupation_id, score_version_id, location_id)
);
```

## Indexes

```sql
CREATE INDEX idx_occupation_scores_version ON occupation_scores(score_version_id);
CREATE INDEX idx_occupation_scores_sector ON occupation_scores(india_sector);
CREATE INDEX idx_occupation_scores_metro ON occupation_scores(metro_category, metro_score);
CREATE INDEX idx_job_observations_occupation ON job_observations(occupation_id);
CREATE INDEX idx_job_observations_location ON job_observations(location_id);
CREATE INDEX idx_locations_state_tier ON locations(state, tier);
CREATE INDEX idx_raw_source_records_payload ON raw_source_records USING gin(raw_payload);
```

