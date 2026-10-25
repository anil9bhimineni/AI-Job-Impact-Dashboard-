import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const app = readFileSync(new URL('src/App.jsx', root), 'utf8')
const roles = readFileSync(new URL('data/sample_occupations.jsonl', root), 'utf8').trim().split('\n').map(JSON.parse)
const roleNames = new Set(roles.map((row) => row.job_role))

test('role tiles navigate and unknown roles have a dedicated state', () => {
  assert.match(app, /<a href=\{`\/jobs\/\$\{slugify\(jobRole\(row\)\)\}\?country=\$\{encodeURIComponent\(country\)\}`\} className=\{`market-tile/)
  assert.match(app, /function RoleNotFoundPage/)
  assert.doesNotMatch(app, /findRoleBySlug\(slug\) \?\? occupations\[0\]/)
})

test('generated pages include canonical metadata and key static routes', () => {
  for (const path of ['dist/methodology/index.html', 'dist/about/index.html', 'dist/privacy/index.html', 'dist/saved/index.html']) {
    assert.ok(existsSync(new URL(path, root)), `${path} was not generated`)
  }
  const rolePage = readFileSync(new URL('dist/jobs/customer-support-executive/index.html', root), 'utf8')
  assert.match(rolePage, /rel="canonical" href="https:\/\/global-ai-jobs-impact-dashboard\.netlify\.app\/jobs\/customer-support-executive"/)
  assert.match(rolePage, /"@type":"Occupation"/)
  const locationPage = readFileSync(new URL('dist/jobs/plumber/in/bengaluru/index.html', root), 'utf8')
  assert.match(locationPage, /plumber\/in\/bengaluru/)
  assert.match(locationPage, /"@type":"BreadcrumbList"/)
  assert.match(locationPage, /"@type":"Occupation"/)
  assert.match(locationPage, /Location demand is modelled, not a live vacancy count/)
  assert.ok(existsSync(new URL('dist/workspace/index.html', root)))
})

test('transition planner exposes role input, evidence links, roadmap, and referral disclosure', () => {
  assert.match(app, /function TransitionPlanner/)
  assert.match(app, /id="planner-current-role"/)
  assert.match(app, /Your 12-week skill roadmap/)
  assert.match(app, /rel=\{resource\.sponsored \? 'sponsored noopener noreferrer'/)
  assert.match(app, /A click alone does not create an SEO backlink or guarantee a commission/)
  assert.match(app, /showTransitionPlan/)
  assert.match(app, /function transitionSkillProfile/)
  assert.match(app, /customer journey mapping/)
  assert.match(app, /Low AI impact/)
  assert.match(app, /No unrelated alternative role is being forced/)
})

test('AI-safety quiz receives calculated automation, layoff, and demand signals', () => {
  assert.match(app, /<CareerSafetyQuiz role=\{\{/)
  assert.match(app, /automationRisk: automationRisk\(checkedRole\)/)
  assert.match(app, /layoffRisk: layoffRiskForRole\(checkedRole, selectedCountry\)/)
  assert.match(app, /hiringDemand: demandIndex\(checkedRole, selectedCountry\)/)
})

test('homepage keeps one primary journey and progressively discloses secondary tools', () => {
  assert.match(app, /className="hero-dashboard simplified-hero"/)
  assert.match(app, /className="compact-signal-grid"/)
  assert.match(app, /className="home-tools"/)
  assert.equal((app.match(/<details className="home-tool">/g) ?? []).length, 3)
  assert.match(app, /if \(!needle\) return null/)
  assert.doesNotMatch(app, /<div className="debate-card hero-debate">/)
})

test('homepage auto-detects country and keeps low-impact guidance focused', () => {
  assert.match(app, /fetch\('\/api\/geo'/)
  assert.match(app, /Approximate location/)
  assert.doesNotMatch(app, /function HeroLanding\([^)]*onCountryChange/)
  assert.match(app, /checkedAdvice\?\.decision === 'transition_recommended'/)
  assert.match(app, /\{showTransitionPlan && <details className="home-tool">/)
})

test('career comparison locks the current role and excludes it from similar choices', () => {
  assert.match(app, /function comparisonSimilarityScore/)
  assert.match(app, /filter\(\(candidate\) => jobRole\(candidate\) !== jobRole\(row\)\)/)
  assert.match(app, /className="compare-role-lock"/)
  assert.match(app, /label="Closest comparison role"/)
  assert.doesNotMatch(app, /label="Current role" value=/)
})

test('unimplemented weekly email alerts are not exposed to users', () => {
  const index = readFileSync(new URL('index.html', root), 'utf8')
  const workspace = readFileSync(new URL('src/platform/CareerWorkspace.tsx', root), 'utf8')
  assert.doesNotMatch(app, /function (?:EmailCapture|HeroEmailCapture)/)
  assert.doesNotMatch(app, /job-risk-updates|Get weekly AI job-risk updates|Get weekly AI career risk update/)
  assert.doesNotMatch(index, /job-risk-updates/)
  assert.doesNotMatch(workspace, /Save alert settings|Weekly digest day|Monthly career outlook/)
  assert.match(workspace, /Email alerts are not enabled/)
})
