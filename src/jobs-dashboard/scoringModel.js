export const ROLE_MODEL_VERSION = '2026.10-v1'
export const ROLE_MODEL_UPDATED_AT = '2026-10-14'

const clamp = (value) => Math.max(0, Math.min(10, Math.round(Number(value) || 0)))

const HIGH_ROUTINE_PATTERN = /data entry|cashier|accounts payable|accounts receivable|payroll|bookkeep|voice process|non-voice|customer support|call cent|claims processing|kyc operations|government clerk|office administrator|executive assistant|inventory executive|telemarket/
const MEDIUM_ROUTINE_PATTERN = /analyst|coordinator|content|designer|recruit|travel consultant|quality assurance|software tester|operations executive/

const PHYSICAL_OR_ACCOUNTABLE_FAMILIES = new Set([
  'Clinical Care', 'Public Safety', 'Skilled Trades', 'Field Service', 'Site Engineering',
  'Plant Engineering', 'Safety & Compliance', 'Food Production', 'Housekeeping',
  'Farm Operations', 'Dairy Operations', 'Allied Activities', 'Operations Leadership',
])

const DEMAND_DEPTH_BY_FAMILY = {
  'AI & Machine Learning': 8, Engineering: 8, 'Infrastructure & Cloud': 7, Security: 8,
  'Data & Analytics': 7, Product: 6, 'Quality Assurance': 6, 'Business Analysis': 6,
  'Customer Operations': 8, 'Support & Operations': 7, 'Back Office Operations': 6,
  'Clinical Care': 10, Diagnostics: 8, Pharmacy: 7, Teaching: 9,
  Sales: 9, 'Sales & Relationship Management': 9, 'Store Operations': 8,
  'Delivery Operations': 10, 'Warehouse Operations': 8, 'Logistics Operations': 8,
  'Production Operations': 8, 'Plant Engineering': 7, 'Site Engineering': 8,
  'Skilled Trades': 9, 'Field Service': 8, 'Farm Operations': 8,
}

export function taskRoutineExposure(row) {
  const text = `${row.job_role ?? row.occupation_title ?? ''} ${row.job_family ?? ''}`.toLowerCase()
  if (HIGH_ROUTINE_PATTERN.test(text)) return 9
  if (PHYSICAL_OR_ACCOUNTABLE_FAMILIES.has(row.job_family)) return 2
  if (MEDIUM_ROUTINE_PATTERN.test(text)) return 7
  if (row.india_skill_level === 'SENIOR_SPECIALIST') return 3
  return 5
}

export function reportedLayoffFamily(row) {
  const family = String(row.job_family ?? '').toLowerCase()
  const category = String(row.job_category ?? row.industry_type ?? '').toLowerCase()
  const text = `${family} ${category}`
  if (/customer|support|back office|administr|payroll|operations/.test(text)) return 'Operations & Support'
  if (/risk|underwriting|bank|fintech|finance|account|audit|legal|compliance/.test(text)) return 'Risk & Operations'
  if (/education|teaching|content|creative|design|editorial|media/.test(text)) return 'Education & Content'
  if (/health|clinical|diagnostic|pharma|pharmacy/.test(text)) return 'Healthcare Operations'
  if (/security/.test(text)) return 'Security'
  if (/data|machine learning|artificial intelligence|ai &/.test(text)) return 'Data & AI'
  if (/engineering|software|cloud|product|quality assurance|business analysis/.test(text)) return 'Software & Cloud'
  if (/sales|retail|store|merchand|category management/.test(text)) return 'Sales & Operations'
  if (/manufactur|production|plant|industrial|skilled trade/.test(text)) return 'Engineering & Manufacturing'
  return 'Mixed Corporate'
}

function signalCount(signals, country, family) {
  return signals
    .filter((signal) => signal.country === country && signal.role_family === family)
    .reduce((sum, signal) => sum + (Number(signal.affected_count) || 0), 0)
}

export function reportedLayoffPressure(row, country, signals = []) {
  if (!signals.length) return 5
  const family = reportedLayoffFamily(row)
  const countrySignals = signals.filter((signal) => signal.country === country)
  const countryMaximum = Math.max(0, ...countrySignals.map((signal) => Number(signal.affected_count) || 0))
  const countryCount = signalCount(signals, country, family)
  if (countryCount > 0 && countryMaximum > 0) {
    return clamp((Math.log1p(countryCount) / Math.log1p(countryMaximum)) * 10)
  }

  const globalByFamily = new Map()
  signals.forEach((signal) => {
    globalByFamily.set(signal.role_family, (globalByFamily.get(signal.role_family) || 0) + (Number(signal.affected_count) || 0))
  })
  const globalMaximum = Math.max(0, ...globalByFamily.values())
  const globalCount = globalByFamily.get(family) || 0
  return globalMaximum > 0 ? clamp((Math.log1p(globalCount) / Math.log1p(globalMaximum)) * 7) : 0
}

export function layoffRiskComponents(row, country, signals = []) {
  const automation = clamp(row.automation_risk_score)
  const growthWeakness = clamp(10 - (Number(row.growth_outlook_score ?? row.growth) || 0))
  const seniorityVulnerability = row.india_skill_level === 'ENTRY_LEVEL' ? 8 : row.india_skill_level === 'SENIOR_SPECIALIST' ? 2 : 5
  const routineExposure = taskRoutineExposure(row)
  const reportedPressure = reportedLayoffPressure(row, country, signals)
  return { automation, growthWeakness, seniorityVulnerability, routineExposure, reportedPressure }
}

export function layoffRiskScore(row, country, signals = []) {
  const components = layoffRiskComponents(row, country, signals)
  return clamp(
    (components.automation * 0.5) +
    (components.growthWeakness * 0.18) +
    (components.seniorityVulnerability * 0.12) +
    (components.reportedPressure * 0.15) +
    (components.routineExposure * 0.05),
  )
}

export function layoffRiskLabel(score) {
  if (score <= 3) return 'Low'
  if (score <= 6) return 'Medium'
  return 'High'
}

export function hiringDemandIndex(row, countryContext = {}) {
  const growth = clamp(row.growth_outlook_score ?? row.growth)
  const familyDepth = DEMAND_DEPTH_BY_FAMILY[row.job_family] ?? 6
  const skillBreadth = row.india_skill_level === 'ENTRY_LEVEL' ? 8 : row.india_skill_level === 'SENIOR_SPECIALIST' ? 5 : 7
  const countryAdjustment = Math.max(-1, Math.min(1, (Number(countryContext.growth) || 0) * 0.5))
  return Math.max(10, Math.min(100, Math.round(((growth * 0.5) + (familyDepth * 0.35) + (skillBreadth * 0.15) + countryAdjustment) * 10)))
}

export function hiringDemandLabel(index) {
  if (index >= 80) return 'Strong'
  if (index >= 65) return 'Active'
  if (index >= 50) return 'Selective'
  return 'Limited'
}

export function modelRationale(row, country, signals = []) {
  const components = layoffRiskComponents(row, country, signals)
  return `Risk ${layoffRiskScore(row, country, signals)}/10: automation ${components.automation}, weak-growth ${components.growthWeakness}, routine-task ${components.routineExposure}, seniority ${components.seniorityVulnerability}, reported layoff pressure ${components.reportedPressure}.`
}
