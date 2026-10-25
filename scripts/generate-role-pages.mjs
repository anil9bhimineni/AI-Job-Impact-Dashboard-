import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const siteUrl = 'https://global-ai-jobs-impact-dashboard.netlify.app'
const indexPath = join(process.cwd(), 'dist', 'index.html')
const occupationsPath = join(process.cwd(), 'data', 'sample_occupations.jsonl')
const indexHtml = readFileSync(indexPath, 'utf8')
const occupations = readFileSync(occupationsPath, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
const indiaLocations = [
  ['bengaluru', 'Bengaluru', 'City'], ['hyderabad', 'Hyderabad', 'City'], ['pune', 'Pune', 'City'],
  ['chennai', 'Chennai', 'City'], ['delhi-ncr', 'Delhi NCR', 'AdministrativeArea'], ['mumbai', 'Mumbai', 'City'],
  ['ahmedabad', 'Ahmedabad', 'City'], ['kochi', 'Kochi', 'City'], ['karnataka', 'Karnataka', 'State'],
  ['maharashtra', 'Maharashtra', 'State'], ['telangana', 'Telangana', 'State'], ['tamil-nadu', 'Tamil Nadu', 'State'],
  ['kerala', 'Kerala', 'State'],
]

function slugify(value) {
  return String(value ?? '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function roleTitle(row) {
  return row.job_role ?? row.occupation_title
}

function writeHtml(path, html) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, html)
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function pageHtml({ title, description, url, structuredData }) {
  let html = indexHtml
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${description}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${url}" />`)
  if (structuredData) {
    html = html.replace(/<script type="application\/ld\+json">.*?<\/script>/, `<script type="application/ld+json">${safeJson(structuredData)}</script>`)
  }
  return html
}

const aliasPages = [
  ['software-tester', occupations.find((row) => slugify(roleTitle(row)).includes('software-tester'))],
  ['teacher', occupations.find((row) => slugify(roleTitle(row)) === 'school-teacher')],
  ['business-analyst', occupations.find((row) => slugify(roleTitle(row)) === 'business-analyst-it')],
  ['ai-ml-engineer', occupations.find((row) => slugify(roleTitle(row)) === 'machine-learning-engineer')],
  ['data-scientist', occupations.find((row) => slugify(roleTitle(row)) === 'data-scientist')],
  ['customer-support', occupations.find((row) => slugify(roleTitle(row)) === 'customer-support-executive')],
  ['customer-service', occupations.find((row) => slugify(roleTitle(row)) === 'customer-support-executive')],
  ['support-engineer', occupations.find((row) => slugify(roleTitle(row)) === 'technical-support-engineer')],
].filter(([, row]) => row)

const pagesBySlug = new Map(occupations.map((row) => [slugify(roleTitle(row)), row]))
aliasPages.forEach(([slug, row]) => pagesBySlug.set(slug, row))

Array.from(pagesBySlug.entries()).forEach(([slug, row]) => {
  const role = roleTitle(row)
  const url = `${siteUrl}/jobs/${slug}`
  const title = `Will AI replace ${role}?`
  const description = `${role} AI risk score, salary band, automation risk, skill gaps, and safer career moves.`
  writeHtml(join(process.cwd(), 'dist', 'jobs', slug, 'index.html'), pageHtml({
    title,
    description,
    url,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url,
      about: { '@type': 'Occupation', name: role },
      isPartOf: { '@type': 'WebSite', name: 'Global AI Jobs Impact Dashboard', url: siteUrl },
    },
  }))

  indiaLocations.forEach(([locationSlug, locationName, locationType]) => {
    const locationUrl = `${siteUrl}/jobs/${slug}/in/${locationSlug}`
    const locationTitle = `${role} career outlook in ${locationName}`
    const locationDescription = `${role} AI exposure, layoff pressure, salary band, demand outlook, and skill pathway for ${locationName}, India. Location demand is modelled, not a live vacancy count.`
    writeHtml(join(process.cwd(), 'dist', 'jobs', slug, 'in', locationSlug, 'index.html'), pageHtml({
      title: locationTitle,
      description: locationDescription,
      url: locationUrl,
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'India jobs dashboard', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: role, item: url },
            { '@type': 'ListItem', position: 3, name: locationName, item: locationUrl },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Occupation',
          name: role,
          occupationLocation: { '@type': locationType, name: `${locationName}, India` },
          description: locationDescription,
          url: locationUrl,
        },
      ],
    }))
  })
})

writeHtml(
  join(process.cwd(), 'dist', 'methodology', 'index.html'),
  pageHtml({
    title: 'AI Job Risk Dashboard Methodology',
    description: 'How the AI growth, automation risk, salary, hiring demand, and layoff signals are calculated.',
    url: `${siteUrl}/methodology`,
  }),
)

const informationPages = [
  ['about', 'About the Global AI Jobs Impact Dashboard', 'What the dashboard measures, who it is for, and how to interpret its directional career signals.'],
  ['privacy', 'Privacy — Global AI Jobs Impact Dashboard', 'How saved roles, email updates, feedback, and anonymous usage events are handled.'],
]

informationPages.forEach(([slug, title, description]) => {
  const url = `${siteUrl}/${slug}`
  writeHtml(join(process.cwd(), 'dist', slug, 'index.html'), pageHtml({ title, description, url }))
})

writeHtml(
  join(process.cwd(), 'dist', 'saved', 'index.html'),
  pageHtml({
    title: 'Saved roles — Global AI Jobs Impact Dashboard',
    description: 'Review roles saved privately in this browser.',
    url: `${siteUrl}/saved`,
  }).replace('</head>', '    <meta name="robots" content="noindex,nofollow" />\n  </head>'),
)

writeHtml(
  join(process.cwd(), 'dist', 'workspace', 'index.html'),
  pageHtml({
    title: 'Private career workspace — Global AI Jobs Impact Dashboard',
    description: 'Manage private role watchlists, career alerts, and transition plans.',
    url: `${siteUrl}/workspace`,
  }).replace('</head>', '    <meta name="robots" content="noindex,nofollow" />\n  </head>'),
)

const sitemapUrls = [
  siteUrl,
  `${siteUrl}/methodology`,
  `${siteUrl}/about`,
  `${siteUrl}/privacy`,
  ...Array.from(pagesBySlug.keys()).map((slug) => `${siteUrl}/jobs/${slug}`),
  ...Array.from(pagesBySlug.keys()).flatMap((slug) => indiaLocations.map(([locationSlug]) => `${siteUrl}/jobs/${slug}/in/${locationSlug}`)),
]

writeHtml(
  join(process.cwd(), 'dist', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`,
)

writeHtml(
  join(process.cwd(), 'dist', 'robots.txt'),
  `User-agent: *
Allow: /
Sitemap: ${siteUrl}/sitemap.xml
`,
)
