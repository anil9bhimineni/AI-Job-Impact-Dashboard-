# Test Plan

## Unit Tests

Scoring:

- Metro score maps correctly to category.
- Scores reject values outside 0-10.
- Sector values must match approved taxonomy.
- Skill level and education band validation is strict.
- Sparse location evidence uses documented fallback.
- Analyst override requires rationale.

Normalization:

- City aliases map correctly.
- State names normalize consistently.
- Occupation aliases resolve to canonical titles.
- Unknown locations remain reviewable.
- Duplicate raw records are detected by hash.

API:

- Query filters produce expected SQL predicates.
- Pagination metadata is correct.
- Default score version is latest published.
- Detail endpoint includes rationales and sources.
- CSV export respects filters.

## Integration Tests

- Import sample JSONL into raw tables.
- Normalize sample records.
- Score sample records.
- Publish sample score version.
- Fetch `/occupations`, `/facets`, and `/occupations/:id`.
- Verify stale published data remains available after failed ingestion.

## Frontend Component Tests

- Filter controls update URL state.
- Reset clears filters.
- Treemap receives expected grouped data.
- Tile selection opens detail drawer.
- Grid sorting works for scores.
- Missing job count shows fallback caveat.
- Empty state lists active filters.

## End-To-End Tests

Desktop:

- Load dashboard.
- Search occupation.
- Filter to non-metro-heavy roles.
- Select a tile.
- Verify drawer rationales.
- Export filtered CSV.

Mobile:

- Open dashboard at narrow viewport.
- Open filter drawer.
- Apply score filter.
- Tap tile.
- Verify bottom sheet/detail view.

Accessibility:

- Keyboard can reach search, filters, tiles, grid rows, drawer close.
- Screen reader labels exist for filters and scores.
- Treemap has table/list fallback.
- Color is not the only indicator of metro category.

## Performance Tests

- 1,000 occupation records render under 2 seconds on mid-range mobile target.
- Filtering responds within 200 ms after data is loaded.
- API `/occupations` responds under 500 ms for common filters with indexes.
- Treemap resize does not thrash layout.

## Visual Regression

Screenshots:

- Desktop default.
- Desktop with selected occupation.
- Desktop empty state.
- Mobile default.
- Mobile filter drawer.
- Mobile selected detail.

## Data QA

- Validate enum coverage.
- Validate source freshness.
- Compare sector counts across versions.
- Flag score changes greater than 2 points.
- Flag large location-share shifts.
- Confirm every published occupation has rationales.

