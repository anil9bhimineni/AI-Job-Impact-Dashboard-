export type LearningResource = {
  id: string
  title: string
  provider: string
  url: string
  affiliateUrl?: string
  sponsored: boolean
  level: string
  duration: string
  price: string
  topics: string[]
}

type ResourceDefinition = Omit<LearningResource, 'affiliateUrl' | 'sponsored'> & { affiliateEnv: string }

const resources: ResourceDefinition[] = [
  {
    id: 'skill-india-digital',
    title: 'Skill India Digital free online courses',
    provider: 'Skill India Digital Hub',
    url: 'https://www.skillindiadigital.gov.in/free-online-courses/',
    affiliateEnv: 'VITE_AFFILIATE_SKILL_INDIA_URL',
    level: 'Beginner to advanced', duration: 'Self-paced', price: 'Free options',
    topics: ['india', 'ai', 'data', 'operations', 'customer', 'technical'],
  },
  {
    id: 'swayam-ai',
    title: 'SWAYAM artificial-intelligence courses',
    provider: 'SWAYAM — Ministry of Education',
    url: 'https://swayam.gov.in/search_courses?searchText=artificial+intelligence',
    affiliateEnv: 'VITE_AFFILIATE_SWAYAM_URL',
    level: 'Mixed levels', duration: 'Course dependent', price: 'Free learning; certificate fees may apply',
    topics: ['india', 'ai', 'engineering', 'data', 'management', 'education'],
  },
  {
    id: 'nptel-computer-science',
    title: 'NPTEL computer science and AI courses',
    provider: 'NPTEL',
    url: 'https://www.nptel.ac.in/domains/discipline/106?course=106_0',
    affiliateEnv: 'VITE_AFFILIATE_NPTEL_URL',
    level: 'Intermediate', duration: 'Course dependent', price: 'Free learning; certificate fees may apply',
    topics: ['india', 'ai', 'engineering', 'software', 'data', 'analytics'],
  },
  {
    id: 'microsoft-ai-concepts',
    title: 'AI concepts for technology professionals',
    provider: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/training/paths/ai-concepts/',
    affiliateEnv: 'VITE_AFFILIATE_MICROSOFT_AI_URL',
    level: 'Beginner', duration: 'Self-paced', price: 'Free',
    topics: ['ai', 'engineering', 'software', 'support', 'business analysis', 'product'],
  },
  {
    id: 'microsoft-ai-fluency',
    title: 'AI Fluency learning path',
    provider: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/training/paths/ai-fluency/',
    affiliateEnv: 'VITE_AFFILIATE_MICROSOFT_FLUENCY_URL',
    level: 'Beginner', duration: '7 modules', price: 'Free',
    topics: ['operations', 'customer', 'sales', 'training', 'content', 'administration'],
  },
  {
    id: 'google-data-analytics',
    title: 'Google Data Analytics Certificate',
    provider: 'Grow with Google',
    url: 'https://grow.google/certificates/data-analytics/',
    affiliateEnv: 'VITE_AFFILIATE_GOOGLE_DATA_URL',
    level: 'Beginner', duration: '3–6 months', price: 'Paid certificate',
    topics: ['data', 'analytics', 'business analysis', 'operations', 'finance'],
  },
  {
    id: 'google-project-management',
    title: 'Google Project Management Certificate',
    provider: 'Grow with Google',
    url: 'https://grow.google/certificates/project-management/',
    affiliateEnv: 'VITE_AFFILIATE_GOOGLE_PM_URL',
    level: 'Beginner', duration: '3–6 months', price: 'Paid certificate',
    topics: ['product', 'project', 'management', 'coordinator', 'operations'],
  },
  {
    id: 'aws-skill-builder',
    title: 'AWS Skill Builder',
    provider: 'Amazon Web Services',
    url: 'https://skillbuilder.aws/',
    affiliateEnv: 'VITE_AFFILIATE_AWS_SKILL_BUILDER_URL',
    level: 'Beginner to advanced', duration: 'Self-paced', price: 'Free and paid options',
    topics: ['cloud', 'devops', 'engineering', 'security', 'infrastructure'],
  },
  {
    id: 'microsoft-genaiops',
    title: 'Operationalize generative AI applications',
    provider: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/training/paths/operationalize-gen-ai-apps/',
    affiliateEnv: 'VITE_AFFILIATE_MICROSOFT_GENAIOPS_URL',
    level: 'Intermediate', duration: '6 modules', price: 'Free',
    topics: ['machine learning', 'ai', 'devops', 'data science', 'model evaluation'],
  },
  {
    id: 'microsoft-ai-educators',
    title: 'AI for educators',
    provider: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/training/paths/ai-education/',
    affiliateEnv: 'VITE_AFFILIATE_MICROSOFT_EDUCATION_URL',
    level: 'Beginner', duration: '4 modules', price: 'Free',
    topics: ['education', 'teaching', 'training', 'academic'],
  },
]

function configuredAffiliateUrl(envKey: string) {
  const value = String((import.meta.env || {})[envKey] || '').trim()
  if (!value) return ''
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' ? parsed.toString() : ''
  } catch {
    return ''
  }
}

export function learningResourcesFor(context: string, limit = 3): LearningResource[] {
  const needle = context.toLowerCase()
  return resources
    .map((resource) => ({ resource, score: resource.topics.reduce((total, topic) => total + (needle.includes(topic) ? 2 : 0), 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ resource }) => {
      const affiliateUrl = configuredAffiliateUrl(resource.affiliateEnv)
      const target = new URL(affiliateUrl || resource.url)
      target.searchParams.set('utm_source', 'global-ai-jobs-impact-dashboard')
      target.searchParams.set('utm_medium', affiliateUrl ? 'affiliate' : 'referral')
      target.searchParams.set('utm_campaign', 'career-transition-planner')
      return { ...resource, url: target.toString(), affiliateUrl: affiliateUrl || undefined, sponsored: Boolean(affiliateUrl) }
    })
}
