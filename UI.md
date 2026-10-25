# UI Specification

## Dashboard Structure

The Jobs Dashboard should open directly into the analytical workspace, not a marketing landing page.

Desktop layout:

- Top app bar: title, data version, last updated, export.
- Left filter rail: search, sector, metro category, skill level, education, scores, state/tier.
- Main canvas: treemap with sector grouping.
- Right detail drawer: selected occupation.
- Bottom/secondary region: sortable occupation grid.

Mobile layout:

- Top app bar with title, search, filter button.
- Treemap as the first evidence view.
- Sticky bottom sheet for selected occupation.
- Filter drawer overlays from the bottom.
- Grid/list appears below treemap.

## Default Reading Path

1. User sees a treemap titled "India occupations by jobs and metro concentration".
2. Sector group labels provide orientation.
3. Tile size communicates job/workforce scale.
4. Tile color communicates metro concentration.
5. Tile text shows occupation title and metro score/category.
6. Tap/click opens detail with rationales and future-readiness scores.

## Treemap Behavior

- Renderer: D3 treemap layout, React-rendered SVG or HTML absolutely positioned tiles.
- Parent grouping: `india_sector`.
- Tile area: `job_count_estimate`; fallback to `posting_count`; fallback to equal size with caveat.
- Tile color: continuous `metro_score`.
- Border: neutral subtle sector grouping boundary.
- Labels: show occupation title and score on sufficiently large tiles; hide or abbreviate on small tiles.
- Hover: highlight tile and show compact tooltip.
- Click/tap: select occupation and open drawer.
- Keyboard: tiles are focusable; Enter/Space selects.
- Zoom: optional sector drill-down after MVP.

## Color Ledger

- Neutral background: off-white or light gray.
- Text: high-contrast near-black.
- Non-metro-heavy: blue.
- Mixed: purple.
- Metro-heavy: red.
- Selected tile: dark outline plus raised shadow.
- Low confidence: diagonal hatch or dotted outline, not color alone.
- Stale data: amber badge.

Suggested scale:

- 0-3: blue.
- 4-6: purple.
- 7-10: red.

## Filters

Required filters:

- Search title/alias.
- Industry type.
- Job family.
- Sector.
- Metro category.
- Skill level.
- Education band.
- Metro score range.
- Tech adoption minimum.
- Remote work minimum.
- Growth outlook minimum.
- State.
- City tier.

Controls:

- Multi-select checkboxes for sectors and categories.
- Sliders or numeric steppers for score ranges.
- Search input with clear button.
- Reset filters button.
- Copy link button.

## Detail Drawer

Fields:

- Occupation title.
- Sector.
- Metro category and score.
- Skill level.
- Education band.
- Tech adoption, remote work, growth outlook.
- Metro rationale.
- Sector rationale.
- Scores rationale.
- Top locations.
- Common skills.
- Common employers/industries.
- Salary summary when available.
- Sources and score version.

## Grid View

Columns:

- Occupation.
- Sector.
- Metro score/category.
- Skill level.
- Education band.
- Tech.
- Remote.
- Growth.
- Jobs/postings.

Grid requirements:

- Sort by each score.
- Preserve current filters.
- Row selection opens the same detail drawer.
- Export respects current filtered rows.

## Empty, Loading, Error, Stale States

- Loading: skeleton treemap blocks with visible "Loading occupations".
- Empty: show active filters and reset control.
- Error: show retry and supportable error code.
- Stale: keep last published data visible with a freshness badge.
- Partial source: show note when job counts are posting-derived or sample-derived.

## Accessibility

- All filters must be labelled.
- Treemap must have a table/list fallback in DOM.
- Tooltips cannot be the only place important data appears.
- Tiles must be focusable with visible focus style.
- Color must be paired with text labels.
- Respect reduced motion.
- Minimum touch target: 44px.
