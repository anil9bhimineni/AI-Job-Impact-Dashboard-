import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  Bookmark,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Calendar,
  Clipboard,
  Download,
  ExternalLink,
  Globe2,
  GraduationCap,
  MapPin,
  MessageCircle,
  Search,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  ThumbsDown,
  TrendingUp,
} from 'lucide-react'
import occupationsRaw from '../data/sample_occupations.jsonl?raw'
import indiaLayoffsRaw from '../data/india_layoffs.json?raw'
import layoffRoleSignalsRaw from '../data/layoff_role_signals.json?raw'
import countriesRaw from '../data/global_countries.json?raw'
import layoffsSourceSummaryRaw from '../data/layoffs_source_summary.json?raw'
import {
  ROLE_MODEL_UPDATED_AT,
  ROLE_MODEL_VERSION,
  hiringDemandIndex,
  hiringDemandLabel,
  layoffRiskComponents,
  layoffRiskLabel,
  layoffRiskScore,
  modelRationale,
} from './jobs-dashboard/scoringModel.js'
import { learningResourcesFor } from './jobs-dashboard/learningResources.ts'
import { careerPathRecommendation } from './jobs-dashboard/careerPathModel.ts'
import { AccountMenu } from './platform/AccountMenu.tsx'
import { CareerWorkspace } from './platform/CareerWorkspace.tsx'
import { submitScoreDispute, toggleWatchlistBySlug } from './platform/platformRepository.ts'
import { isSupabaseConfigured } from './platform/supabaseClient.ts'
import { usePlatformAuth } from './platform/usePlatformAuth.ts'
import { CareerSafetyQuiz } from './jobs-dashboard/CareerSafetyQuiz.tsx'

const occupations = occupationsRaw.trim().split('\n').map((line) => JSON.parse(line))
const countriesByContinent = JSON.parse(countriesRaw)
const layoffRoleSignals = JSON.parse(layoffRoleSignalsRaw).map(([country, role_family, roles_affected, affected_count]) => ({ country, role_family, roles_affected, affected_count }))
const indiaLayoffs = JSON.parse(indiaLayoffsRaw).map((row) => ({
  ...row,
  continent: 'Asia',
  country: 'India',
  region_label: row.city ? `${row.city}, India` : 'India',
}))
const layoffsSourceSummary = JSON.parse(layoffsSourceSummaryRaw)
const normalizeKeyPart = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
const reportedAffectedCount = (row) => row.reported_count_display ?? formatNumber(row.affected_count)
const layoffDuplicateKey = (row) => [
  normalizeKeyPart(row.company),
  normalizeKeyPart(row.country),
  row.year,
  row.month,
  Number(row.affected_count) || 0,
].join('|')
function mergeLayoffRows(globalLayoffs) {
  const globalLayoffKeys = new Set(globalLayoffs.map(layoffDuplicateKey))
  const supplementalIndiaLayoffs = indiaLayoffs.filter((row) => !globalLayoffKeys.has(layoffDuplicateKey(row)))
  return [...globalLayoffs, ...supplementalIndiaLayoffs].sort((a, b) => (
    String(b.layoffsfyi_date || `${b.year}-${String(b.month).padStart(2, '0')}`)
      .localeCompare(String(a.layoffsfyi_date || `${a.year}-${String(a.month).padStart(2, '0')}`))
  ))
}

const ALL = 'All'
const JOBS_TAB = 'jobs'
const LAYOFFS_TAB = 'layoffs'
const METRO = 'Metro'
const NON_METRO = 'Non-metro'
const SITE_URL = 'https://global-ai-jobs-impact-dashboard.netlify.app'
const INDIA_SEO_LOCATIONS = {
  bengaluru: 'Bengaluru', hyderabad: 'Hyderabad', pune: 'Pune', chennai: 'Chennai', 'delhi-ncr': 'Delhi NCR', mumbai: 'Mumbai',
  ahmedabad: 'Ahmedabad', kochi: 'Kochi', karnataka: 'Karnataka', maharashtra: 'Maharashtra', telangana: 'Telangana', 'tamil-nadu': 'Tamil Nadu', kerala: 'Kerala',
}
const LAST_REFRESHED = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  .format(new Date(layoffsSourceSummary.retrieved_at))
const DATA_THROUGH = layoffsSourceSummary.latest_event_date
  ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${layoffsSourceSummary.latest_event_date}T00:00:00Z`))
  : LAST_REFRESHED
const plural = (count, word) => `${formatNumber(count)} ${word}${count === 1 ? '' : 's'}`
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const continentNames = Object.keys(countriesByContinent)
const countryRows = continentNames.flatMap((continent) => countriesByContinent[continent].map((country) => ({ continent, country })))

const advancedAiCountries = new Set([
  'United States', 'Canada', 'United Kingdom', 'Ireland', 'Germany', 'France', 'Netherlands', 'Sweden',
  'Switzerland', 'Denmark', 'Finland', 'Norway', 'Israel', 'Singapore', 'Japan', 'South Korea',
  'Taiwan', 'Australia', 'New Zealand',
])
const scaledDigitalCountries = new Set([
  'India', 'China', 'Brazil', 'Mexico', 'Indonesia', 'Vietnam', 'Philippines', 'Malaysia', 'Thailand',
  'Turkey', 'United Arab Emirates', 'Saudi Arabia', 'Poland', 'Spain', 'Italy', 'Portugal', 'Chile',
  'Colombia', 'Argentina', 'South Africa', 'Kenya', 'Nigeria', 'Egypt', 'Morocco',
])
const continentModifiers = {
  Africa: { ai: -1, remote: -1, growth: 1, jobs: 0.42 },
  Asia: { ai: 0, remote: 0, growth: 1, jobs: 1 },
  Europe: { ai: 1, remote: 1, growth: 0, jobs: 0.82 },
  'North America': { ai: 2, remote: 2, growth: 0, jobs: 1.15 },
  Oceania: { ai: 1, remote: 1, growth: 0, jobs: 0.42 },
  'South America': { ai: 0, remote: 0, growth: 1, jobs: 0.55 },
}

const globalHubs = {
  'United States': { metro: ['San Francisco Bay Area', 'Seattle', 'New York', 'Austin', 'Boston', 'Los Angeles'], nonMetro: ['Raleigh-Durham', 'Salt Lake City', 'Columbus', 'Pittsburgh', 'Madison'] },
  India: { metro: ['Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Delhi NCR', 'Mumbai'], nonMetro: ['Coimbatore', 'Kochi', 'Indore', 'Jaipur', 'Ahmedabad', 'Bhubaneswar'] },
  China: { metro: ['Beijing', 'Shanghai', 'Shenzhen', 'Hangzhou', 'Guangzhou'], nonMetro: ['Chengdu', 'Wuhan', 'Xi\'an', 'Nanjing', 'Suzhou'] },
  'United Kingdom': { metro: ['London', 'Manchester', 'Cambridge', 'Bristol', 'Edinburgh'], nonMetro: ['Leeds', 'Belfast', 'Cardiff', 'Nottingham'] },
  Germany: { metro: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Stuttgart'], nonMetro: ['Leipzig', 'Dresden', 'Bonn', 'Karlsruhe'] },
  Singapore: { metro: ['Singapore'], nonMetro: ['Jurong', 'Tampines', 'Woodlands'] },
  Brazil: { metro: ['Sao Paulo', 'Rio de Janeiro', 'Belo Horizonte'], nonMetro: ['Curitiba', 'Recife', 'Campinas'] },
  Australia: { metro: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'], nonMetro: ['Adelaide', 'Canberra', 'Gold Coast'] },
}

function jobCategory(row) {
  return row.job_category ?? row.industry_type
}

function jobRole(row) {
  return row.job_role ?? row.occupation_title
}

function slugify(value) {
  return String(value ?? '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function normalizePathname(value) {
  const path = String(value || '/')
  return path.length > 1 ? path.replace(/\/+$/, '') : '/'
}

const roleAliases = {
  'QA Engineer / Software Tester': ['software testing', 'testing software', 'manual testing', 'manual qa', 'qa tester', 'test engineer', 'software test engineer', 'software qa'],
  'SDET / Test Automation Engineer': ['sdet', 'automation testing', 'test automation', 'automation qa', 'qa automation engineer'],
  'AI QA Engineer / Model Evaluation Tester': ['ai tester', 'ai testing', 'model tester', 'llm evaluator', 'model evaluation', 'prompt tester', 'ai qa'],
  'Software Developer': ['software engineer', 'programmer', 'application developer', 'coder'],
  'Frontend Developer': ['front end developer', 'react developer', 'ui developer', 'web developer'],
  'Backend Developer': ['back end developer', 'api developer', 'server side developer'],
  'Data Analyst': ['business data analyst', 'reporting analyst', 'mis analyst', 'dashboard analyst'],
  'Business Analyst - IT': ['business analyst', 'it ba', 'systems analyst', 'product business analyst'],
  'Technical Support Engineer': ['support engineer', 'it support', 'application support', 'l1 support'],
  'Customer Support Executive': ['customer service', 'call center', 'contact center', 'voice support', 'support executive'],
  'Voice Process Associate': ['voice process', 'call center agent', 'bpo voice'],
  'Non-Voice Process Associate': ['non voice process', 'chat support', 'email support', 'bpo non voice'],
  'Data Entry Operator - Government': ['data entry', 'deo', 'typing job', 'government data entry'],
  'Product Manager': ['pm', 'product owner', 'ai product manager'],
  'Scrum Master': ['agile coach', 'scrum lead', 'agile project coordinator'],
  'Graphic Designer': ['visual designer', 'creative designer'],
  'Content Marketing Specialist': ['content writer', 'seo writer', 'copywriter'],
  'Financial Analyst': ['fp&a analyst', 'finance analyst'],
}

function findRoleBySlug(slug) {
  const aliases = {
    'software-tester': 'qa-engineer-software-tester',
    'software-testing': 'qa-engineer-software-tester',
    'manual-testing': 'qa-engineer-software-tester',
    'manual-qa': 'qa-engineer-software-tester',
    'qa-tester': 'qa-engineer-software-tester',
    'test-engineer': 'qa-engineer-software-tester',
    'software-test-engineer': 'qa-engineer-software-tester',
    'test-automation': 'sdet-test-automation-engineer',
    'automation-testing': 'sdet-test-automation-engineer',
    'ai-testing': 'ai-qa-engineer-model-evaluation-tester',
    'ai-tester': 'ai-qa-engineer-model-evaluation-tester',
    'llm-evaluator': 'ai-qa-engineer-model-evaluation-tester',
    teacher: 'school-teacher',
    'business-analyst': 'business-analyst-it',
    'ai-ml-engineer': 'machine-learning-engineer',
    'customer-support': 'customer-support-executive',
    'customer-service': 'customer-support-executive',
    'support-engineer': 'technical-support-engineer',
  }
  const targetSlug = aliases[slug] ?? slug
  return occupations.find((row) => slugify(jobRole(row)) === targetSlug) ?? occupations.find((row) => slugify(row.occupation_title) === targetSlug)
}

function normalizeSearch(value) {
  return String(value ?? '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function searchableRoleText(row) {
  const canonical = jobRole(row)
  return normalizeSearch([
    canonical,
    row.occupation_title,
    row.job_family,
    jobCategory(row),
    ...(roleAliases[canonical] ?? []),
  ].filter(Boolean).join(' '))
}

function roleUrl(row, country = 'India') {
  const url = new URL(`${SITE_URL}/jobs/${slugify(jobRole(row))}`)
  url.searchParams.set('country', country)
  return url.toString()
}

function encodeForm(data) {
  return new URLSearchParams(data).toString()
}

function visitorId() {
  try {
    const existing = window.localStorage.getItem('job_dashboard_visitor_id')
    if (existing) return existing
    const generated = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
    window.localStorage.setItem('job_dashboard_visitor_id', generated)
    return generated
  } catch {
    return 'unknown'
  }
}

function trackEvent(eventType, payload = {}) {
  try {
    const current = JSON.parse(window.localStorage.getItem('job_dashboard_events') || '{}')
    current[eventType] = (current[eventType] || 0) + 1
    window.localStorage.setItem('job_dashboard_events', JSON.stringify(current))
    if (eventType === 'role_search' && payload.role) {
      const roleCounts = JSON.parse(window.localStorage.getItem('job_dashboard_role_searches') || '{}')
      const normalizedRole = String(payload.role).trim()
      if (normalizedRole) {
        roleCounts[normalizedRole] = (roleCounts[normalizedRole] || 0) + 1
        window.localStorage.setItem('job_dashboard_role_searches', JSON.stringify(roleCounts))
      }
    }
  } catch {
    // Local analytics is best-effort.
  }

  try {
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeForm({
        'form-name': 'analytics-events',
        event_type: eventType,
        visitor_id: visitorId(),
        payload: JSON.stringify(payload),
        path: window.location.pathname + window.location.search,
        created_at: new Date().toISOString(),
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Network analytics is best-effort.
  }
}

const SAVED_ROLES_KEY = 'job_dashboard_saved_roles_v1'

function readSavedRoles() {
  try {
    const value = JSON.parse(window.localStorage.getItem(SAVED_ROLES_KEY) || '[]')
    return Array.isArray(value) ? value.filter((item) => item && item.role && item.country) : []
  } catch {
    return []
  }
}

function useSavedRoles() {
  const [savedRoles, setSavedRoles] = useState(readSavedRoles)
  const save = (role, country) => {
    const entry = { role: jobRole(role), country, savedAt: new Date().toISOString() }
    const exists = savedRoles.some((item) => item.role === entry.role && item.country === entry.country)
    const next = exists
      ? savedRoles.filter((item) => !(item.role === entry.role && item.country === entry.country))
      : [entry, ...savedRoles].slice(0, 50)
    setSavedRoles(next)
    try { window.localStorage.setItem(SAVED_ROLES_KEY, JSON.stringify(next)) } catch { /* Device storage is best-effort. */ }
    trackEvent(exists ? 'role_unsaved' : 'role_saved', { role: entry.role, country })
  }
  return { savedRoles, save }
}

function downloadTextFile(filename, content, mimeType = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(link.href), 0)
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

function clamp(value) {
  return Math.max(0, Math.min(10, Math.round(value)))
}

function countryContext(country) {
  const countryRow = countryRows.find((row) => row.country === country)
  const continent = countryRow?.continent ?? 'Asia'
  const base = continentModifiers[continent] ?? { ai: 0, remote: 0, growth: 0, jobs: 0.6 }
  const tier = advancedAiCountries.has(country) ? 'advanced' : scaledDigitalCountries.has(country) ? 'scaled' : 'emerging'
  const tierMods = tier === 'advanced' ? { ai: 2, remote: 2, growth: 0, jobs: 1.05 } : tier === 'scaled' ? { ai: 1, remote: 0, growth: 1, jobs: 0.9 } : { ai: -1, remote: -1, growth: 1, jobs: 0.55 }
  return {
    continent,
    tier,
    ai: base.ai + tierMods.ai,
    remote: base.remote + tierMods.remote,
    growth: base.growth + tierMods.growth,
    jobs: base.jobs * tierMods.jobs,
  }
}

function scoredOccupation(row, country) {
  const context = countryContext(country)
  const tech = clamp(row.tech_adoption_score + context.ai)
  const remote = clamp(row.remote_work_score + context.remote)
  const growth = clamp(row.growth_outlook_score + context.growth)
  const base = { ...row, tech, remote, growth, countryContext: context }
  const risk = automationRisk(base)
  const penalty = Math.max(0, risk - 5) * 0.45
  const aiImpact = clamp((growth * 0.55) + (remote * 0.15) + (tech * 0.15) + augmentationBonus(base) - penalty)
  return { ...base, aiImpact, automation: risk }
}

function aiColor(score) {
  if (score <= 4) return '#dc2626'
  if (score <= 7) return '#ca8a04'
  return '#16a34a'
}

function aiLabel(score) {
  if (score <= 4) return 'Low AI impact'
  if (score <= 7) return 'Moderate AI opportunity'
  return 'High AI opportunity'
}

function riskLabel(score) {
  if (score <= 4) return 'Low'
  if (score <= 7) return 'Medium'
  return 'High'
}

function riskClass(score) {
  if (score <= 4) return 'good'
  if (score <= 7) return 'watch'
  return 'risk'
}

function automationRisk(row) {
  if (Number.isFinite(row.automation_risk_score)) return clamp(row.automation_risk_score)
  const role = jobRole(row).toLowerCase()
  const entryPenalty = row.india_skill_level === 'ENTRY_LEVEL' ? 1.2 : row.india_skill_level === 'SENIOR_SPECIALIST' ? -0.8 : 0
  const categoryPenalty = ['Customer Operations', 'Support & Operations', 'Store Operations', 'Warehouse Operations'].includes(row.job_family) ? 1.1 : 0
  const qaPenalty = (role.includes('tester') || role.includes('qa')) && !role.includes('sdet') && !role.includes('automation') && !role.includes('model evaluation') ? 2.5 : 0
  const developerPenalty = role.includes('developer') ? 1.1 : 0
  const analystPenalty = role.includes('analyst') && !row.job_family.includes('AI') ? 0.8 : 0
  return clamp((row.tech * 0.35) + ((10 - row.growth) * 0.45) + entryPenalty + categoryPenalty + qaPenalty + developerPenalty + analystPenalty)
}

function augmentationBonus(row) {
  const role = jobRole(row).toLowerCase()
  if (role.includes('model evaluation') || role.includes('machine learning') || role.includes('ai ')) return 1.2
  if (row.job_family.includes('AI & Machine Learning') || row.job_family.includes('Security')) return 0.9
  if (row.job_family.includes('Engineering Leadership') || row.job_family.includes('Infrastructure & Cloud')) return 0.7
  if (row.job_family.includes('Product')) return 0.6
  if ((role.includes('tester') || role.includes('qa')) && !role.includes('sdet') && !role.includes('automation') && !role.includes('model evaluation')) return -0.8
  if (role.includes('developer')) return 0.2
  return 0
}

function roleSearchScore(row, needle) {
  const role = normalizeSearch(jobRole(row))
  const query = normalizeSearch(needle)
  const aliasList = (roleAliases[jobRole(row)] ?? []).map(normalizeSearch)
  const haystack = searchableRoleText(row)
  if (!query) return role.includes('product manager') ? 40 : row.aiImpact
  let score = 0
  if (role === query) score += 120
  if (aliasList.includes(query)) score += 110
  if (role.includes(query)) score += 70
  if (haystack.includes(query)) score += 65
  if (query.includes(role)) score += 45
  for (const token of query.split(' ').filter((part) => part.length > 2)) {
    if (haystack.includes(token)) score += 8
  }
  return score + row.aiImpact
}

function transitionAdvice(row, country = 'India') {
  const targetSignals = Object.fromEntries(occupations.map((target) => [jobRole(target), {
    automationRisk: automationRisk(target),
    layoffRisk: layoffRiskForRole(target, country),
    growth: Number(target.growth ?? target.growth_outlook_score ?? 0),
  }]))
  return careerPathRecommendation(row, {
    automationRisk: automationRisk(row),
    layoffRisk: layoffRiskForRole(row, country),
    growth: Number(row.growth ?? row.growth_outlook_score ?? 0),
    targetSignals,
  })
}

function recommendedAction(advice, row) {
  return advice.nextRoles[0] || advice.title || `Strengthen ${jobRole(row)}`
}

function comparisonSimilarityScore(source, candidate, country = 'India') {
  let score = 0
  if (source.job_family === candidate.job_family) score += 80
  if (jobCategory(source) === jobCategory(candidate)) score += 45
  if (source.india_sector === candidate.india_sector) score += 30
  if (source.india_education_band === candidate.india_education_band) score += 12
  if (source.india_skill_level === candidate.india_skill_level) score += 8
  score -= Math.abs(automationRisk(source) - automationRisk(candidate)) * 3
  score -= Math.abs(demandIndex(source, country) - demandIndex(candidate, country)) * 0.25
  score -= Math.abs(Number(source.growth ?? source.growth_outlook_score ?? 0) - Number(candidate.growth ?? candidate.growth_outlook_score ?? 0)) * 2
  return score
}

function similarComparisonRoles(row, country = 'India') {
  return occupations
    .filter((candidate) => jobRole(candidate) !== jobRole(row))
    .sort((a, b) => comparisonSimilarityScore(row, b, country) - comparisonSimilarityScore(row, a, country))
}

function topCountriesForRole(row) {
  return countryRows
    .map(({ country }) => {
      const scored = scoredOccupation(row, country)
      return { country, demand: demandIndex(scored, country), score: scored.aiImpact }
    })
    .sort((a, b) => (b.demand * b.score) - (a.demand * a.score))
    .slice(0, 5)
}

function formatJobs(value) {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
  return value.toLocaleString('en-IN')
}

function formatNumber(value) {
  return value.toLocaleString('en-IN')
}

function formatMonth(row) {
  return `${monthNames[row.month - 1]} ${row.year}`
}

function uniqueFrom(rows, getter) {
  return [ALL, ...Array.from(new Set(rows.map(getter).filter(Boolean))).sort()]
}

function countriesFor(continent) {
  if (continent === ALL) return [ALL, ...countryRows.map((row) => row.country).sort()]
  return [ALL, ...(countriesByContinent[continent] ?? []).sort()]
}

function continentForCountry(country) {
  return countryRows.find((row) => row.country === country)?.continent ?? 'Asia'
}

function roleFamilyOptions(category) {
  const rows = category === ALL ? occupations : occupations.filter((row) => jobCategory(row) === category)
  return uniqueFrom(rows, (row) => row.job_family)
}

function hubsFor(country, mode) {
  const hubs = globalHubs[country] ?? { metro: ['Capital region', 'Largest business city', 'Main tech hub'], nonMetro: ['Secondary cities', 'Regional towns', 'Industrial clusters'] }
  return mode === METRO ? hubs.metro : hubs.nonMetro
}

function roleAvailable(row, country, locationMode, city) {
  if (locationMode === ALL) return true
  if (locationMode === METRO && row.metro_score < 4) return false
  if (locationMode === NON_METRO && row.metro_score > 8) return false
  return city === ALL || hubsFor(country, locationMode).includes(city)
}

function demandIndex(row, country) {
  return hiringDemandIndex(row, countryContext(country))
}

function salaryBand(row, country) {
  const indiaBase = {
    Product: [18, 55],
    Engineering: [10, 38],
    'AI & Machine Learning': [18, 65],
    'Data & Analytics': [9, 34],
    'Quality Assurance': [7, 26],
    'Business Analysis': [8, 30],
    'Infrastructure & Cloud': [12, 42],
    Security: [13, 45],
    Design: [8, 30],
    Teaching: [3, 12],
    'Clinical Care': [4, 18],
    Sales: [4, 20],
  }
  const base = indiaBase[row.job_family] ?? [4, 18]
  const seniority = row.india_skill_level === 'SENIOR_SPECIALIST' ? 1.35 : row.india_skill_level === 'ENTRY_LEVEL' ? 0.55 : 1
  if (country !== 'India') return 'Local salary data unavailable'
  const min = Math.round(base[0] * seniority)
  const max = Math.round(base[1] * seniority)
  return `₹${min}-${max} LPA`
}

function hiringDemand(row, country) {
  return hiringDemandLabel(demandIndex(row, country))
}

function topSkills(row) {
  const advice = transitionAdvice(row)
  const base = [row.job_family, jobCategory(row), 'AI tool fluency'].filter(Boolean)
  return Array.from(new Set([...advice.skills, ...base])).slice(0, 6)
}

function courseSuggestions(row) {
  const role = jobRole(row).toLowerCase()
  if (role.includes('product')) return ['AI Product Management', 'LLMOps for PMs', 'Product analytics', 'Responsible AI basics']
  if (role.includes('tester') || role.includes('qa')) return ['Test automation with Python', 'AI evaluation', 'API testing', 'Prompt testing']
  if (row.job_family.includes('Engineering')) return ['LLM app development', 'RAG systems', 'Cloud deployment', 'Software architecture']
  if (row.job_family.includes('Data')) return ['SQL analytics', 'Python for data', 'BI automation', 'Semantic modelling']
  return ['AI tools for work', 'Data literacy', 'Workflow automation', 'Domain analytics']
}

function transitionSkillProfile(row) {
  const family = String(row.job_family || '').toLowerCase()
  const role = jobRole(row).toLowerCase()
  if (family.includes('business analysis')) return ['process mapping', 'requirements discovery', 'SQL analysis', 'stakeholder management']
  if (family.includes('customer')) return ['customer journey mapping', 'CRM analytics', 'service design', 'AI-assisted support']
  if (family.includes('training') || role.includes('teacher') || role.includes('lecturer')) return ['instructional design', 'LMS administration', 'facilitation', 'AI-assisted content design']
  if (family.includes('product')) return ['product discovery', 'product analytics', 'experimentation', 'AI product strategy']
  if (family.includes('machine learning') || role.includes('machine learning')) return ['Python', 'machine learning foundations', 'model evaluation', 'MLOps']
  if (family.includes('data')) return ['SQL', 'Python', 'data visualization', 'statistics']
  if (family.includes('cloud') || role.includes('devops')) return ['cloud fundamentals', 'infrastructure as code', 'cloud security', 'observability']
  if (family.includes('security')) return ['security fundamentals', 'incident response', 'risk assessment', 'security automation']
  return transitionAdvice(row).skills
}

function threeMonthPlan(row) {
  const skills = topSkills(row)
  const advice = transitionAdvice(row)
  return [
    `Month 1: strengthen ${skills[0] ?? 'AI fundamentals'} and map current tasks to AI-assisted workflows.`,
    `Month 2: build one portfolio project using ${skills[1] ?? 'automation'} and publish a short case study.`,
    advice.nextRoles.length
      ? `Month 3: reposition your resume around ${advice.nextRoles[0]} and validate the move through informational interviews.`
      : `Month 3: apply the new skills inside ${jobRole(row)} work and document the result before reconsidering a career move.`,
  ]
}

function layoffRiskForRole(row, country) {
  return layoffRiskScore(row, country, layoffRoleSignals)
}

function downloadScoreCard(row, country) {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 630
  const ctx = canvas.getContext('2d')
  const risk = automationRisk(row)
  const layoff = layoffRiskForRole(row, country)
  const advice = transitionAdvice(row)

  ctx.fillStyle = '#f7f9fd'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#e6ebf3'
  for (let x = 650; x < 1130; x += 18) {
    for (let y = 40; y < 590; y += 18) {
      if ((x + y) % 54 === 0) {
        ctx.beginPath()
        ctx.arc(x, y, 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  ctx.fillStyle = '#071638'
  ctx.font = '800 64px Arial'
  ctx.fillText('Will AI Grow or', 64, 128)
  ctx.fillText('Threaten My Job?', 64, 204)
  ctx.fillStyle = '#172033'
  ctx.font = '400 30px Arial'
  ctx.fillText(`Role: ${jobRole(row)}`, 64, 272)
  ctx.fillText(`Country: ${country}`, 64, 314)

  const cards = [
    ['AI Growth', `${row.aiImpact}/10`, aiLabel(row.aiImpact), '#16a34a'],
    ['Automation Risk', riskLabel(risk), 'Some tasks may change', '#f2b400'],
    ['Layoff Risk', layoffRiskLabel(layoff), 'Reported market signal', '#dc2626'],
  ]
  cards.forEach(([label, value, note, color], index) => {
    const x = 64 + index * 356
    const y = 370
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#dbe3ef'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(x, y, 320, 132, 18)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x + 52, y + 52, 30, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = color
    ctx.font = '800 18px Arial'
    ctx.fillText(label.toUpperCase(), x + 96, y + 44)
    ctx.font = '800 34px Arial'
    ctx.fillText(value, x + 96, y + 82)
    ctx.fillStyle = '#526071'
    ctx.font = '400 18px Arial'
    ctx.fillText(note, x + 22, y + 112)
  })

  ctx.fillStyle = '#071638'
  ctx.font = '800 28px Arial'
  ctx.fillText(`Recommended action: ${recommendedAction(advice, row)}`, 64, 560)
  ctx.fillStyle = '#526071'
  ctx.font = '400 20px Arial'
  ctx.fillText('global-ai-jobs-impact-dashboard.netlify.app', 64, 596)

  const link = document.createElement('a')
  link.download = `${slugify(jobRole(row))}-ai-job-score.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
  trackEvent('share_image_downloaded', { role: jobRole(row), country })
}

function Stat({ icon: Icon, label, value, note }) {
  return (
    <article className="stat">
      <span><Icon size={18} /></span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
        {note && <em>{note}</em>}
      </div>
    </article>
  )
}

function SelectFilter({ label, value, options, onChange }) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function SegmentedFilter({ label, value, options, onChange }) {
  return (
    <div className="segmented-field">
      <span>{label}</span>
      <div>
        {options.map((option) => <button type="button" className={option === value ? 'active' : ''} key={option} onClick={() => onChange(option)}>{option}</button>)}
      </div>
    </div>
  )
}

function ViewTabs({ activeTab, onChange }) {
  return (
    <nav className="view-tabs" aria-label="Dashboard views">
      <button type="button" aria-pressed={activeTab === JOBS_TAB} className={activeTab === JOBS_TAB ? 'active' : ''} onClick={() => onChange(JOBS_TAB)}>
        <Globe2 size={16} /> AI impact jobs
      </button>
      <button type="button" aria-pressed={activeTab === LAYOFFS_TAB} className={activeTab === LAYOFFS_TAB ? 'active' : ''} onClick={() => onChange(LAYOFFS_TAB)}>
        <AlertTriangle size={16} /> Global layoffs
      </button>
    </nav>
  )
}

function RoleTile({ row, country }) {
  const demand = demandIndex(row, country)
  const span = demand >= 80 ? 3 : demand >= 65 ? 2 : 1
  return (
    <a href={`/jobs/${slugify(jobRole(row))}?country=${encodeURIComponent(country)}`} className={`market-tile span-${span}`} style={{ '--tile-color': aiColor(row.aiImpact), '--tile-soft': `${aiColor(row.aiImpact)}17` }}>
      <div className="tile-head">
        <strong>{jobRole(row)}</strong>
        <b>{row.aiImpact}</b>
      </div>
      <span>{row.job_family}</span>
      <div className="tile-foot">
        <em>Demand {demand}/100</em>
        <i>{aiLabel(row.aiImpact)}</i>
      </div>
      <div className="tile-score-popover" aria-hidden="true">
        <strong>{jobRole(row)}</strong>
        <span>AI impact <b>{row.aiImpact}/10</b></span>
        <span>Tech adoption <b>{row.tech}/10</b></span>
        <span>Remote work <b>{row.remote}/10</b></span>
        <span>Growth <b>{row.growth}/10</b></span>
      </div>
    </a>
  )
}

function RoleMap({ rows, country }) {
  const grouped = useMemo(() => {
    const map = new Map()
    rows.forEach((row) => {
      const category = jobCategory(row)
      if (!map.has(category)) map.set(category, [])
      map.get(category).push(row)
    })
    return Array.from(map.entries()).map(([categoryName, items]) => ({
      categoryName,
      items: items.sort((a, b) => demandIndex(b, country) - demandIndex(a, country)),
      demand: Math.round(items.reduce((sum, item) => sum + demandIndex(item, country), 0) / items.length),
    })).sort((a, b) => b.demand - a.demand)
  }, [rows, country])

  return (
    <section className="treemap-panel">
      {grouped.map((group) => (
        <section className="industry-block" key={group.categoryName}>
          <header>
            <h3>{group.categoryName}</h3>
            <span>{group.items.length} job roles / avg demand {group.demand}/100</span>
          </header>
          <div className="market-map">
            {group.items.map((row) => <RoleTile key={jobRole(row)} row={row} country={country} />)}
          </div>
        </section>
      ))}
      {!grouped.length && <div className="empty-results">No job roles match those filters.</div>}
    </section>
  )
}

function CheckMyJob({ query, onQueryChange, role, country }) {
  const [copied, setCopied] = useState(false)
  const [copiedDebate, setCopiedDebate] = useState(false)
  const risk = role ? automationRisk(role) : 0
  const advice = role ? transitionAdvice(role) : null
  const topCountries = role ? topCountriesForRole(role) : []
  const personalUrl = role ? roleUrl(role, country) : SITE_URL
  const shareText = role ? `My role: ${jobRole(role)}\nAI opportunity: ${role.aiImpact}/10 (${aiLabel(role.aiImpact)})\nAutomation Risk: ${riskLabel(risk)}\nRemote-work potential: ${role.remote}/10\nRecommended action: ${recommendedAction(advice, role)}\nCheck your role: ${personalUrl}` : ''
  const debateText = role ? `My job has ${aiLabel(role.aiImpact).toLowerCase()}: ${jobRole(role)} scored ${role.aiImpact}/10.\n\nAutomation risk: ${riskLabel(risk)}\nRecommended action: ${recommendedAction(advice, role)}\n\nDo you agree with this score?\n${personalUrl}` : ''
  const linkedInShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(personalUrl)}`
  const whatsAppShare = `https://wa.me/?text=${encodeURIComponent(debateText)}`

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      trackEvent('share_result_clicked', { role: jobRole(role), country })
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const copyDebate = async () => {
    try {
      await navigator.clipboard.writeText(debateText)
      trackEvent('debate_prompt_copied', { role: jobRole(role), country })
      setCopiedDebate(true)
      window.setTimeout(() => setCopiedDebate(false), 1800)
    } catch {
      setCopiedDebate(false)
    }
  }

  if (!role) {
    return (
      <section className="job-check-panel">
        <div className="job-check-search">
          <span className="eyebrow">Check my job</span>
          <h2>Find which careers will grow with AI</h2>
          <label>
            <Search size={18} />
            <input aria-label="Search job role" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Enter your role, for example Product Manager" />
          </label>
        </div>
        <p className="map-note">Search a role to see AI growth potential, automation risk, remote-work potential, hiring countries, and safer transition paths.</p>
      </section>
    )
  }

  return (
    <section className="job-check-panel">
      <div className="job-check-search">
        <span className="eyebrow">Check my job</span>
        <h2>{jobRole(role)}</h2>
        <label>
          <Search size={18} />
          <input aria-label="Search job role" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Enter your role, for example Product Manager" />
        </label>
      </div>

      <div className="result-card" style={{ '--result-color': aiColor(role.aiImpact) }}>
        <div className="result-score">
          <strong>{role.aiImpact}/10</strong>
          <span>{aiLabel(role.aiImpact)}</span>
        </div>
        <div className="result-metrics">
          <span className={riskClass(risk)}><ShieldCheck size={15} /> Automation risk: <b>{riskLabel(risk)}</b></span>
          <span><Globe2 size={15} /> Remote work: <b>{role.remote}/10</b></span>
          <span><TrendingUp size={15} /> Growth outlook: <b>{role.growth}/10</b></span>
        </div>
      </div>

      <div className="job-check-grid">
        <article>
          <h3>Modelled country demand outlook</h3>
          <div className="country-chips">
            {topCountries.map((item) => <span key={item.country}>{item.country}<b>{item.demand}/100</b></span>)}
          </div>
        </article>
        <article>
          <h3>{advice.nextRoles.length ? 'Optional adjacent paths' : 'Career-path guidance'}</h3>
          <p>{advice.nextRoles.length ? advice.nextRoles.join(' / ') : advice.message}</p>
        </article>
        <article>
          <h3>Skill gap</h3>
          <p>{advice.skills.join(', ')}</p>
        </article>
        <article>
          <h3>Recommended timing</h3>
          <p>{advice.time}</p>
        </article>
      </div>

      <div className="share-card">
        <div>
          <strong>Shareable result</strong>
          <span>My role: {jobRole(role)} | AI opportunity: {role.aiImpact}/10 | Risk: {riskLabel(risk)} | Action: {recommendedAction(advice, role)}</span>
        </div>
        <div className="share-actions">
          <a href={personalUrl} onClick={() => trackEvent('personal_url_opened', { role: jobRole(role), country })}><ExternalLink size={16} /> Role page</a>
          <button type="button" onClick={() => downloadScoreCard(role, country)}><Download size={16} /> Image</button>
          <button type="button" onClick={copyShare}><Clipboard size={16} /> {copied ? 'Copied' : 'Copy'}</button>
        </div>
      </div>

      <div className="debate-card">
        <div>
          <span><MessageCircle size={18} /></span>
          <div>
            <strong>Your job is {aiLabel(role.aiImpact)}. Ask your network: do you agree?</strong>
            <em>Debate creates comments. Comments create reach.</em>
          </div>
        </div>
        <div className="share-actions">
          <a href={linkedInShare} target="_blank" rel="noreferrer" onClick={() => trackEvent('linkedin_share_opened', { role: jobRole(role), country })}><Share2 size={16} /> LinkedIn</a>
          <a href={whatsAppShare} target="_blank" rel="noreferrer" onClick={() => trackEvent('whatsapp_share_opened', { role: jobRole(role), country })}><MessageCircle size={16} /> WhatsApp</a>
          <button type="button" onClick={copyDebate}><Clipboard size={16} /> {copiedDebate ? 'Copied' : 'Copy debate post'}</button>
        </div>
      </div>
    </section>
  )
}

function SalarySkillGap({ role, country }) {
  if (!role) return null
  const advice = transitionAdvice(role)
  return (
    <section className="salary-panel">
      <div className="section-title compact-title">
        <div><span className="eyebrow">Salary + skill gap</span><h2>{jobRole(role)} career snapshot</h2></div>
        <GraduationCap size={20} />
      </div>
      <div className="salary-grid">
        <article>
          <span>Expected salary band</span>
          <strong>{salaryBand(role, country)}</strong>
          <em>Indicative annual range, not a compensation guarantee.</em>
        </article>
        <article>
          <span>Hiring demand</span>
          <strong>{hiringDemand(role, country)}</strong>
          <em>Demand index {demandIndex(role, country)}/100; not a live vacancy count</em>
        </article>
        <article>
          <span>Recommended action</span>
          <strong>{recommendedAction(advice, role)}</strong>
          <em>{advice.time}</em>
        </article>
      </div>
      <div className="learning-grid">
        <article>
          <h3>Top skills</h3>
          <div className="skill-tags">{topSkills(role).map((skill) => <span key={skill}>{skill}</span>)}</div>
        </article>
        <article>
          <h3>Courses/certifications to consider</h3>
          <ul>{courseSuggestions(role).map((course) => <li key={course}>{course}</li>)}</ul>
        </article>
        <article>
          <h3>3-month transition plan</h3>
          <ul>{threeMonthPlan(role).map((step) => <li key={step}>{step}</li>)}</ul>
        </article>
      </div>
    </section>
  )
}

function TransitionPlanner({ currentRole, country, query, onQueryChange }) {
  const indiaRole = scoredOccupation(occupations.find((row) => jobRole(row) === jobRole(currentRole)) || currentRole, 'India')
  const advice = transitionAdvice(indiaRole)
  const targets = advice.nextRoles
    .map((name) => occupations.find((row) => jobRole(row) === name))
    .filter(Boolean)
    .map((row) => scoredOccupation(row, country))
  const requestedTarget = new URLSearchParams(window.location.search).get('transition_to')
  const [selectedTargetName, setSelectedTargetName] = useState(
    targets.some((row) => jobRole(row) === requestedTarget) ? requestedTarget : targets[0] ? jobRole(targets[0]) : '',
  )

  useEffect(() => {
    setSelectedTargetName(targets.some((row) => jobRole(row) === requestedTarget) ? requestedTarget : targets[0] ? jobRole(targets[0]) : '')
    // The candidate set intentionally resets when the current role changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRole])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (selectedTargetName) url.searchParams.set('transition_to', selectedTargetName)
    else url.searchParams.delete('transition_to')
    window.history.replaceState(null, '', `${url.pathname}${url.search}`)
  }, [selectedTargetName])

  const hasTargets = targets.length > 0
  const target = targets.find((row) => jobRole(row) === selectedTargetName) || targets[0] || indiaRole
  const currentSkills = new Set(transitionSkillProfile(indiaRole).map((skill) => skill.toLowerCase()))
  const targetSkills = hasTargets ? transitionSkillProfile(target) : advice.skills
  const skillGaps = targetSkills.filter((skill) => !currentSkills.has(skill.toLowerCase())).slice(0, 4)
  const prioritySkills = hasTargets ? (skillGaps.length ? skillGaps : targetSkills.slice(0, 4)) : advice.skills.slice(0, 4)
  const resources = learningResourcesFor(`India ${jobRole(target)} ${target.job_family} ${prioritySkills.join(' ')}`)
  const roadmap = hasTargets ? [
    { phase: 'Weeks 1–2', title: 'Map transferable experience', detail: `Rewrite three ${jobRole(indiaRole)} achievements around outcomes relevant to ${jobRole(target)}.` },
    { phase: 'Weeks 3–6', title: `Build ${prioritySkills[0] || 'AI tool fluency'}`, detail: 'Complete one focused learning path and practise it for 4–6 hours each week.' },
    { phase: 'Weeks 7–10', title: 'Create proof of work', detail: `Publish a small ${jobRole(target)} project using ${prioritySkills[1] || prioritySkills[0] || 'domain skills'}, with the problem, method, and measured result.` },
    { phase: 'Weeks 11–12', title: 'Validate before switching', detail: `Interview people doing ${jobRole(target)} work and test the market before leaving your current role.` },
  ] : advice.decision === 'insufficient_evidence' ? [
    { phase: 'Weeks 1–2', title: 'Do not make a forced move', detail: `Document which ${jobRole(indiaRole)} tasks are changing and which remain in demand.` },
    { phase: 'Weeks 3–6', title: `Test ${prioritySkills[0] || 'one complementary skill'}`, detail: 'Use a small course or workplace project before paying for a long programme.' },
    { phase: 'Weeks 7–10', title: 'Collect human evidence', detail: 'Speak with employers, experienced practitioners, or a qualified counsellor about realistic adjacent roles.' },
    { phase: 'Weeks 11–12', title: 'Reassess with evidence', detail: 'Choose a destination only after confirming requirements, salary, and local demand.' },
  ] : [
    { phase: 'Weeks 1–2', title: 'Keep your current career', detail: `Identify the highest-value parts of ${jobRole(indiaRole)} work that require physical execution, judgment, safety, or customer trust.` },
    { phase: 'Weeks 3–6', title: `Add ${prioritySkills[0] || 'digital tool fluency'}`, detail: 'Learn one complementary tool without leaving your current role.' },
    { phase: 'Weeks 7–10', title: 'Apply it on the job', detail: `Use ${prioritySkills[1] || prioritySkills[0] || 'the new skill'} to improve quality, speed, safety, or customer outcomes.` },
    { phase: 'Weeks 11–12', title: 'Document the improvement', detail: 'Add the result to your resume or service profile and review market demand again in 6–12 months.' },
  ]

  return (
    <section className="transition-planner" aria-labelledby="transition-planner-title">
      <header className="transition-planner-header">
        <div><span className="eyebrow">India career decision planner</span><h2 id="transition-planner-title">Should you change careers?</h2><p>We recommend a move only when disruption evidence is strong and an adjacent destination makes sense.</p></div>
        <span className="planner-step-count">India launch · 4 steps</span>
      </header>

      <div className="planner-current-role">
        <label htmlFor="planner-current-role"><span>1</span><div><b>Your current role</b><em>Type any title—we match it to the closest dashboard role.</em></div></label>
        <div className="planner-role-input"><Search size={19} /><input id="planner-current-role" list="transition-role-options" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="For example, Customer Support Executive" /><datalist id="transition-role-options">{occupations.map((row) => <option key={jobRole(row)} value={jobRole(row)} />)}</datalist></div>
        <div className="planner-current-summary"><strong>{jobRole(indiaRole)}</strong><span>India AI outlook {indiaRole.aiImpact}/10</span><span>India layoff risk {layoffRiskLabel(layoffRiskForRole(indiaRole, country))}</span></div>
      </div>

      <section className={`career-decision ${advice.decision}`} aria-label="Career path recommendation">
        <div><ShieldCheck size={22} /><span><b>{advice.title}</b><em>{advice.message}</em></span></div>
        <span>Confidence: {advice.confidence}</span>
      </section>

      <div className="planner-section-heading"><span>2</span><div><b>{hasTargets ? (advice.decision === 'monitor' ? 'Optional adjacent paths' : 'Evidence-backed adjacent paths') : 'Career-path decision'}</b><em>{hasTargets ? 'Select a role to personalize the plan. These are options, not guarantees.' : 'No unrelated alternative role is being forced.'}</em></div></div>
      {hasTargets && <div className="transition-targets">
        {targets.map((candidate, index) => {
          const selected = jobRole(candidate) === jobRole(target)
          return (
            <article className={selected ? 'selected' : ''} key={jobRole(candidate)}>
              <button type="button" aria-pressed={selected} onClick={() => { setSelectedTargetName(jobRole(candidate)); trackEvent('transition_role_selected', { from_role: jobRole(indiaRole), to_role: jobRole(candidate), country }) }}>
                <span>Option {index + 1}</span><strong>{jobRole(candidate)}</strong><em>{candidate.job_family}</em>
                <div><b>AI {candidate.aiImpact}/10</b><b>Demand {demandIndex(candidate, country)}/100</b><b>Risk {layoffRiskLabel(layoffRiskForRole(candidate, country))}</b></div>
              </button>
              <a href={`/jobs/${slugify(jobRole(candidate))}?country=${encodeURIComponent(country)}`}>View role evidence <ExternalLink size={14} /></a>
            </article>
          )
        })}
      </div>}

      <div className="planner-plan-grid">
        <section className="roadmap-card">
          <div className="planner-section-heading"><span>3</span><div><b>Your 12-week skill roadmap</b><em>Adapt the pace to your experience and available time.</em></div></div>
          <ol>{roadmap.map((step) => <li key={step.phase}><span>{step.phase}</span><div><strong>{step.title}</strong><p>{step.detail}</p></div></li>)}</ol>
          <div className="planner-skills"><b>Priority skills</b>{prioritySkills.map((skill) => <span key={skill}>{skill}</span>)}</div>
        </section>

        <section className="learning-resources-card">
          <div className="planner-section-heading"><span>4</span><div><b>Start learning</b><em>Provider links open in a new tab. Pricing and availability can change.</em></div></div>
          <div className="learning-resource-list">
            {resources.map((resource) => (
              <a key={resource.id} href={resource.url} target="_blank" rel={resource.sponsored ? 'sponsored noopener noreferrer' : 'noopener noreferrer'} referrerPolicy="strict-origin-when-cross-origin" onClick={() => trackEvent('learning_resource_clicked', { resource_id: resource.id, provider: resource.provider, from_role: jobRole(indiaRole), to_role: hasTargets ? jobRole(target) : '', sponsored: resource.sponsored })}>
                <span>{resource.provider}</span><strong>{resource.title}</strong><em>{resource.level} · {resource.duration} · {resource.price}</em><b>{resource.sponsored ? 'Sponsored link' : 'Provider link'} <ExternalLink size={14} /></b>
              </a>
            ))}
          </div>
          <p className="affiliate-disclosure"><ShieldCheck size={16} /><span><b>Referral disclosure:</b> configured affiliate links may earn this dashboard a commission at no extra cost to you. A click alone does not create an SEO backlink or guarantee a commission.</span></p>
        </section>
      </div>
    </section>
  )
}

function SavedRoleButton({ role, country }) {
  const { savedRoles, save } = useSavedRoles()
  const auth = usePlatformAuth()
  const [syncStatus, setSyncStatus] = useState('idle')
  const saved = savedRoles.some((item) => item.role === jobRole(role) && item.country === country)
  const toggle = async () => {
    save(role, country)
    if (auth.status !== 'signed_in') return
    setSyncStatus('saving')
    try {
      const watching = await toggleWatchlistBySlug(slugify(jobRole(role)))
      setSyncStatus(watching ? 'watched' : 'idle')
    } catch {
      setSyncStatus('error')
    }
  }
  return (
    <button type="button" className={`save-role-button ${saved ? 'saved' : ''}`} aria-pressed={saved} onClick={() => void toggle()} disabled={syncStatus === 'saving'} title={syncStatus === 'error' ? 'Saved locally; account sync failed.' : undefined}>
      <Bookmark size={16} /> {syncStatus === 'saving' ? 'Syncing…' : syncStatus === 'watched' ? 'Saved to account' : saved ? 'Saved on this device' : auth.status === 'signed_in' ? 'Save to account' : 'Save role'}
    </button>
  )
}

function ScoreExplanation({ role, country }) {
  const components = layoffRiskComponents(role, country, layoffRoleSignals)
  const risk = layoffRiskForRole(role, country)
  const confidence = components.reportedPressure >= 7 ? 'Medium-high' : 'Medium'
  const rows = [
    ['Task automation exposure', components.automation, '50%'],
    ['Weak-growth pressure', components.growthWeakness, '18%'],
    ['Seniority vulnerability', components.seniorityVulnerability, '12%'],
    ['Reported layoff pressure', components.reportedPressure, '15%'],
    ['Routine-task exposure', components.routineExposure, '5%'],
  ]
  return (
    <section className="explanation-panel" aria-labelledby="score-explanation-title">
      <div className="section-title compact-title">
        <div><span className="eyebrow">Explainable score</span><h2 id="score-explanation-title">Why this role is {layoffRiskLabel(risk)} risk</h2></div>
        <ShieldCheck size={20} />
      </div>
      <p>{modelRationale(role, country, layoffRoleSignals)}</p>
      <div className="component-bars">
        {rows.map(([label, value, weight]) => (
          <div key={label}>
            <span><b>{label}</b><em>{value}/10 · {weight} weight</em></span>
            <i><em style={{ width: `${value * 10}%` }} /></i>
          </div>
        ))}
      </div>
      <footer><b>Evidence confidence: {confidence}</b><span>Model {ROLE_MODEL_VERSION}, updated {ROLE_MODEL_UPDATED_AT}. Directional career signal—not an individual layoff forecast.</span></footer>
    </section>
  )
}

function SkillSimulator({ role }) {
  const options = [
    ['ai_tools', 'AI workflow tools', 1],
    ['data', 'Data literacy', 1],
    ['automation', 'Automation / APIs', 1],
    ['domain', 'Deeper domain expertise', 1],
  ]
  const [selected, setSelected] = useState([])
  const lift = selected.length
  const projectedGrowth = Math.min(10, role.aiImpact + lift)
  const projectedRisk = Math.max(1, automationRisk(role) - Math.floor(lift / 2))
  return (
    <section className="simulator-panel" aria-labelledby="skill-simulator-title">
      <div className="section-title compact-title">
        <div><span className="eyebrow">Career simulator</span><h2 id="skill-simulator-title">How could new skills change your outlook?</h2></div>
        <SlidersHorizontal size={20} />
      </div>
      <div className="simulator-options">
        {options.map(([id, label]) => (
          <label key={id}>
            <input type="checkbox" checked={selected.includes(id)} onChange={() => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <div className="simulator-results">
        <article><span>Current AI outlook</span><strong>{role.aiImpact}/10</strong></article>
        <article><span>Scenario outlook</span><strong>{projectedGrowth}/10</strong></article>
        <article><span>Scenario automation risk</span><strong>{projectedRisk}/10</strong></article>
      </div>
      <small>Scenario only. Skills improve task mix and mobility; they do not guarantee employment or change measured market demand.</small>
    </section>
  )
}

function RoleFeedback({ role, country }) {
  const [status, setStatus] = useState('idle')
  const [reason, setReason] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    if (!reason.trim()) { setStatus('invalid'); return }
    setStatus('saving')
    const text = reason.trim()
    // Two independent destinations: Supabase (score_disputes) and Netlify Forms. Either one succeeding counts.
    const toSupabase = isSupabaseConfigured
      ? submitScoreDispute({ slug: slugify(jobRole(role)), reason: text, country, modelVersion: ROLE_MODEL_VERSION })
      : Promise.reject(new Error('Supabase not configured'))
    const toNetlify = fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeForm({ 'form-name': 'role-score-feedback', role: jobRole(role), country, reason: text, model_version: ROLE_MODEL_VERSION, created_at: new Date().toISOString() }),
    }).then((response) => { if (!response.ok) throw new Error(`Netlify form failed (${response.status})`) })
    try {
      const results = await Promise.allSettled([toSupabase, toNetlify])
      if (!results.some((result) => result.status === 'fulfilled')) {
        results.forEach((result) => console.warn('[role-feedback]', result.reason?.message || result.reason))
        throw new Error('No feedback destination accepted the submission')
      }
      setStatus('saved')
      setReason('')
      trackEvent('role_score_feedback_submitted', { role: jobRole(role), country })
    } catch { setStatus('error') }
  }
  return (
    <form className="feedback-panel" name="role-score-feedback" method="POST" data-netlify="true" onSubmit={submit}>
      <input type="hidden" name="form-name" value="role-score-feedback" />
      <div><ThumbsDown size={20} /><span><b>Does this score seem wrong?</b><em>Tell us what evidence or experience we should review.</em></span></div>
      <label><span>Your feedback</span><textarea name="reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Example: Tier-1 voice support at my company has fallen sharply since 2025…" /></label>
      <button type="submit" disabled={status === 'saving'}>{status === 'saving' ? 'Sending…' : 'Submit for review'}</button>
      {status === 'saved' && <small role="status">Thanks. Your feedback was recorded for analyst review.</small>}
      {status === 'invalid' && <small role="alert">Add a short explanation before submitting.</small>}
      {status === 'error' && <small role="alert">Feedback could not be saved. Please try again.</small>}
    </form>
  )
}

function RoleExportButton({ role, country }) {
  const exportRole = () => {
    const rows = [
      ['Role', 'Country', 'AI outlook', 'Automation risk', 'Layoff risk', 'Demand index', 'Model version'],
      [jobRole(role), country, role.aiImpact, automationRisk(role), layoffRiskForRole(role, country), demandIndex(role, country), ROLE_MODEL_VERSION],
    ]
    downloadTextFile(`${slugify(jobRole(role))}-${slugify(country)}-outlook.csv`, rows.map((row) => row.map(csvCell).join(',')).join('\n'))
    trackEvent('role_csv_downloaded', { role: jobRole(role), country })
  }
  return <button type="button" className="export-button" onClick={exportRole}><Download size={16} /> Download CSV</button>
}

function LiveVacancyPanel({ role, country }) {
  const [state, setState] = useState({ status: 'loading', rows: [], message: '' })
  useEffect(() => {
    const controller = new AbortController()
    const url = `/api/vacancies?role=${encodeURIComponent(jobRole(role))}&country=${encodeURIComponent(country)}`
    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) return setState({ status: 'unavailable', rows: [], message: payload.message || 'No verified live-vacancy provider is configured.' })
        setState({ status: 'ready', rows: Array.isArray(payload.vacancies) ? payload.vacancies.slice(0, 10) : [], message: '' })
      })
      .catch((error) => { if (error.name !== 'AbortError') setState({ status: 'unavailable', rows: [], message: 'Live vacancies could not be loaded.' }) })
    return () => controller.abort()
  }, [role, country])
  return (
    <section className="vacancy-panel" aria-labelledby="vacancy-panel-title">
      <div className="section-title compact-title">
        <div><span className="eyebrow">Verified openings</span><h2 id="vacancy-panel-title">Live vacancies for {jobRole(role)}</h2></div>
        <BriefcaseBusiness size={20} />
      </div>
      {state.status === 'loading' && <p role="status">Checking configured vacancy sources…</p>}
      {state.status === 'unavailable' && <div className="data-status"><AlertTriangle size={20} /><div><strong>Live vacancy feed not connected</strong><span>{state.message} The 0-100 demand index remains a modelled comparison signal.</span></div></div>}
      {state.status === 'ready' && !state.rows.length && <p>No verified openings currently match this role and country.</p>}
      {state.rows.length > 0 && <div className="vacancy-list">{state.rows.map((item) => <a key={item.id || item.url} href={item.url} target="_blank" rel="noreferrer"><strong>{item.title}</strong><span>{item.employer} · {item.location}</span><em>{item.posted_at ? `Posted ${item.posted_at}` : 'Posting date unavailable'} · {item.source}</em></a>)}</div>}
    </section>
  )
}

function SavedRolesPage() {
  const { savedRoles, save } = useSavedRoles()
  return (
    <main className="content-page saved-page">
      <section className="page-heading"><span className="eyebrow">Saved on this device</span><h1>Your role watchlist</h1><p>Return to roles you are tracking. Saved roles stay in this browser and are not uploaded to an account.</p></section>
      <section className="saved-role-grid">
        {savedRoles.map((item) => {
          const base = occupations.find((row) => jobRole(row) === item.role)
          if (!base) return null
          const scored = scoredOccupation(base, item.country)
          return <article key={`${item.role}-${item.country}`}><div><strong>{item.role}</strong><span>{item.country}</span></div><p>AI outlook {scored.aiImpact}/10 · Layoff risk {layoffRiskLabel(layoffRiskForRole(scored, item.country))} · Demand {demandIndex(scored, item.country)}/100</p><footer><a href={`/jobs/${slugify(item.role)}?country=${encodeURIComponent(item.country)}`}>Open role</a><button type="button" onClick={() => save(scored, item.country)}>Remove</button></footer></article>
        })}
        {!savedRoles.length && <div className="empty-results">No saved roles yet. Open a role page and choose “Save role.”</div>}
      </section>
    </main>
  )
}

function RoleNotFoundPage({ slug }) {
  const query = String(slug || '').replaceAll('-', ' ')
  const suggestions = occupations.map((row) => ({ row, score: roleSearchScore(scoredOccupation(row, 'India'), query) })).sort((a, b) => b.score - a.score).slice(0, 3)
  return (
    <main className="content-page not-found-page">
      <section className="page-heading"><span className="eyebrow">Role not found</span><h1>We could not find “{query}”</h1><p>Choose a close match or search the complete dashboard. The page no longer substitutes an unrelated role.</p></section>
      <div className="saved-role-grid">{suggestions.map(({ row }) => <article key={jobRole(row)}><strong>{jobRole(row)}</strong><p>{row.job_family} · {jobCategory(row)}</p><a href={`/jobs/${slugify(jobRole(row))}?country=India`}>View this role</a></article>)}</div>
      <a className="primary-link" href={`/?country=India&role=${encodeURIComponent(query)}`}>Search all roles</a>
    </main>
  )
}

function InformationPage({ type }) {
  const privacy = type === 'privacy'
  return (
    <main className="content-page information-page">
      <section className="page-heading"><span className="eyebrow">{privacy ? 'Privacy' : 'About'}</span><h1>{privacy ? 'How this dashboard handles data' : 'About the Global AI Job Outlook'}</h1></section>
      {privacy ? <section className="prose-panel"><h2>Saved roles</h2><p>Device-only saves are stored in your browser. Signed-in watchlists are protected by account-level access controls.</p><h2>Forms and analytics</h2><p>Score feedback and anonymous usage events may be submitted for product improvement. Weekly email alerts are not currently offered. Do not submit sensitive personal or employer-confidential information.</p><h2>Career decisions</h2><p>Scores are directional analytical signals, not employment, salary, legal, or financial guarantees.</p></section> : <section className="prose-panel"><h2>Purpose</h2><p>The dashboard helps students, jobseekers, counsellors, employers, and workforce planners compare how technology, location, demand, and task exposure may affect careers.</p><h2>Evidence standard</h2><p>Measured fields, reported layoff events, and modelled scores are labelled separately. Model rules are dated, versioned, and audited across every role.</p><h2>Contact and corrections</h2><p>Use the feedback form on any role page to submit evidence for analyst review.</p></section>}
    </main>
  )
}

function CompareCareers({ country, initialRole }) {
  const compareParams = new URLSearchParams(window.location.search)
  const currentRoleName = jobRole(initialRole)
  const comparisonOptions = similarComparisonRoles(initialRole, country).slice(0, 12).map(jobRole)
  const requestedRight = compareParams.get('compare_right')
  const [right, setRight] = useState(requestedRight && comparisonOptions.includes(requestedRight) ? requestedRight : comparisonOptions[0])
  const [copied, setCopied] = useState(false)
  const roleForName = (name) => scoredOccupation(
    occupations.find((row) => jobRole(row) === name) ?? occupations.find((row) => roleSearchScore(row, name.toLowerCase()) > 0) ?? occupations[0],
    country,
  )
  const leftRole = roleForName(currentRoleName)
  const rightRole = roleForName(right)
  const leftRisk = automationRisk(leftRole)
  const rightRisk = automationRisk(rightRole)
  const rows = [
    ['AI growth potential', `${leftRole.aiImpact}/10 (${aiLabel(leftRole.aiImpact)})`, `${rightRole.aiImpact}/10 (${aiLabel(rightRole.aiImpact)})`],
    ['Automation / disruption risk', `${leftRisk}/10 (${riskLabel(leftRisk)})`, `${rightRisk}/10 (${riskLabel(rightRisk)})`],
    ['Remote work', `${leftRole.remote}/10`, `${rightRole.remote}/10`],
    ['Hiring demand', hiringDemand(leftRole, country), hiringDemand(rightRole, country)],
    ['Salary band', salaryBand(leftRole, country), salaryBand(rightRole, country)],
  ]

  useEffect(() => {
    setRight(comparisonOptions[0])
    // `currentRoleName` and country fully define the ranked comparison set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoleName, country])
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const url = new URL(window.location.href)
      url.searchParams.set('compare_left', currentRoleName)
      url.searchParams.set('compare_right', right)
      window.history.replaceState(null, '', `${url.pathname}${url.search}`)
    }, 150)
    return () => window.clearTimeout(timer)
  }, [currentRoleName, right])
  const copyComparison = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
      trackEvent('comparison_link_copied', { left: currentRoleName, right, country })
    } catch { setCopied(false) }
  }

  return (
    <section className="compare-panel" id="compare-careers">
      <div className="section-title compact-title">
        <div><span className="eyebrow">Compare 2 careers</span><h2>Compare roles side by side</h2></div>
        <BarChart3 size={20} />
      </div>
      <div className="compare-controls">
        <div className="compare-role-lock"><span>Current role</span><strong>{currentRoleName}</strong><em>Selected from your search</em></div>
        <SelectFilter label="Closest comparison role" value={right} options={comparisonOptions} onChange={(value) => { setRight(value); trackEvent('career_compare_changed', { side: 'right', value, country }) }} />
      </div>
      <button type="button" className="copy-comparison" onClick={copyComparison}><Share2 size={15} /> {copied ? 'Link copied' : 'Copy comparison link'}</button>
      <div className="compare-table">
        {rows.map(([label, a, b]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{a}</strong>
            <strong>{b}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

function SourceBadges() {
  return (
    <section className="source-badges" aria-label="Data credibility">
      <span><ShieldCheck size={15} /> Layoffs.fyi</span>
      <span><BriefcaseBusiness size={15} /> NCS demand benchmark</span>
      <span><Sparkles size={15} /> Role model {ROLE_MODEL_VERSION}</span>
      <span><Calendar size={15} /> Scoring updated: {ROLE_MODEL_UPDATED_AT}</span>
      <span><Calendar size={15} /> Layoffs through: {DATA_THROUGH}</span>
      <span><Calendar size={15} /> Last refreshed: {LAST_REFRESHED}</span>
    </section>
  )
}

function SocialProof() {
  return (
    <section className="social-proof" aria-label="Who this dashboard is for">
      <span><BriefcaseBusiness size={18} /><b>Built for jobseekers</b><em>Check your current role risk.</em></span>
      <span><Target size={18} /><b>Useful for product managers</b><em>Compare AI-safe moves.</em></span>
      <span><GraduationCap size={18} /><b>Helpful for students</b><em>Choose future-ready skills.</em></span>
      <span><ShieldCheck size={18} /><b>Transparent scoring</b><em>Methodology and sources visible.</em></span>
    </section>
  )
}

function OutlookSignal({ tone, icon: Icon, label, value, note }) {
  return (
    <article className={`outlook-signal ${tone}`}>
      <div>
        <span><Icon size={24} /></span>
        <div>
          <small>{label}</small>
          <strong>{value}</strong>
        </div>
      </div>
      <p>{note}</p>
      <i aria-hidden="true" />
    </article>
  )
}

function HeroLanding({ query, onQueryChange, role, country }) {
  const advice = role ? transitionAdvice(role) : null
  const automation = role ? automationRisk(role) : 0
  const layoffRisk = role ? layoffRiskForRole(role, country) : 0
  const leaderboards = useMemo(() => {
    const scored = occupations.map((row) => scoredOccupation(row, country))
    return {
      exposed: [...scored].sort((a, b) => b.automation - a.automation || a.aiImpact - b.aiImpact).slice(0, 5),
      upside: [...scored].sort((a, b) => b.aiImpact - a.aiImpact || a.automation - b.automation).slice(0, 5),
    }
  }, [country])

  return (
    <section className="hero-dashboard simplified-hero">
      <div className="hero-copy simplified-copy">
        <span className="eyebrow">Career outlook</span>
        <h1>Know where your career is heading.</h1>
        <p>Enter your current role for a clear view of AI opportunity, automation exposure, and layoff pressure.</p>
        <label className="hero-search">
          <Search size={20} />
          <input aria-label="Search job role" list="home-role-options" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Enter your role" />
          <datalist id="home-role-options">{occupations.map((row) => <option key={jobRole(row)} value={jobRole(row)} />)}</datalist>
        </label>
        <small>Signals for {country} · Model {ROLE_MODEL_VERSION} · Updated {ROLE_MODEL_UPDATED_AT}</small>
      </div>

      <section className={`outlook-board compact-outlook ${role ? '' : 'empty'}`}>
        <header>
          <div>
            <span>{role ? 'Your role' : 'Career outlook'}</span>
            <strong>{role ? jobRole(role) : 'Start with your role'}</strong>
          </div>
          <div className="detected-country" aria-label={`Approximate location: ${country}`}>
            <Globe2 size={18} />
            <span><small>Approximate location</small><strong>{country}</strong></span>
          </div>
        </header>
        {role ? <>
          <div className="compact-signal-grid">
            <article><span>AI opportunity</span><strong>{role.aiImpact}/10</strong><em>{aiLabel(role.aiImpact)}</em></article>
            <article><span>Automation risk</span><strong>{riskLabel(automation)}</strong><em>{automation}/10 exposure</em></article>
            <article><span>Layoff risk</span><strong>{layoffRiskLabel(layoffRisk)}</strong><em>{layoffRisk}/10 pressure</em></article>
          </div>
          <article className={`compact-recommendation ${advice.decision}`}>
            <div><ShieldCheck size={20} /><span><small>Recommended action</small><strong>{recommendedAction(advice, role)}</strong></span></div>
            <p>{advice.message}</p>
            {advice.nextRoles.length > 0 && <div className="compact-paths">{advice.nextRoles.slice(0, 2).map((move) => <a key={move} href={`/jobs/${slugify(move)}?country=${encodeURIComponent(country)}`}>{move}<ExternalLink size={13} /></a>)}</div>}
          </article>
          <footer className="compact-actions">
            <a href={`/jobs/${slugify(jobRole(role))}?country=${encodeURIComponent(country)}`}>View full role report</a>
            <button type="button" onClick={() => downloadScoreCard(role, country)}><Download size={15} /> Image</button>
          </footer>
        </> : <div className="empty-outlook role-leaderboards">
          <p>Search above, or tap a role below to see its AI opportunity, automation risk and layoff pressure.</p>
          <div className="leaderboard-grid">
            <article className="leaderboard risk">
              <h3><AlertTriangle size={16} /> Most exposed to automation</h3>
              <ol>{leaderboards.exposed.map((row) => (
                <li key={jobRole(row)}><button type="button" onClick={() => onQueryChange(jobRole(row))}><span>{jobRole(row)}</span><b>{row.automation}/10</b></button></li>
              ))}</ol>
            </article>
            <article className="leaderboard growth">
              <h3><TrendingUp size={16} /> Biggest AI upside</h3>
              <ol>{leaderboards.upside.map((row) => (
                <li key={jobRole(row)}><button type="button" onClick={() => onQueryChange(jobRole(row))}><span>{jobRole(row)}</span><b>{row.aiImpact}/10</b></button></li>
              ))}</ol>
            </article>
          </div>
          <small>Scores for {country}. Automation risk and AI opportunity are modelled, directional signals.</small>
        </div>}
      </section>
    </section>
  )
}

function InsightCards({ rows, country }) {
  const bestResilient = [...rows].sort((a, b) => b.aiImpact - a.aiImpact)[0]
  const metroPick = [...rows].filter((row) => row.metro_score >= 8).sort((a, b) => b.growth - a.growth)[0]
  const nonMetroPick = [...rows].filter((row) => row.metro_score <= 6).sort((a, b) => b.growth - a.growth)[0]
  const lowRiskHighJobs = [...rows].sort((a, b) => {
    const aValue = demandIndex(a, country) - (automationRisk(a) * 4)
    const bValue = demandIndex(b, country) - (automationRisk(b) * 4)
    return bValue - aValue
  })[0]
  const cards = [
    { title: country === 'India' ? 'Highest AI opportunity in India' : `Highest AI opportunity in ${country}`, value: bestResilient ? jobRole(bestResilient) : 'No match', note: bestResilient ? `${bestResilient.aiImpact}/10 AI growth potential; safety shown separately` : 'Adjust filters' },
    { title: country === 'India' ? 'Top metro city-role signal' : 'Top metro role signal', value: metroPick ? jobRole(metroPick) : 'No match', note: metroPick ? `${hubsFor(country, METRO)[0]} and major hubs` : 'Adjust filters' },
    { title: country === 'India' ? 'Fastest-growing non-metro markets' : 'Regional growth signal', value: nonMetroPick ? jobRole(nonMetroPick) : 'No match', note: nonMetroPick ? hubsFor(country, NON_METRO).slice(0, 3).join(', ') : 'Adjust filters' },
    { title: 'Higher demand + lower AI risk', value: lowRiskHighJobs ? jobRole(lowRiskHighJobs) : 'No match', note: lowRiskHighJobs ? `${demandIndex(lowRiskHighJobs, country)}/100 demand / ${riskLabel(automationRisk(lowRiskHighJobs))} risk` : 'Adjust filters' },
  ]

  return (
    <section className="insight-strip" aria-label="Market insight cards">
      {cards.map((card) => (
        <article key={card.title}>
          <span>{card.title}</span>
          <strong>{card.value}</strong>
          <em>{card.note}</em>
        </article>
      ))}
    </section>
  )
}

function JobsDashboard({ initialRoleSlug = '', initialCountry = '' }) {
  const initialRole = initialRoleSlug ? findRoleBySlug(initialRoleSlug) : null
  const params = new URLSearchParams(window.location.search)
  const hasExplicitCountry = params.has('country')
  const urlRole = params.get('role') || ''
  const urlCountry = params.get('country') || initialCountry
  const startingCountry = countryRows.some((row) => row.country === urlCountry) ? urlCountry : 'India'
  const [continent, setContinent] = useState(continentForCountry(startingCountry))
  const [country, setCountry] = useState(startingCountry)
  const [query, setQuery] = useState(initialRole ? jobRole(initialRole) : urlRole)
  const [category, setCategory] = useState(uniqueFrom(occupations, jobCategory).includes(params.get('category')) ? params.get('category') : ALL)
  const [family, setFamily] = useState(uniqueFrom(occupations, (row) => row.job_family).includes(params.get('family')) ? params.get('family') : ALL)
  const [locationMode, setLocationMode] = useState([ALL, METRO, NON_METRO].includes(params.get('location')) ? params.get('location') : ALL)
  const [city, setCity] = useState(params.get('city') || ALL)

  const countryOptions = useMemo(() => countriesFor(continent), [continent])
  const familyOptions = useMemo(() => roleFamilyOptions(category), [category])
  const selectedCountry = country === ALL ? 'United States' : country
  const cityOptions = locationMode === ALL ? [ALL] : [ALL, ...hubsFor(selectedCountry, locationMode)]

  useEffect(() => {
    if (!countryOptions.includes(country)) setCountry(countryOptions.includes('India') ? 'India' : ALL)
  }, [countryOptions, country])
  useEffect(() => {
    if (!familyOptions.includes(family)) setFamily(ALL)
  }, [familyOptions, family])
  useEffect(() => {
    if (!cityOptions.includes(city)) setCity(ALL)
  }, [cityOptions, city])
  useEffect(() => {
    if (hasExplicitCountry) return undefined
    const controller = new AbortController()
    fetch('/api/geo', { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        const detected = String(payload?.data?.country?.name || '')
        const match = countryRows.find((row) => normalizeSearch(row.country) === normalizeSearch(detected))
        if (!match) return
        setCountry(match.country)
        setContinent(match.continent)
        trackEvent('country_auto_detected', { country: match.country })
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') trackEvent('country_detection_unavailable', {})
      })
    return () => controller.abort()
  }, [hasExplicitCountry])
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (query.trim()) trackEvent('role_search', { role: query.trim(), country: selectedCountry })
      if (window.location.pathname === '/') {
        const url = new URL(window.location.href)
        if (query.trim()) url.searchParams.set('role', query.trim())
        else url.searchParams.delete('role')
        url.searchParams.set('country', selectedCountry)
        if (category !== ALL) url.searchParams.set('category', category)
        else url.searchParams.delete('category')
        if (family !== ALL) url.searchParams.set('family', family)
        else url.searchParams.delete('family')
        if (locationMode !== ALL) url.searchParams.set('location', locationMode)
        else url.searchParams.delete('location')
        if (city !== ALL) url.searchParams.set('city', city)
        else url.searchParams.delete('city')
        window.history.replaceState(null, '', `${url.pathname}${url.search}`)
      }
    }, 650)
    return () => window.clearTimeout(timer)
  }, [query, selectedCountry, category, family, locationMode, city])
  useEffect(() => {
    trackEvent('country_selected', { country: selectedCountry })
  }, [selectedCountry])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return occupations
      .filter((row) => {
        const text = `${jobRole(row)} ${jobCategory(row)} ${row.job_family}`.toLowerCase()
        return (!needle || text.includes(needle))
          && (category === ALL || jobCategory(row) === category)
          && (family === ALL || row.job_family === family)
          && roleAvailable(row, selectedCountry, locationMode, city)
      })
      .map((row) => scoredOccupation(row, selectedCountry))
  }, [query, category, family, selectedCountry, locationMode, city])

  const average = (field) => filtered.length ? (filtered.reduce((sum, row) => sum + row[field], 0) / filtered.length).toFixed(1) : '0.0'
  const averageDemand = filtered.length ? Math.round(filtered.reduce((sum, row) => sum + demandIndex(row, selectedCountry), 0) / filtered.length) : 0
  const context = countryContext(selectedCountry)
  const checkedRole = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return null
    const scored = occupations.map((row) => scoredOccupation(row, selectedCountry))
    return scored.sort((a, b) => roleSearchScore(b, needle) - roleSearchScore(a, needle))[0]
  }, [query, selectedCountry])
  const checkedAdvice = checkedRole ? transitionAdvice(checkedRole, selectedCountry) : null
  const showTransitionPlan = checkedAdvice?.decision === 'transition_recommended'

  const exportFilteredRoles = () => {
    const header = ['Role', 'Category', 'Family', 'Country', 'AI impact (0-10)', 'Automation risk (0-10)', 'Layoff risk (0-10)', 'Hiring demand (0-100)', 'Metro score', 'Remote score', 'Model version']
    const rows = filtered.map((row) => [
      jobRole(row), jobCategory(row), row.job_family, selectedCountry, row.aiImpact,
      automationRisk(row), layoffRiskForRole(row, selectedCountry), demandIndex(row, selectedCountry),
      row.metro_score, row.remote, ROLE_MODEL_VERSION,
    ])
    downloadTextFile(`ai-job-outlook-${slugify(selectedCountry)}.csv`, [header, ...rows].map((values) => values.map(csvCell).join(',')).join('\n'))
    trackEvent('filtered_roles_exported', { country: selectedCountry, role_count: filtered.length })
  }

  return (
    <>
      <HeroLanding
        query={query}
        onQueryChange={setQuery}
        role={checkedRole}
        country={selectedCountry}
      />
      {checkedRole && <section className="home-tools" aria-label="Career tools">
        <details className="home-tool">
          <summary><span><b>Is this career AI-safe?</b><em>Take the two-minute task-based check</em></span><ShieldCheck size={18} /></summary>
          <CareerSafetyQuiz role={{
            ...checkedRole,
            automationRisk: automationRisk(checkedRole),
            layoffRisk: layoffRiskForRole(checkedRole, selectedCountry),
            hiringDemand: demandIndex(checkedRole, selectedCountry),
          }} country={selectedCountry} />
        </details>
        {showTransitionPlan && <details className="home-tool">
          <summary><span><b>Build a transition plan</b><em>Skills, adjacent roles, and a 12-week roadmap</em></span><Target size={18} /></summary>
          <TransitionPlanner currentRole={checkedRole} country={selectedCountry} query={query} onQueryChange={setQuery} />
        </details>}
        <details className="home-tool">
          <summary><span><b>Compare careers</b><em>Salary, skills, and role-to-role signals</em></span><BarChart3 size={18} /></summary>
          <section className="simple-followup">
            <SalarySkillGap role={checkedRole} country={selectedCountry} />
            <CompareCareers country={selectedCountry} initialRole={checkedRole} />
          </section>
        </details>
      </section>}

      <details className="advanced-explorer">
        <summary>
          <span>
            <b>Explore deeper</b>
            <em>{plural(filtered.length, 'role')} · average hiring demand {averageDemand}/100 in {selectedCountry}</em>
          </span>
          <SlidersHorizontal size={18} />
        </summary>
        <SourceBadges />
        <section className="stats-grid">
          <Stat icon={BriefcaseBusiness} label="Visible job roles" value={filtered.length} note={`${occupations.length} global role templates`} />
          <Stat icon={Building2} label="Job categories" value={new Set(filtered.map(jobCategory)).size} />
          <Stat icon={Target} label="Avg AI impact" value={average('aiImpact')} note={context.tier} />
          <Stat icon={MapPin} label="Country" value={selectedCountry} note={context.continent} />
        </section>
        <InsightCards rows={filtered} country={selectedCountry} />
        <main className="jobs-layout">
          <aside className="filter-panel">
            <div className="filter-heading"><SlidersHorizontal size={18} /> Filters</div>
            <SelectFilter label="Continent" value={continent} options={[ALL, ...continentNames]} onChange={(value) => { setContinent(value); setCountry(ALL) }} />
            <SelectFilter label="Country" value={country} options={countryOptions} onChange={setCountry} />
            <label className="search-box">
              <Search size={17} />
              <input aria-label="Search job roles" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search role: PM, nurse, tester..." />
            </label>
            <SelectFilter label="Job category" value={category} options={uniqueFrom(occupations, jobCategory)} onChange={setCategory} />
            <SelectFilter label="Role family" value={family} options={familyOptions} onChange={setFamily} />
            <SegmentedFilter label="Location market" value={locationMode} options={[ALL, METRO, NON_METRO]} onChange={(value) => { setLocationMode(value); setCity(ALL) }} />
            {locationMode !== ALL && <SelectFilter label={locationMode === METRO ? 'Major hub' : 'Regional hub'} value={city} options={cityOptions} onChange={setCity} />}
            <button type="button" className="reset-button" onClick={() => { setContinent('Asia'); setCountry('India'); setQuery(''); setCategory(ALL); setFamily(ALL); setLocationMode(ALL); setCity(ALL) }}>Reset filters</button>
          </aside>

          <section className="main-panel">
            <section className="roles-section">
              <div className="section-title">
                <div>
                  <span className="eyebrow">Global AI impact</span>
                  <h2>{plural(filtered.length, 'role')} · average hiring demand {averageDemand}/100</h2>
                </div>
                <button type="button" className="secondary-action" onClick={exportFilteredRoles} disabled={!filtered.length}><Download size={16} /> Export CSV</button>
              </div>
              <div className="growth-legend">
                <span><i className="growth-high" /> Green: AI growth potential</span>
                <span><i className="growth-medium" /> Yellow: moderate AI opportunity</span>
                <span><i className="growth-low" /> Red: low AI opportunity</span>
              </div>
              <p className="map-note">Colour shows AI-enabled growth opportunity, not job safety. A low AI score can still be a resilient career; check the separate automation and layoff-risk signals.</p>
              <RoleMap rows={filtered} country={selectedCountry} />
            </section>
          </section>
        </main>
      </details>
    </>
  )
}

function LayoffTimeline({ rows }) {
  const byYear = useMemo(() => {
    const map = new Map()
    rows.forEach((row) => {
      if (!map.has(row.year)) map.set(row.year, { year: row.year, count: 0, incidents: 0 })
      const current = map.get(row.year)
      current.count += row.affected_count
      current.incidents += 1
    })
    return Array.from(map.values()).sort((a, b) => a.year - b.year)
  }, [rows])
  const maxCount = Math.max(...byYear.map((row) => row.count), 1)
  return (
    <section className="layoff-card">
      <div className="section-title">
        <div><span className="eyebrow">Timeline</span><h2>Reported layoffs by year</h2></div>
        <Calendar size={20} />
      </div>
      <div className="layoff-timeline">
        {byYear.map((row) => (
          <div className="timeline-row" key={row.year}>
            <strong>{row.year}</strong>
            <i><b style={{ width: `${Math.max(4, (row.count / maxCount) * 100)}%` }} /></i>
            <span>{formatNumber(row.count)} roles / {row.incidents} records</span>
          </div>
        ))}
        {!byYear.length && <div className="empty-results">No layoff records match those filters.</div>}
      </div>
    </section>
  )
}

function groupedTotals(rows, getter) {
  const map = new Map()
  rows.forEach((row) => {
    const key = getter(row) || 'Unknown'
    if (!map.has(key)) map.set(key, { key, count: 0, records: 0 })
    const current = map.get(key)
    current.count += row.affected_count
    current.records += 1
  })
  return Array.from(map.values()).sort((a, b) => b.count - a.count || b.records - a.records)
}

function MiniBars({ title, rows, countLabel = 'roles' }) {
  const max = Math.max(...rows.map((row) => row.count), 1)
  return (
    <article className="insight-card">
      <h3>{title}</h3>
      <div className="mini-bars">
        {rows.map((row) => (
          <div className="mini-bar" key={row.key}>
            <span>{row.key}</span>
            <i><b style={{ width: `${Math.max(6, (row.count / max) * 100)}%` }} /></i>
            <em>{formatNumber(row.count)} {countLabel}</em>
          </div>
        ))}
      </div>
    </article>
  )
}

function LayoffIntelligence({ rows }) {
  const byCompany = groupedTotals(rows, (row) => row.company)
  const repeatedCompanies = byCompany.filter((row) => row.records > 1).slice(0, 5)
  const bySector = groupedTotals(rows, (row) => row.sector).slice(0, 5)
  const byCountry = groupedTotals(rows, (row) => row.country).slice(0, 5)
  const byRole = groupedTotals(rows, (row) => row.role_family).slice(0, 5)
  const byMonth = groupedTotals(rows, (row) => `${monthNames[row.month - 1]} ${row.year}`).slice(0, 5)
  const latestYear = Math.max(...rows.map((row) => row.year), 2026)
  const thisYearRoles = groupedTotals(rows.filter((row) => row.year === latestYear), (row) => row.role_family).slice(0, 3)
  const saferSectors = Array.from(new Map(
    occupations.map((row) => [jobCategory(row), scoredOccupation(row, 'India')])
  ).values()).sort((a, b) => b.aiImpact - a.aiImpact).slice(0, 3)

  return (
    <section className="layoff-card">
      <div className="section-title">
        <div><span className="eyebrow">Layoff intelligence</span><h2>Where job cuts concentrate</h2></div>
        <Target size={20} />
      </div>
      <div className="insight-grid">
        <MiniBars title="Sectors most impacted" rows={bySector} />
        <MiniBars title="Countries most impacted" rows={byCountry} />
        <MiniBars title="Roles/functions affected" rows={byRole} />
        <MiniBars title="Peak months" rows={byMonth} />
      </div>
      <div className="layoff-emotion-grid">
        <article>
          <span>Most affected roles this year</span>
          <strong>{thisYearRoles.map((row) => row.key).join(' / ') || 'No records'}</strong>
          <em>{latestYear} filtered records</em>
        </article>
        <article>
          <span>Safer sectors despite AI</span>
          <strong>{saferSectors.map((row) => jobCategory(row)).join(' / ')}</strong>
          <em>High AI-growth scores in role templates</em>
        </article>
        <article>
          <span>Layoff heatmap by country</span>
          <strong>{byCountry.slice(0, 3).map((row) => row.key).join(' / ') || 'No match'}</strong>
          <em>Highest reported affected count</em>
        </article>
      </div>
      <div className="repeated-companies">
        <h3>Repeated layoff companies</h3>
        {repeatedCompanies.length ? repeatedCompanies.map((row) => (
          <span key={row.key}><b>{row.key}</b>{row.records} records / {formatNumber(row.count)} roles</span>
        )) : <p>No repeated companies in this filtered view.</p>}
      </div>
    </section>
  )
}

function LayoffTable({ rows }) {
  const pageSize = 50
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const start = (safePage - 1) * pageSize
  const visibleRows = rows.slice(start, start + pageSize)

  useEffect(() => setPage(1), [rows])

  return (
    <section className="layoff-card">
      <div className="section-title">
        <div>
          <span className="eyebrow">Global records</span>
          <h2>{rows.length} reported layoff records</h2>
          <p className="table-range" aria-live="polite">
            {rows.length ? `Showing ${start + 1}-${Math.min(start + pageSize, rows.length)}` : 'No matching records'}
          </p>
        </div>
        <AlertTriangle size={20} />
      </div>
      <div className="layoff-table-wrap">
        <table className="layoff-table">
          <thead>
            <tr>
              <th>Month</th><th>Company</th><th>Country</th><th>Sector</th><th>Roles affected</th><th>Reported count</th><th>Reason</th><th>Source</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr key={`${row.company}-${row.country}-${row.year}-${row.month}-${row.source_url}-${start + index}`}>
                <td><strong>{formatMonth(row)}</strong></td>
                <td><b>{row.company}</b><span>{row.company_type}</span></td>
                <td><b>{row.country}</b><span>{row.city}</span></td>
                <td>{row.sector}</td>
                <td><b>{row.role_family}</b><span>{row.roles_affected}</span></td>
                <td><strong>{reportedAffectedCount(row)}</strong><span>{row.affected_count_note ?? 'Reported estimate'}</span></td>
                <td>{row.reason}</td>
                <td>{row.source_url ? <a href={row.source_url} target="_blank" rel="noreferrer">{row.source_name}</a> : row.source_name}<span>{row.confidence} confidence</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > pageSize && (
        <nav className="table-pagination" aria-label="Layoff records pages">
          <button type="button" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
          <span>Page {safePage} of {pageCount}</span>
          <button type="button" disabled={safePage === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</button>
        </nav>
      )}
    </section>
  )
}

function eventDate(row) {
  return row.layoffsfyi_date || `${row.year}-${String(row.month).padStart(2, '0')}-01`
}

function formatEventDate(row) {
  if (!row.layoffsfyi_date) return formatMonth(row)
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${row.layoffsfyi_date}T00:00:00Z`))
}

function LatestLayoffs({ rows, onSearch }) {
  const latest = useMemo(() => [...rows].sort((a, b) => eventDate(b).localeCompare(eventDate(a))).slice(0, 8), [rows])
  const months = useMemo(() => {
    const newest = rows.reduce((max, row) => (eventDate(row) > max ? eventDate(row) : max), '')
    if (!newest) return []
    const [year, month] = newest.split('-').map(Number)
    const buckets = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(Date.UTC(year, month - 1 - (11 - index), 1))
      return { key: `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`, label: monthNames[date.getUTCMonth()], year: date.getUTCFullYear(), count: 0, events: 0 }
    })
    const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]))
    rows.forEach((row) => {
      const bucket = byKey.get(`${row.year}-${row.month}`)
      if (bucket) { bucket.count += row.affected_count; bucket.events += 1 }
    })
    return buckets
  }, [rows])
  const max = Math.max(...months.map((row) => row.count), 1)
  const total12 = months.reduce((sum, row) => sum + row.count, 0)
  const events12 = months.reduce((sum, row) => sum + row.events, 0)

  return (
    <section className="latest-layoffs" aria-label="Latest layoffs and monthly trend">
      <article className="latest-card">
        <header>
          <div><span className="eyebrow">Latest</span><h2>Most recent layoffs</h2></div>
          <span className="data-through"><Calendar size={14} /> Data through {DATA_THROUGH}</span>
        </header>
        {latest.length ? <ul className="latest-list">
          {latest.map((row, index) => (
            <li key={`${row.company}-${eventDate(row)}-${index}`}>
              <time>{formatEventDate(row)}</time>
              <button type="button" className="latest-company" onClick={() => onSearch(row.company)} title={`Show all ${row.company} records`}>
                <b>{row.company}</b>
                <span>{row.country} · {row.sector}</span>
              </button>
              <strong className={row.affected_count >= 1000 ? 'big' : ''}>{row.affected_count ? formatNumber(row.affected_count) : '—'}<small>{row.affected_count ? 'jobs' : 'not reported'}</small></strong>
              {row.source_url ? <a href={row.source_url} target="_blank" rel="noreferrer" aria-label={`Source for ${row.company}`}><ExternalLink size={15} /></a> : <span />}
            </li>
          ))}
        </ul> : <div className="empty-results">No layoff records match those filters.</div>}
      </article>
      <article className="trend-card">
        <header>
          <div><span className="eyebrow">Trend</span><h2>Last 12 months</h2></div>
          <span className="trend-total"><b>{formatNumber(total12)}</b> jobs · {plural(events12, 'event')}</span>
        </header>
        <div className="month-chart" role="img" aria-label={`Reported layoffs per month over the last 12 months, ${formatNumber(total12)} jobs in total`}>
          {months.map((row) => (
            <div className="month-col" key={row.key} title={`${row.label} ${row.year}: ${formatNumber(row.count)} jobs across ${plural(row.events, 'event')}`}>
              <span className="month-value">{row.count >= 1000 ? `${Math.round(row.count / 1000)}k` : row.count || ''}</span>
              <i><b style={{ height: `${Math.max(row.count ? 4 : 0, (row.count / max) * 100)}%` }} /></i>
              <span className="month-label">{row.label}</span>
            </div>
          ))}
        </div>
        <p className="trend-note">Reported headcount only; events without a published number count as events but add no jobs. The latest month is partial.</p>
      </article>
    </section>
  )
}

function LayoffDashboard() {
  const [loadedLayoffs, setLoadedLayoffs] = useState(null)
  const [loadError, setLoadError] = useState('')
  const layoffRows = loadedLayoffs || []
  const params = new URLSearchParams(window.location.search)
  const [continent, setContinent] = useState([ALL, ...continentNames].includes(params.get('layoff_continent')) ? params.get('layoff_continent') : ALL)
  const [country, setCountry] = useState([ALL, ...countryRows.map((row) => row.country)].includes(params.get('layoff_country')) ? params.get('layoff_country') : ALL)
  const [query, setQuery] = useState(params.get('layoff_q') || '')
  const [sector, setSector] = useState(params.get('layoff_sector') || ALL)
  const [year, setYear] = useState(params.get('layoff_year') || ALL)
  const countryOptions = useMemo(() => countriesFor(continent), [continent])
  const sectorOptions = useMemo(() => uniqueFrom(layoffRows, (row) => row.sector), [layoffRows])
  const yearOptions = useMemo(() => [ALL, ...Array.from(new Set(layoffRows.map((row) => String(row.year)))).sort((a, b) => b - a)], [layoffRows])

  useEffect(() => {
    const controller = new AbortController()
    fetch('/data/global_layoffs.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Data request failed (${response.status})`)
        return response.json()
      })
      .then((rows) => setLoadedLayoffs(mergeLayoffRows(rows)))
      .catch((error) => {
        if (error.name !== 'AbortError') setLoadError(error.message || 'The layoff dataset could not be loaded.')
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!countryOptions.includes(country)) setCountry(ALL)
  }, [countryOptions, country])
  useEffect(() => {
    if (loadedLayoffs && !sectorOptions.includes(sector)) setSector(ALL)
    if (loadedLayoffs && !yearOptions.includes(year)) setYear(ALL)
  }, [loadedLayoffs, sector, sectorOptions, year, yearOptions])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (window.location.pathname !== '/') return
      const url = new URL(window.location.href)
      url.searchParams.set('view', LAYOFFS_TAB)
      const setOptional = (key, value) => value === ALL || !value ? url.searchParams.delete(key) : url.searchParams.set(key, value)
      setOptional('layoff_continent', continent)
      setOptional('layoff_country', country)
      setOptional('layoff_q', query.trim())
      setOptional('layoff_sector', sector)
      setOptional('layoff_year', year)
      window.history.replaceState(null, '', `${url.pathname}${url.search}`)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [continent, country, query, sector, year])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return layoffRows.filter((row) => {
      const text = `${row.company} ${row.country} ${row.city} ${row.sector} ${row.roles_affected} ${row.reason}`.toLowerCase()
      return (!needle || text.includes(needle))
        && (continent === ALL || row.continent === continent)
        && (country === ALL || row.country === country)
        && (sector === ALL || row.sector === sector)
        && (year === ALL || String(row.year) === year)
    })
  }, [layoffRows, continent, country, query, sector, year])

  if (loadError) {
    return <section className="data-status error" role="alert"><AlertTriangle size={24} /><div><strong>Layoff data unavailable</strong><span>{loadError}. Refresh the page to try again.</span></div></section>
  }
  if (!loadedLayoffs) {
    return <section className="data-status" aria-live="polite"><BarChart3 size={24} /><div><strong>Loading the latest layoff records…</strong><span>Career outlook data remains available while the detailed event file loads.</span></div></section>
  }

  const totalAffected = filtered.reduce((sum, row) => sum + row.affected_count, 0)
  const sourceLinked = filtered.filter((row) => row.source_url).length
  const countriesCovered = new Set(filtered.map((row) => row.country)).size
  const byCompany = groupedTotals(filtered, (row) => row.company)
  const repeatedCompanies = byCompany.filter((row) => row.records > 1)
  const bySector = groupedTotals(filtered, (row) => row.sector)
  const byCountry = groupedTotals(filtered, (row) => row.country)
  const byRole = groupedTotals(filtered, (row) => row.role_family)
  const topCompany = byCompany[0]
  const topSector = bySector[0]
  const topCountry = byCountry[0]
  const topRole = byRole[0]

  return (
    <>
      <section className="hero-dashboard layoff-landing">
        <div className="hero-copy">
          <span className="eyebrow">Global layoff intelligence</span>
          <h1>Where Are Jobs Being Cut?</h1>
          <p>Track reported layoffs by company, country, sector, month, and affected role family.</p>
          <label className="hero-search">
            <Search size={20} />
            <input aria-label="Search layoff records" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, country, sector, role..." />
          </label>
          <div className="hero-key">
            <span><AlertTriangle size={22} /><b>Impact</b><em>Reported affected roles</em></span>
            <span><Building2 size={22} /><b>Company</b><em>Repeated layoff signals</em></span>
            <span><Globe2 size={22} /><b>Country</b><em>Regional concentration</em></span>
          </div>
        </div>

        <section className="outlook-board layoff-board">
          <header>
            <div>
              <span>Filtered View</span>
              <strong>{country === ALL ? 'Global layoffs' : `${country} layoffs`}</strong>
            </div>
            <label>
              <Globe2 size={18} />
              <select aria-label="Country" value={country} onChange={(event) => setCountry(event.target.value)}>
                {countryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </header>

          <div className="outlook-signals">
            <OutlookSignal
              tone="exposed"
              icon={AlertTriangle}
              label="Reported affected"
              value={formatNumber(totalAffected)}
              note={`${filtered.length} selected records; unknown counts are not added to total.`}
            />
            <OutlookSignal
              tone="transition"
              icon={Building2}
              label="Top company signal"
              value={topCompany?.key ?? 'No match'}
              note={topCompany ? `${topCompany.records} records / ${formatNumber(topCompany.count)} roles affected.` : 'Adjust filters to see company concentration.'}
            />
            <OutlookSignal
              tone="growth"
              icon={Globe2}
              label="Top country signal"
              value={topCountry?.key ?? 'No match'}
              note={topCountry ? `${formatNumber(topCountry.count)} reported affected roles.` : 'Adjust filters to see regional concentration.'}
            />
          </div>

          <div className="outlook-lower">
            <MiniBars title="Sectors most impacted" rows={bySector.slice(0, 5)} />
            <MiniBars title="Roles/functions affected" rows={byRole.slice(0, 5)} />
          </div>

          <footer>
            <ShieldCheck size={20} />
            <span>Primary data: Layoffs.fyi public tech-layoff records plus non-duplicate India supplemental rows.</span>
            <strong>{sourceLinked}/{filtered.length} source-linked</strong>
          </footer>
        </section>
      </section>

      <LatestLayoffs rows={filtered} onSearch={setQuery} />

      <SourceBadges />

      <details className="advanced-explorer layoff-explorer">
        <summary>
          <span>
            <b>Explore layoff records</b>
            <em>{formatNumber(countriesCovered)} {countriesCovered === 1 ? 'country' : 'countries'} · {plural(filtered.length, 'record')} · top role: {topRole?.key ?? 'No match'}</em>
          </span>
          <SlidersHorizontal size={18} />
        </summary>
        <main className="layoff-layout">
          <aside className="filter-panel layoff-filter">
            <div className="filter-heading"><SlidersHorizontal size={18} /> Layoff filters</div>
            <SelectFilter label="Continent" value={continent} options={[ALL, ...continentNames]} onChange={(value) => { setContinent(value); setCountry(ALL) }} />
            <SelectFilter label="Country" value={country} options={countryOptions} onChange={setCountry} />
            <label className="search-box">
              <Search size={17} />
              <input aria-label="Search layoff records" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, country, role..." />
            </label>
            <SelectFilter label="Sector" value={sector} options={sectorOptions} onChange={setSector} />
            <SelectFilter label="Year" value={year} options={yearOptions} onChange={setYear} />
            <button type="button" className="reset-button" onClick={() => { setContinent(ALL); setCountry(ALL); setQuery(''); setSector(ALL); setYear(ALL) }}>Reset filters</button>
          </aside>
          <section className="layoff-main">
            <section className="layoff-note">
              <strong>Global layoff caveat:</strong> Layoff records are reported events, not a complete count of all workforce reductions. Unknown headcounts are counted as records, but not added to the affected-count total.
            </section>
            <LayoffIntelligence rows={filtered} />
            <LayoffTimeline rows={filtered} />
            <LayoffTable rows={filtered} />
          </section>
        </main>
      </details>
    </>
  )
}

function MethodologyPage() {
  return (
    <main className="content-page methodology-page">
      <section className="hero-dashboard methodology-landing">
        <div className="hero-copy">
          <span className="eyebrow">Public methodology</span>
          <h1>How Reliable Is This Score?</h1>
          <p>Every role score is directional: useful for comparison, not an exact forecast or salary promise.</p>
          <div className="hero-key">
            <span><Sparkles size={22} /><b>Modelled</b><em>Analyst-reviewed score rules</em></span>
            <span><ShieldCheck size={22} /><b>Sourced</b><em>Visible source badges</em></span>
            <span><Calendar size={22} /><b>Dated</b><em>Last refreshed {LAST_REFRESHED}</em></span>
          </div>
        </div>

        <section className="outlook-board methodology-board">
          <header>
            <div>
              <span>Score Recipe</span>
              <strong>AI impact combines opportunity, exposure, and context.</strong>
            </div>
          </header>
          <div className="outlook-signals">
            <OutlookSignal
              tone="growth"
              icon={TrendingUp}
              label="AI growth potential"
              value="0-10"
              note="Growth outlook + remote feasibility + tech adoption, minus automation-risk penalty."
            />
            <OutlookSignal
              tone="transition"
              icon={Sparkles}
              label="Automation risk"
              value="0-10"
              note="Higher for repeatable tasks: manual testing, basic support, back-office processing, and junior boilerplate work."
            />
            <OutlookSignal
              tone="exposed"
              icon={AlertTriangle}
              label="Layoff signal"
              value="Reported"
              note="Uses reported layoff concentration; it is not a complete workforce loss estimate."
            />
          </div>

          <div className="outlook-lower">
            <article className="region-card">
              <h3>AI growth formula</h3>
              <div className="region-bars">
                <span><b>Growth outlook</b><i><em style={{ width: '55%', background: '#16a34a' }} /></i></span>
                <span><b>Remote feasibility</b><i><em style={{ width: '15%', background: '#f2b400' }} /></i></span>
                <span><b>Tech adoption</b><i><em style={{ width: '15%', background: '#16a34a' }} /></i></span>
                <span><b>Automation penalty</b><i><em style={{ width: '45%', background: '#ef4444' }} /></i></span>
              </div>
            </article>
            <article className="moves-card methodology-notes">
              <h3>Read this before using</h3>
              <p>Online postings are demand signals, not total workforce counts.</p>
              <p>Salary bands are indicative annual ranges.</p>
              <p>Country scores use maturity modifiers until measured national datasets are added.</p>
            </article>
          </div>

          <footer>
            <BookOpen size={20} />
            <span>Best use: compare roles, find safer transitions, and decide what skills to build next.</span>
          </footer>
        </section>
      </section>

      <section className="methodology-grid">
        <article><h3>Data sources</h3><p>Curated occupation templates, public job-posting patterns, Layoffs.fyi records, India supplemental rows, public company/news signals, and analyst scoring rules.</p><strong>Last refreshed: {LAST_REFRESHED}.</strong></article>
        <article><h3>Hiring demand index</h3><p>A 0-100 relative signal built from growth outlook, role-family market depth, skill breadth, and a bounded country adjustment. It is not a live vacancy or total-employment count.</p><strong>Use it to compare roles, not count openings.</strong></article>
        <article><h3>Credibility controls</h3><p>The dashboard keeps score components visible, adds source badges, and separates reported layoffs from modelled career outlook signals.</p><strong>Every score should be read as directional.</strong></article>
      </section>
      <SourceBadges />
    </main>
  )
}

function RoleLandingPage({ slug, country, locationLabel = '' }) {
  const baseRole = findRoleBySlug(slug)
  const scored = scoredOccupation(baseRole, country)
  const risk = automationRisk(scored)
  const layoffRisk = layoffRiskForRole(scored, country)
  const advice = transitionAdvice(scored)
  const answer = advice.decision === 'stay_and_upgrade'
    ? `${jobRole(scored)} does not currently need a forced career switch. AI opportunity may be limited, but automation exposure and career safety are separate signals; focus on upgrading within the role.`
    : advice.decision === 'insufficient_evidence'
      ? `We do not have enough evidence to recommend a responsible destination role for ${jobRole(scored)}. The dashboard will not guess.`
      : advice.decision === 'monitor'
        ? `${jobRole(scored)} does not require an immediate switch. Strengthen the role now and keep adjacent paths open if market conditions worsen.`
        : `${jobRole(scored)} has elevated disruption pressure. Consider an adjacent transition only after validating skills, salary, and local demand.`

  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${window.location.pathname.replace(/\/$/, '')}`
    document.title = locationLabel ? `${jobRole(scored)} career outlook in ${locationLabel}` : `Will AI replace ${jobRole(scored)}?`
    document.querySelector('meta[name="description"]')?.setAttribute('content', `${jobRole(scored)} AI risk score, salary band, automation risk, skill gaps, and safer career moves in ${locationLabel || country}.`)
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl)
    const structuredData = locationLabel ? [
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'India jobs dashboard', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: jobRole(scored), item: `${SITE_URL}/jobs/${slug}` },
        { '@type': 'ListItem', position: 3, name: locationLabel, item: canonicalUrl },
      ] },
      { '@context': 'https://schema.org', '@type': 'Occupation', name: jobRole(scored), occupationLocation: { '@type': 'Place', name: `${locationLabel}, India` }, url: canonicalUrl },
    ] : { '@context': 'https://schema.org', '@type': 'WebPage', name: document.title, url: canonicalUrl, about: { '@type': 'Occupation', name: jobRole(scored) } }
    const structuredNode = document.querySelector('script[type="application/ld+json"]')
    if (structuredNode) structuredNode.textContent = JSON.stringify(structuredData)
    trackEvent('role_landing_viewed', { role: jobRole(scored), country, location: locationLabel })
  }, [country, slug, locationLabel])

  return (
    <main className="content-page">
      <section className="role-landing">
        <div>
          <span className="eyebrow">{locationLabel ? `${locationLabel} career outlook` : 'Role landing page'}</span>
          <h1>{locationLabel ? `${jobRole(scored)} career outlook in ${locationLabel}` : `Will AI replace ${jobRole(scored)}?`}</h1>
          <p>{answer}</p>
        </div>
        <div className="role-score-card" style={{ '--result-color': aiColor(scored.aiImpact) }}>
          <strong>{scored.aiImpact}/10</strong>
          <span>{aiLabel(scored.aiImpact)}</span>
          <em>Automation risk: {riskLabel(risk)}</em>
          <em>Layoff risk: {layoffRiskLabel(layoffRisk)} ({layoffRisk}/10)</em>
          <button type="button" onClick={() => downloadScoreCard(scored, country)}><Download size={15} /> Download score card</button>
          <SavedRoleButton role={scored} country={country} />
          <RoleExportButton role={scored} country={country} />
          <button type="button" onClick={() => window.print()}><BookOpen size={15} /> Print report</button>
        </div>
      </section>
      <section className="role-answer-grid">
        <article><span>{locationLabel ? 'Location' : 'Country'}</span><strong>{locationLabel || country}</strong><em>{countryContext(country).tier} AI market · location demand is modelled</em></article>
        <article><span>Salary band</span><strong>{salaryBand(scored, country)}</strong><em>{country === 'India' ? 'Indicative annual range' : 'Verified local source required'}</em></article>
        <article><span>Hiring demand</span><strong>{hiringDemand(scored, country)}</strong><em>Demand index {demandIndex(scored, country)}/100; not live vacancies</em></article>
        <article><span>Layoff risk</span><strong>{layoffRiskLabel(layoffRisk)}</strong><em>{modelRationale(scored, country, layoffRoleSignals)}</em></article>
        <article><span>Career-path guidance</span><strong>{recommendedAction(advice, scored)}</strong><em>{advice.time} · {advice.confidence} confidence</em></article>
        <article><span>Education pathway</span><strong>{scored.india_skill_level === 'ENTRY_LEVEL' ? 'Foundation / diploma' : scored.india_skill_level === 'SENIOR_SPECIALIST' ? 'Specialist credential' : 'Degree + portfolio'}</strong><em>Validate against employer requirements</em></article>
        <article><span>Location outlook</span><strong>{hubsFor(country, scored.metro_score >= 7 ? METRO : NON_METRO).slice(0, 2).join(' / ')}</strong><em>{scored.metro_score >= 7 ? 'Metro-weighted' : 'More geographically distributed'}</em></article>
      </section>
      <ScoreExplanation role={scored} country={country} />
      <SkillSimulator role={scored} />
      <LiveVacancyPanel role={scored} country={country} />
      <SalarySkillGap role={scored} country={country} />
      <CompareCareers country={country} initialRole={scored} />
      <RoleFeedback role={scored} country={country} />
      <SourceBadges />
    </main>
  )
}

export default function App() {
  const initialView = new URLSearchParams(window.location.search).get('view')
  const [activeTab, setActiveTab] = useState(initialView === LAYOFFS_TAB ? LAYOFFS_TAB : JOBS_TAB)
  const [path, setPath] = useState(normalizePathname(window.location.pathname))
  const routeCountry = new URLSearchParams(window.location.search).get('country') || 'India'
  const safeRouteCountry = countryRows.some((row) => row.country === routeCountry) ? routeCountry : 'India'
  const roleMatch = path.match(/^\/jobs\/([^/]+)/)
  const roleLocationMatch = path.match(/^\/jobs\/[^/]+\/in\/([^/]+)$/)
  const roleLocationLabel = roleLocationMatch ? INDIA_SEO_LOCATIONS[roleLocationMatch[1]] || '' : ''
  const matchedRole = roleMatch ? findRoleBySlug(roleMatch[1]) : null

  useEffect(() => {
    const onPopState = () => {
      setPath(normalizePathname(window.location.pathname))
      setActiveTab(new URLSearchParams(window.location.search).get('view') === LAYOFFS_TAB ? LAYOFFS_TAB : JOBS_TAB)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  useEffect(() => {
    trackEvent('page_view', { path, tab: activeTab })
    if (!path.startsWith('/jobs/')) {
      const canonicalPath = path === '/' ? '' : path
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${SITE_URL}${canonicalPath}`)
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', `${SITE_URL}${canonicalPath}`)
    }
    if (path === '/') {
      if (activeTab === LAYOFFS_TAB) {
        document.title = 'Global Layoff Tracker'
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Track reported layoffs by company, country, sector, month, and affected role family.')
      } else {
        document.title = 'Will AI Grow or Threaten Your Job?'
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Check whether AI is likely to grow or threaten your job, compare career moves, countries, cities, and global layoff signals.')
      }
    }
    if (path === '/methodology') {
      document.title = 'AI Job Risk Dashboard Methodology'
      document.querySelector('meta[name="description"]')?.setAttribute('content', 'How the AI growth, automation risk, salary, hiring demand, and layoff signals are calculated.')
    }
    if (path === '/saved') document.title = 'Saved Job Roles | Global AI Job Outlook'
    if (path === '/workspace') document.title = 'Career Workspace | Global AI Job Outlook'
    if (path === '/about') document.title = 'About | Global AI Job Outlook'
    if (path === '/privacy') document.title = 'Privacy | Global AI Job Outlook'
  }, [path, activeTab])
  useEffect(() => {
    const startedAt = Date.now()
    const reportExit = () => trackEvent('dropoff_point', { path: window.location.pathname, tab: activeTab, seconds: Math.round((Date.now() - startedAt) / 1000) })
    window.addEventListener('beforeunload', reportExit)
    return () => window.removeEventListener('beforeunload', reportExit)
  }, [activeTab])

  const changeTab = (tab) => {
    setActiveTab(tab)
    trackEvent(tab === LAYOFFS_TAB ? 'layoff_tab_opened' : 'jobs_tab_opened')
    const url = new URL(window.location.href)
    url.pathname = '/'
    if (tab === LAYOFFS_TAB) url.searchParams.set('view', LAYOFFS_TAB)
    else {
      url.searchParams.delete('view')
      for (const key of ['layoff_continent', 'layoff_country', 'layoff_q', 'layoff_sector', 'layoff_year']) url.searchParams.delete(key)
    }
    window.history.pushState(null, '', `${url.pathname}${url.search}`)
    if (path !== '/') setPath('/')
  }

  const navigateHome = () => {
    const url = new URL(window.location.href)
    url.pathname = '/'
    url.searchParams.delete('view')
    for (const key of ['layoff_continent', 'layoff_country', 'layoff_q', 'layoff_sector', 'layoff_year']) url.searchParams.delete(key)
    window.history.pushState(null, '', `${url.pathname}${url.search}`)
    setPath('/')
    setActiveTab(JOBS_TAB)
  }

  return (
    <div className="jobs-shell">
      <header className="site-topbar">
        <button type="button" onClick={navigateHome}>Global AI Job Outlook</button>
        <nav>
            <a href="/" onClick={(event) => { event.preventDefault(); navigateHome() }}>Dashboard</a>
            <a href="/methodology" onClick={(event) => { event.preventDefault(); window.history.pushState(null, '', '/methodology'); setPath('/methodology') }}>Methodology</a>
            <a href="/workspace" onClick={(event) => { event.preventDefault(); window.history.pushState(null, '', '/workspace'); setPath('/workspace') }}>My workspace</a>
            <AccountMenu />
          </nav>
      </header>
      {path === '/methodology' ? <MethodologyPage /> : path === '/saved' ? <SavedRolesPage /> : path === '/workspace' ? <CareerWorkspace /> : path === '/about' ? <InformationPage type="about" /> : path === '/privacy' ? <InformationPage type="privacy" /> : roleMatch ? matchedRole ? <RoleLandingPage slug={roleMatch[1]} country={safeRouteCountry} locationLabel={roleLocationLabel} /> : <RoleNotFoundPage slug={roleMatch[1]} /> : (
        <>
          <ViewTabs activeTab={activeTab} onChange={changeTab} />
          {activeTab === LAYOFFS_TAB ? <LayoffDashboard /> : <JobsDashboard initialCountry={safeRouteCountry} />}
        </>
      )}
      <footer className="site-footer"><span>Directional career intelligence · Model {ROLE_MODEL_VERSION}</span><nav aria-label="Footer"><a href="/about">About</a><a href="/privacy">Privacy</a><a href="/methodology">Methodology</a></nav></footer>
    </div>
  )
}
