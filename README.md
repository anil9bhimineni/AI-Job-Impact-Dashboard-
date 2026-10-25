# Global AI Impact Dashboard

An interactive dashboard for exploring how AI may grow, change, or pressure job roles across countries.

The app includes:

- AI growth potential by role
- Automation and disruption risk
- Country and continent filtering
- Confidence-gated career-path guidance with no forced alternative
- Role comparison
- Shareable comparison URLs
- Saved-role watchlist stored on the user's device, with a Supabase account-sync foundation
- Two-minute task-based AI-safety quiz with share attribution
- Skill scenario simulator and score-component explanations
- Role and filtered-dashboard CSV exports plus printable role reports
- Role-score correction feedback
- Role landing pages for SEO
- India role-by-city/state SEO pages with canonical, breadcrumb, and Occupation metadata
- Global layoff intelligence
- Optional verified live-vacancy provider boundary
- Personalized current-role transition planner with a 12-week skill roadmap
- Curated learning-resource links with affiliate attribution and disclosure

The first transition-planner release is deliberately India-first: recommendations, risk comparisons, demand signals, and role evidence are calculated for India even when another country is selected elsewhere in the global dashboard. Official Skill India Digital Hub, SWAYAM, and NPTEL resources are prioritized alongside selected global providers.
- Lightweight product analytics and score-feedback forms

## Run Locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

On macOS, you can also double-click `Start Global AI Impact Dashboard.command`.

## Build

```bash
npm run build
```

The production frontend is generated in `dist/`.

## Test

```bash
npm test
```

The 29-test regression suite checks the full scoring model, customer-support calibration, protected-role guardrails, all 157 career decisions, adjacency links, explicit uncertainty states, generated role/location SEO routes, Supabase least-privilege contracts, unknown-role handling, and the vacancy provider's unavailable state.

## Supabase platform foundation

The tracked Supabase configuration and migrations live in `supabase/`. They define source-labelled market observations, 157 versioned occupations, accounts, saved roles and comparisons, watchlists, alerts, transition progress, institutional cohorts, exports, API clients, widgets, and score disputes. Every table in the exposed `public` schema has RLS enabled and explicit least-privilege Data API grants.

Set these browser-safe variables in `.env.local` for account sign-in:

```bash
VITE_SUPABASE_URL=https://yfnihuoqwnelqmwfqsjt.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Never put a service-role or secret key in a `VITE_` variable. Server-only keys belong in Netlify environment variables. Use `npx supabase db push --linked --dry-run` before applying a migration. See `FEATURE_STATUS.md` for the boundary between live, provider-gated, and admin-gated capabilities.

## Optional live vacancies

The dashboard never presents modelled demand as a vacancy count. To connect a verified vacancy API, set `VACANCY_FEED_URL` and, when required, `VACANCY_FEED_TOKEN` in Netlify. The provider must accept `role`, `country`, and `limit` query parameters and return `{ "vacancies": [...] }`. Without this configuration the UI shows an explicit unavailable state.

## Referral links

Copy `.env.example` to `.env.local` for local development, or add the relevant variables in Netlify. Each value must be the complete HTTPS tracking URL issued by an approved affiliate program. When a URL is configured, the corresponding resource is labelled as sponsored and uses `rel="sponsored"`; otherwise the dashboard links directly to the provider and makes no commission claim.

Outbound clicks are recorded as `learning_resource_clicked` analytics events with the source role, destination role, provider, and sponsored status. These links provide referral attribution. They do not create inbound SEO backlinks; backlinks require another website to publish a link to this dashboard.

## Score Audit

Run the role-scoring audit before publishing data changes:

```bash
npm run audit:roles
```

The audit recalculates all 157 roles, verifies model/version metadata, checks high-exposure and protected-role guardrails, and writes the full component-level result to `data/role_model_audit.json`.

Hiring demand is shown as a 0-100 relative index. It is intentionally not labelled as live openings or total jobs because the public sources do not provide comparable role-level vacancy counts across every country and dashboard role. See `SCORING.md` for formulas, thresholds, source limitations, and versioning.

## Refresh and validate data

Refresh the public Layoffs.fyi shared-view extract, keep a raw source snapshot, quarantine invalid rows, and rebuild the normalized dashboard dataset:

```bash
npm run refresh:data
npm run validate:data
```

If airtable.com is not reachable from your network, open the Layoffs.fyi Airtable shared view in a browser, export the rows (an array of objects keyed by column name) to a JSON file, and rebuild from it:

```bash
npm run refresh:data:offline -- path/to/layoffsfyi_rows.json
```

The refresh timestamp and latest covered event date are recorded in `data/layoffs_source_summary.json` and displayed in the dashboard.

## Deploy

The site is linked to Netlify:

```text
https://global-ai-jobs-impact-dashboard.netlify.app
```

Production deploy command:

```bash
npx --yes netlify-cli deploy --prod --dir=dist --site=b17b99d0-b37c-4a91-ac11-8a7ec5ff1b17
```

If Netlify returns `JSONHTTPError: Forbidden`, refresh the Netlify token or check team/site deploy permissions.
