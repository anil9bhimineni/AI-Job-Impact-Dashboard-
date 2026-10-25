export type CareerPathDecision = 'stay_and_upgrade' | 'monitor' | 'transition_recommended' | 'insufficient_evidence'

export type CareerPathRecommendation = {
  decision: CareerPathDecision
  confidence: 'high' | 'medium' | 'low'
  title: string
  message: string
  nextRoles: string[]
  skills: string[]
  time: string
}

type OccupationLike = {
  job_role?: string
  occupation_title?: string
  job_family?: string
  growth?: number
  growth_outlook_score?: number
}

type ScoreSignals = {
  automationRisk: number
  layoffRisk: number
  growth: number
}

type DecisionSignals = ScoreSignals & {
  targetSignals?: Record<string, ScoreSignals>
}

const STAY_FAMILIES = new Set([
  'Clinical Care', 'Public Safety', 'Skilled Trades', 'Field Service', 'Site Engineering',
  'Plant Engineering', 'Safety & Compliance', 'Food Production', 'Housekeeping',
  'Farm Operations', 'Dairy Operations', 'Allied Activities', 'Public Works',
  'Diagnostics', 'Pharmacy', 'Clinical Research', 'Operations Leadership',
])

const ROLE_TRANSITIONS: Array<{ pattern: RegExp; roles: string[] }> = [
  { pattern: /non-voice process|kyc operations|claims processing/, roles: ['Quality Analyst - BPO', 'Fintech Operations Analyst', 'Business Analyst - IT'] },
  { pattern: /quality analyst - bpo/, roles: ['Customer Experience Manager', 'Training Coordinator', 'Team Leader - BPO'] },
  { pattern: /qa engineer|software tester/, roles: ['SDET / Test Automation Engineer', 'AI QA Engineer / Model Evaluation Tester', 'Business Analyst - IT'] },
  { pattern: /customer support executive|^voice process associate$/, roles: ['Customer Experience Manager', 'Quality Analyst - BPO', 'Training Coordinator'] },
  { pattern: /accounts payable|accounts receivable|payroll executive|gst executive/, roles: ['Accountant', 'Financial Analyst', 'Internal Auditor'] },
  { pattern: /cashier|sales associate - retail/, roles: ['Retail Store Manager', 'Inventory Executive', 'Marketplace Operations Executive'] },
  { pattern: /warehouse associate|quick commerce picker/, roles: ['Warehouse Manager', 'Logistics Coordinator', 'Supply Chain Analyst'] },
  { pattern: /assembly line worker|food processing operator|cnc machine operator/, roles: ['Production Supervisor', 'Quality Control Inspector', 'Maintenance Engineer'] },
  { pattern: /delivery partner|ride-hailing driver/, roles: ['Last-mile Delivery Supervisor', 'Fleet Manager', 'Logistics Coordinator'] },
  { pattern: /freelance content writer|content creator|video editor/, roles: ['Content Marketing Specialist', 'Digital Marketing Specialist', 'Instructional Designer'] },
  { pattern: /technical support engineer/, roles: ['Network Operations Center Engineer', 'DevOps Engineer / Site Reliability Engineer', 'Cloud Solutions Architect'] },
]

const FAMILY_TRANSITIONS: Record<string, string[]> = {
  'Data & Analytics': ['Data Engineer', 'Machine Learning Engineer', 'Business Analyst - IT'],
  Engineering: ['DevOps Engineer / Site Reliability Engineer', 'Cloud Solutions Architect', 'Cybersecurity Analyst'],
  'Infrastructure & Cloud': ['Cloud Solutions Architect', 'Cybersecurity Analyst', 'DevOps Engineer / Site Reliability Engineer'],
  Marketing: ['Performance Marketing Manager', 'Market Research Analyst', 'Content Marketing Specialist'],
  'Marketing Operations': ['Performance Marketing Manager', 'Market Research Analyst', 'Digital Marketing Specialist'],
  Sales: ['Key Account Manager', 'Area Sales Manager', 'Customer Experience Manager'],
  'Sales & Relationship Management': ['Key Account Manager', 'Risk Analyst', 'Customer Experience Manager'],
}

const FAMILY_SKILLS: Record<string, string[]> = {
  'Skilled Trades': ['digital diagnostics', 'digital plan reading', 'safety compliance', 'customer estimation'],
  'Site Engineering': ['BIM coordination', 'digital quantity take-offs', 'project controls', 'site safety documentation'],
  'Public Works': ['GIS basics', 'digital project monitoring', 'contract administration', 'public-works compliance'],
  'Field Service': ['digital diagnostics', 'IoT monitoring', 'service documentation', 'safety compliance'],
  'Plant Engineering': ['predictive maintenance', 'condition monitoring', 'CMMS tools', 'industrial safety'],
  'Clinical Care': ['digital health records', 'clinical decision support', 'patient communication', 'care coordination'],
  Teaching: ['AI-assisted lesson planning', 'assessment design', 'digital pedagogy', 'learner analytics'],
  'Customer Operations': ['customer journey mapping', 'CRM analytics', 'service design', 'AI-assisted support'],
  'Business Analysis': ['process mapping', 'requirements discovery', 'SQL analysis', 'stakeholder management'],
  'Data & Analytics': ['SQL', 'Python', 'data visualization', 'statistics'],
  Engineering: ['API integration', 'cloud fundamentals', 'AI-assisted development', 'system design'],
  'Infrastructure & Cloud': ['cloud architecture', 'infrastructure as code', 'observability', 'cloud security'],
  'Production Operations': ['quality systems', 'production planning', 'machine monitoring', 'industrial safety'],
  'Warehouse Operations': ['warehouse systems', 'inventory analytics', 'process improvement', 'supervisor skills'],
}

function roleName(row: OccupationLike) {
  return String(row.job_role || row.occupation_title || '')
}

function candidateRoles(row: OccupationLike) {
  const name = roleName(row)
  const specific = ROLE_TRANSITIONS.find((entry) => entry.pattern.test(name.toLowerCase()))?.roles
  const candidates = specific || FAMILY_TRANSITIONS[String(row.job_family || '')] || []
  return candidates.filter((candidate) => candidate !== name)
}

function skillsFor(row: OccupationLike) {
  return FAMILY_SKILLS[String(row.job_family || '')] || ['AI tool fluency', 'data literacy', 'workflow improvement', 'domain expertise']
}

export function careerPathRecommendation(row: OccupationLike, signals: DecisionSignals): CareerPathRecommendation {
  const family = String(row.job_family || '')
  const roles = candidateRoles(row).filter((candidate) => {
    const target = signals.targetSignals?.[candidate]
    if (!target) return signals.targetSignals == null
    const improvesAtLeastOneSignal = target.automationRisk < signals.automationRisk
      || target.layoffRisk < signals.layoffRisk
      || target.growth > signals.growth
    return target.automationRisk <= 7 && target.layoffRisk <= 6 && improvesAtLeastOneSignal
  })
  const skills = skillsFor(row)
  const protectedWork = STAY_FAMILIES.has(family)
  const lowDisruption = signals.automationRisk <= 4 && signals.layoffRisk <= 6
  const healthyGrowth = signals.growth >= 6
  const highPressure = signals.automationRisk >= 8 || signals.layoffRisk >= 7 || signals.growth <= 4
  const mediumPressure = signals.automationRisk >= 5 || signals.layoffRisk >= 6 || signals.growth === 5

  if ((protectedWork && lowDisruption && healthyGrowth) || (signals.automationRisk <= 3 && healthyGrowth)) {
    return {
      decision: 'stay_and_upgrade', confidence: 'high',
      title: 'Stay in your role and upgrade',
      message: `The evidence does not support an urgent career switch. ${roleName(row)} has relatively low automation exposure and healthy demand; technology is more likely to assist the work than replace it.`,
      nextRoles: [], skills, time: 'Build alongside your current job',
    }
  }

  if (highPressure && roles.length) {
    return {
      decision: 'transition_recommended', confidence: 'medium',
      title: 'Plan an adjacent transition',
      message: 'This role has elevated disruption pressure. The options below are adjacent paths with more resilient task mixes, not guaranteed outcomes.',
      nextRoles: roles, skills, time: '3–12 months',
    }
  }

  if (highPressure && !roles.length) {
    return {
      decision: 'insufficient_evidence', confidence: 'low',
      title: 'We are not sure which role you should move to',
      message: 'The model sees disruption pressure, but the dataset does not contain a sufficiently close, evidence-backed destination. We will not guess. Validate options with an industry counsellor or employer before changing careers.',
      nextRoles: [], skills, time: 'Research before committing',
    }
  }

  if (mediumPressure && roles.length) {
    return {
      decision: 'monitor', confidence: 'medium',
      title: 'Upgrade now; keep adjacent options open',
      message: 'An immediate switch is not required. Strengthen the current role first and use these adjacent paths only if demand or task exposure worsens.',
      nextRoles: roles, skills, time: 'Review again in 6 months',
    }
  }

  return {
    decision: 'stay_and_upgrade', confidence: protectedWork ? 'high' : 'medium',
    title: 'Stay and strengthen your current role',
    message: 'The current evidence does not justify recommending a different career. Build complementary skills and monitor demand rather than making a forced move.',
    nextRoles: [], skills, time: 'Review again in 6–12 months',
  }
}
