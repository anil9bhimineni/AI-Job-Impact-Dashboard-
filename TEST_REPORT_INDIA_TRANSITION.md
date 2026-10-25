# India Platform Release — Test Report

Date: 4 August 2026  
Environment: local production build plus linked Supabase project  
Production status: unchanged; release is not yet promoted

## Automated gates

- `npm test`: 31/31 passing.
- `npm run build`: passing with code-split bundles; largest application chunk is 462 kB (74 kB gzip).
- Supabase migrations: four local/remote versions aligned.
- Supabase schema lint: no errors.
- Public Data API: 157 published occupations readable; anonymous profile access denied with HTTP 401.
- All 38 public tables have RLS enabled.
- Role audit: all 157 roles have bounded, versioned, reproducible scores.

## Smoke and functional tests

| Journey | Result |
| --- | --- |
| India dashboard loads with role search | Pass |
| `Plumber` stays in role with no forced alternative | Pass |
| `Civil Site Engineer` stays in role with no forced alternative | Pass |
| `Customer Support Executive` shows High automation and layoff risk | Pass |
| Customer-support alternatives remain occupationally adjacent | Pass |
| Two-minute quiz advances from question 1 to 2 | Pass |
| Transition target updates shareable URL state | Pass |
| Location route renders location-specific heading and modelled-demand caveat | Pass |
| Signed-out career workspace renders its account boundary | Pass |
| Weekly-alert forms and delivery controls are absent | Pass |
| Verified-vacancy panel fails honestly when no provider is configured | Pass |
| Simplified homepage shows one search, three signals, and one recommendation | Pass |
| Quiz, transition planner, and comparison remain collapsed until requested | Pass |
| Empty homepage waits for a role instead of silently selecting one | Pass |
| 390 × 844 layout has no horizontal overflow | Pass |
| Desktop and mobile tested paths show no console errors or warnings | Pass |

The simplified desktop homepage is 1,023 px tall (down from 3,317 px), and its hero is 538 px tall (down from 859 px). Secondary tools default to closed and expand individually.

## System integration tests

| Integration | Result |
| --- | --- |
| Four database migrations apply to the linked Supabase project | Pass |
| Occupations and versioned scores publish as analyst-reviewed evidence | Pass |
| Anonymous reference-data reads work | Pass |
| Anonymous personal-profile reads are denied | Pass |
| Account watchlist and alert repository calls are owner-scoped | Pass (contract/RLS) |
| 157 role pages plus 13 city/state variants each are generated | Pass |
| Location pages include canonical, BreadcrumbList, and Occupation markup | Pass |
| Production preview loads split React, Supabase, icon, and app bundles | Pass |
| Referral links include campaign attribution and disclosure | Pass |

`JobPosting` structured data is deliberately emitted only when verified vacancies exist. The current release does not fabricate job postings from modelled demand.

## Remaining provider-dependent checks

- Real email delivery requires a configured email provider and scheduler.
- Live NCS/job-board vacancies and salary observations require approved provider credentials and source terms.
- Institution membership provisioning and admin dispute resolution require an authorized administrator account.
- Legacy Supabase JWT keys should be disabled or rotated after confirming no existing integration depends on them.

## Release gate

Production has not been changed. A single production deployment remains gated on final feature acceptance, configured production environment variables, and provider-dependent checks that are in launch scope.
