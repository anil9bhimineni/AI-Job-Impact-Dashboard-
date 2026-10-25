# Coding Agent Instructions

## Product Context

This workspace contains a Vite/React application and a planned India Jobs Dashboard: an interactive labour-market visualizer inspired by public job-market treemaps, but localized for India's occupations, locations, skill bands, education pathways, sectors, and future-readiness signals.

Primary analytical job: compare Indian occupations by sector, metro concentration, technology adoption, remote feasibility, and growth outlook.

Primary visual family: D3 treemap plus sortable grid/list and detail drawer.

Primary users: students, jobseekers, counsellors, policy teams, workforce planners, employers, and analysts who need a concise view of where Indian jobs are concentrated and how occupations are changing.

## Engineering Standards

- Prefer TypeScript for new production code.
- Keep data contracts explicit with shared types and runtime validation at API boundaries.
- Keep analytical scoring deterministic and auditable. Do not hide scoring rules in UI code.
- Use database migrations for schema changes.
- Store raw source records separately from normalized/enriched occupation records.
- Treat every score as dated, sourced, and versioned.
- Add tests with every material change to scoring, ingestion, API response shape, or treemap behavior.
- Avoid silent data drops. Invalid records should move to a quarantine table or failed-ingestion log with reasons.
- Keep UI labels concise and India-specific. Avoid US BLS vocabulary unless it appears only in source mapping metadata.

## Visualization Rules

- Essential values must be visible without hover: occupation title, sector, jobs/share indicator, metro category, and at least one future-readiness signal.
- Hover/tap may reveal richer rationales, salary, employers, city/state mix, and source freshness.
- Use redundant encodings for important categories: color plus text/category chips.
- Use keyboard-accessible filtering and a non-hover detail drawer for mobile.
- Keep URL state shareable for filters, search, selected occupation, sector, and scoring version.
- Use blue for non-metro-heavy, purple for mixed, and red for metro-heavy. Check contrast and color-deficiency resilience.

## Data Rules

- PLFS, NCS, state job portals, employer postings, public salary reports, and curated analyst inputs may all feed the model, but each observation must retain source metadata.
- Do not present online job postings as total labour-force counts. Treat them as demand signals unless calibrated against survey or administrative data.
- Separate measured fields, modelled estimates, and analyst-reviewed fields.
- Store city-tier classification as a maintained dimension, not ad hoc strings.
- All location claims must be explainable through state/city distributions or documented analyst rules.

## Implementation Rules

- New backend code should live under `server/` unless the repository is reorganized.
- New frontend dashboard code should live under `src/jobs-dashboard/` until the product route is integrated.
- Keep seed data small, representative, and clearly labelled as sample data.
- Do not commit real API keys, scraped personal data, or proprietary job-posting exports.
- Prefer small, composable components: `Treemap`, `FilterBar`, `OccupationDrawer`, `ScoreLegend`, `SourceBadge`, `DataFreshnessBanner`.
- Prefer D3 for treemap layout and React for state/render shell.

## Commands

- Install: `npm install`
- Frontend dev server: `npm run dev`
- Frontend build: `npm run build`
- Preview build: `npm run preview`
- Docker local stack: `docker compose up --build`

## Definition Of Done

- Data contract updated.
- Tests updated.
- Accessibility path checked for keyboard and mobile tap.
- Scores show rationale and source/version.
- Empty, loading, stale, and error states are visible.
- README or relevant docs updated when setup or behavior changes.
