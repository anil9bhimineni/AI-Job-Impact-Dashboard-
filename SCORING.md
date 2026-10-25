# Scoring Methodology

## Output Contract

Each scored occupation must produce:

```json
{
  "occupation_title": "string",
  "india_sector": "string",
  "metro_category": "METRO_HEAVY | MIXED | NON_METRO_HEAVY",
  "metro_score": 0,
  "india_skill_level": "ENTRY_LEVEL | MID_LEVEL | SENIOR_SPECIALIST",
  "india_education_band": "Up to 10th / 12th | Diploma / ITI | Graduate | Postgraduate / Professional",
  "tech_adoption_score": 0,
  "remote_work_score": 0,
  "growth_outlook_score": 0,
  "automation_risk_score": 0,
  "scoring_model_version": "2026.10-v1",
  "scoring_model_updated_at": "2026-10-14",
  "scoring_evidence_basis": ["string"],
  "metro_rationale": "string",
  "sector_rationale": "string",
  "scores_rationale": "string"
}
```

## Metro Category

`metro_score` is an integer from 0 to 10.

- 0-3: `NON_METRO_HEAVY`
- 4-6: `MIXED`
- 7-10: `METRO_HEAVY`

Interpretation:

- 0: predominantly rural or small-town employment.
- 5: balanced across tier-1 and tier-2/tier-3 locations.
- 10: heavily concentrated in Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Pune, Kolkata, and comparable tier-1 clusters.

Evidence inputs:

- City/state distribution from job observations.
- Sector-specific India employment patterns.
- Employer footprint.
- Remote feasibility.
- Informality and local-service intensity.
- Public survey calibration where available.

## India Sector Rules

Choose the closest primary sector from the approved list. If a role spans sectors, choose where hiring is most commonly organized in India.

Examples:

- Software Developer: `IT & Digital Services`.
- Customer Support Executive: `BPO / KPO / Shared Services`.
- Relationship Manager: `BFSI (Banking, Financial Services, Insurance & Fintech)`.
- CNC Machine Operator: `Manufacturing & Engineering`.
- Staff Nurse: `Healthcare & Pharma`.
- Delivery Partner: `Gig & Platform Work`.
- School Teacher: `Education & Training`.

## Skill Level Rules

- `ENTRY_LEVEL`: basic training, freshers, 0-2 years, routine execution, high-volume hiring.
- `MID_LEVEL`: requires domain experience, independent delivery, 2-7 years common.
- `SENIOR_SPECIALIST`: high expertise, professional licensure, management, niche technical depth, or advanced degrees.

## Education Band Rules

- `Up to 10th / 12th`: common hiring does not require diploma/degree.
- `Diploma / ITI`: vocational, technical, trade, paramedical, or polytechnic route common.
- `Graduate`: BA, BSc, BCom, BTech, BCA, BBA, or equivalent typically expected.
- `Postgraduate / Professional`: MBA, CA, CS, CFA, MD/MS, MTech, PhD, BEd/MEd where profession commonly requires it, or equivalent licensure.

## Tech Adoption Score

0-10 likelihood that the occupation will adopt digital tools, automation, AI, analytics, platforms, or workflow software in India over 5-10 years.

Guidance:

- 0-2: limited digital workflow, mostly physical/manual/local.
- 3-5: uses mobile apps, basic MIS, digital payments, or scheduling tools.
- 6-8: regular use of ERP/CRM/analytics/automation/AI-assisted workflows.
- 9-10: core work is digital/AI/cloud/data/software-led.

## Remote Work Score

0-10 feasibility of remote/hybrid work in India.

Guidance:

- 0-2: physical presence is essential.
- 3-5: some coordination/admin can be remote, delivery mostly in person.
- 6-8: hybrid feasible for many employers.
- 9-10: remote-first feasible across many employers.

## Growth Outlook Score

0-10 qualitative demand outlook for India.

Inputs:

- Sector growth and investment.
- Public infrastructure or policy tailwinds.
- Tier-2/tier-3 expansion.
- Digital adoption.
- Demographic demand.
- Replacement risk from automation.
- Cyclicality and hiring volatility.

Guidance:

- 0-2: declining or structurally weak demand.
- 3-5: stable or localized demand.
- 6-8: growing demand across multiple regions or sectors.
- 9-10: very strong demand with durable national tailwinds.

## Layoff / Displacement Risk

The dashboard's `2026.10-v1` layoff-risk score is a 0-10 composite. It is a career-displacement signal, not a forecast that a specific person will be laid off.

- 50% task automation exposure.
- 18% weak-growth pressure (`10 - growth_outlook_score`).
- 12% seniority vulnerability (entry-level work receives more weight).
- 15% reported role-family layoff pressure, log-normalized within the selected country and backed off to a discounted global signal when country data is absent.
- 5% routine-task exposure based on explicit role/family rules.

Labels: 0-3 Low, 4-6 Medium, 7-10 High. Customer support, voice, non-voice, data entry, AP/AR, routine administration, and other high-volume repeatable workflows must not be scored Low. Physical presence, licensed accountability, live care, and site-specific judgment reduce exposure.

Layoffs.fyi records usually identify broad functions rather than occupation titles. `reportedLayoffFamily()` maps every dashboard family to a documented evidence bucket instead of relying on exact string matches.

## Hiring Demand Index

The 0-100 hiring-demand index replaces the previous hardcoded “jobs estimated” counts. It combines:

- 50% India growth outlook.
- 35% auditable role-family market-depth prior.
- 15% skill-level breadth.
- A bounded country growth adjustment.

It is a relative comparison signal, not total employment, observed live vacancies, or a guarantee of openings. Labels: 80-100 Strong, 65-79 Active, 50-64 Selective, below 50 Limited. NCS vacancy totals are used only as market context because public NCS releases do not provide a complete role-level live-vacancy allocation for these 157 roles.

Run `npm run generate:roles` followed by `npm run audit:roles` after any scoring change. The audit writes every role's components and rationale to `data/role_model_audit.json`.

## Career-Path Decision

AI growth opportunity and job safety are separate. A low AI-impact score means AI is less central to the role; it does not by itself mean that the role is unsafe or that the worker should change careers.

The India planner returns one of four decisions:

- `stay_and_upgrade`: low automation exposure with healthy growth, or physical/accountable work where technology primarily assists delivery.
- `monitor`: moderate pressure with a credible adjacent path; no immediate switch is recommended.
- `transition_recommended`: high disruption pressure and at least one evidence-backed adjacent role in the dashboard.
- `insufficient_evidence`: disruption pressure is present, but the dataset has no sufficiently close destination. The UI explicitly says it is not sure and does not guess.

Destination roles must exist in the occupation dataset, must not equal the current role, and must pass role-family or role-specific adjacency rules. Plumber, Civil Site Engineer, clinical work, public safety, field service, and other protected physical/accountable occupations receive in-role upgrade guidance when their risk and growth signals support it.

## Rationale Style

- Keep rationales short: one or two sentences.
- Name typical Indian locations where useful.
- Distinguish job-posting demand from total employment.
- Do not overstate precision.

## Analyst Prompt

Use this prompt when enriching a structured occupation record:

```text
Score this occupation for the India Jobs Dashboard.

Input fields:
- title:
- sector_hint:
- skills:
- locations:
- city_tiers:
- employers:
- education_hint:
- experience_hint:
- source_notes:

Return one JSON object only with:
occupation_title, india_sector, metro_category, metro_score,
india_skill_level, india_education_band, tech_adoption_score,
remote_work_score, growth_outlook_score, metro_rationale,
sector_rationale, scores_rationale.

Use India-specific hiring practices and location patterns.
Keep each rationale concise and auditable.
```
