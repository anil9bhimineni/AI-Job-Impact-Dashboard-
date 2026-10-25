# Data Pipeline

## Sources

Preferred source mix:

- MoSPI PLFS publications and unit-level data for labour-force calibration.
- National Career Service data and public job-market signals.
- State employment portals where licensed/available.
- Employer career pages or licensed job-posting datasets.
- Sector reports for salary and growth context.
- Analyst-reviewed structured occupation uploads.

Source references:

- MoSPI publications: https://www.mospi.gov.in/publications-reports
- PLFS microdata portal: https://microdata.gov.in/NADA/index.php/catalog/PLFS
- National Career Service: https://www.ncs.gov.in/
- Directorate General of Employment references: https://dge.gov.in/reference-publication-reports-annual

## Pipeline Stages

1. Register source metadata.
2. Load raw records.
3. Validate schema and required fields.
4. Hash records for deduplication.
5. Normalize occupation title and aliases.
6. Normalize location fields.
7. Classify sector, skill level, and education band.
8. Calculate metro concentration.
9. Calculate future-readiness scores.
10. Generate rationales.
11. Quarantine low-confidence or invalid rows.
12. Analyst review.
13. Publish score version.
14. Refresh API cache.

## Input Schema For Structured Uploads

Required:

- `occupation_title`
- `skills`
- `locations`

Recommended:

- `sector_hint`
- `employers`
- `job_count_estimate`
- `posting_count`
- `salary_min_inr`
- `salary_max_inr`
- `education_hint`
- `experience_hint`
- `source_name`
- `source_url`
- `observed_at`

## Location Normalization

Steps:

- Trim and standardize city/state names.
- Map common aliases: Bengaluru/Bangalore, Mumbai/Bombay, NCR variants.
- Attach district/state/region.
- Assign city tier from maintained `locations` table.
- Mark metros and tier-1 clusters.
- Preserve unknown values for review rather than guessing silently.

## Occupation Normalization

Steps:

- Normalize case and punctuation.
- Remove seniority prefixes only for alias matching, not display.
- Match exact canonical titles.
- Match known aliases.
- Use embedding/fuzzy match only as a suggestion requiring confidence threshold.
- Create new occupation only when no strong match exists.

## Scoring Pipeline

Metro score:

- Estimate share of observations in tier-1/metro locations.
- Blend with sector priors when observations are sparse.
- Apply analyst override only with rationale.

Future-readiness:

- Use rule-based defaults by sector and occupation type.
- Adjust based on skill list, remote feasibility, digital workflow, employer mix, and regional demand.
- Record scoring version and confidence.

## Data Quality Checks

- Required fields present.
- Scores are integers 0-10.
- Enum values match API contract.
- Rationales are non-empty.
- Location shares sum to approximately 1 for each occupation/version when provided.
- Job counts and posting counts are non-negative.
- Source URL and accessed date are present for external sources.
- Low-confidence inferred titles are queued for review.

## Publish Criteria

- All records validate.
- No unreviewed high-impact score changes.
- At least 10% sample reviewed manually for small batches; higher for new sources.
- Score version has methodology summary.
- Dashboard smoke test passes with the new version.

## Operational Schedule

- Structured analyst uploads: on demand.
- Public source refresh: monthly or quarterly depending on source.
- Score version publishing: monthly for active product, otherwise when source coverage materially changes.

