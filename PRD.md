# Product Requirements Document

## Product

India Jobs Dashboard is an exploratory web application that visualizes Indian occupations by sector, workforce/job volume, metro concentration, skill level, education band, and future-readiness scores.

The dashboard helps users answer: "Which occupations are concentrated in India's metros, which are spread into tier-2/tier-3 regions, and which are likely to grow or change with technology?"

## Goals

- Build a visual labour-market explorer for India, not a US occupation taxonomy clone.
- Support occupation-level comparison across metro concentration, sector, skill level, education band, technology adoption, remote feasibility, and growth outlook.
- Provide concise rationales behind every score.
- Make source freshness and score version visible.
- Support a treemap/grid experience that works on desktop and mobile.
- Provide clean ingestion paths for structured occupation datasets and public labour-market sources.

## Non-Goals

- Do not claim exact nationwide employment counts from job postings alone.
- Do not provide individual career counselling, legal advice, immigration advice, or guaranteed salary outcomes.
- Do not optimize for real-time job search in v1.
- Do not scrape private websites or ingest personal data without explicit permission and legal review.

## Users

- Jobseekers comparing sectors and locations.
- Students and parents evaluating education pathways.
- Career counsellors using a visual aid in advising sessions.
- Policy analysts comparing metro and non-metro labour demand.
- Employers and training providers identifying regional skill opportunities.
- Journalists and researchers seeking an interpretable occupational landscape.

## Core User Stories

- As a jobseeker, I can search "data analyst" and see whether the role is metro-heavy, what education is typical, and whether remote work is feasible.
- As a student, I can filter to "Diploma / ITI" and see manufacturing, logistics, healthcare, and infrastructure occupations with strong growth.
- As a policy analyst, I can compare sectors by non-metro job presence and growth outlook.
- As a counsellor, I can open an occupation detail drawer and explain why it was scored a certain way.
- As a data maintainer, I can import a structured occupation file and review validation errors before publishing it.

## Required Fields

Each published occupation record must include:

- `occupation_title`
- `industry_type`
- `job_family`
- `india_sector`
- `metro_category`
- `metro_score`
- `india_skill_level`
- `india_education_band`
- `tech_adoption_score`
- `remote_work_score`
- `growth_outlook_score`
- `metro_rationale`
- `sector_rationale`
- `scores_rationale`
- `score_version`
- `source_summary`
- `updated_at`

## Sector Taxonomy

- IT & Digital Services
- BPO / KPO / Shared Services
- Manufacturing & Engineering
- Construction & Infrastructure
- BFSI (Banking, Financial Services, Insurance & Fintech)
- Healthcare & Pharma
- Education & Training
- Retail & E-commerce
- Logistics & Supply Chain
- Agriculture & Allied Activities
- Govt & Public Administration
- Gig & Platform Work
- Hospitality & Tourism
- Media & Entertainment
- Other / Miscellaneous

## Scoring Summary

- `metro_score`: 0 means rural/non-metro-heavy; 5 means balanced; 10 means metro-heavy.
- `tech_adoption_score`: likelihood of digital, automation, and AI tool adoption in India over 5-10 years.
- `remote_work_score`: feasibility of remote/hybrid delivery in India.
- `growth_outlook_score`: qualitative demand outlook based on sector growth, regional spread, hiring patterns, and replacement risk.

Full scoring definitions live in `SCORING.md`.

## Visualization Requirements

- Default view is a treemap grouped by `india_sector`.
- Tile size is `job_count_estimate` when available; otherwise `posting_count` or equal-size fallback with a visible caveat.
- Tile color uses `metro_score`.
- Tooltip/detail drawer shows all score rationales and source freshness.
- Filters include sector, metro category, skill level, education band, score ranges, state, city tier, and search.
- Mobile uses tap-to-select and a bottom sheet/detail page instead of hover-only discovery.

## Data Requirements

- Maintain source tables for raw records.
- Normalize occupation aliases.
- Normalize city/state/region/tier.
- Maintain score history for auditability.
- Preserve source freshness and confidence.
- Support manual analyst review before publishing a new scoring version.

## Success Metrics

- Users can find an occupation in under 10 seconds.
- At least 95% of published occupations include all required score fields and rationales.
- Score changes are traceable to a source, rule version, or analyst override.
- Treemap loads within 2 seconds for 1,000 occupations on a typical mid-range phone.
- Dashboard is keyboard navigable and passes automated accessibility checks.

## References And Data Sources

- MoSPI PLFS publications and unit-level datasets: https://www.mospi.gov.in/publications-reports and https://microdata.gov.in/NADA/index.php/catalog/PLFS
- National Career Service portal: https://www.ncs.gov.in/
- Directorate General of Employment PLFS references: https://dge.gov.in/reference-publication-reports-annual
