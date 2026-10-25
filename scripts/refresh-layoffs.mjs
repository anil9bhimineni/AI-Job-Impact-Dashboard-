import fs from 'node:fs/promises'
import path from 'node:path'

const EMBED_URL = 'https://airtable.com/embed/app1PaujS9zxVGUZ4/shroKsHx3SdYYOzeh?backgroundColor=green&viewControls=on'

async function fetchText(url, options = {}) {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`)
  return response.text()
}

function decodeScriptString(value) {
  return JSON.parse(`"${value.replaceAll('"', '\\"')}"`)
}

async function readSharedView() {
  const html = await fetchText(EMBED_URL)
  const urlMatch = html.match(/urlWithParams:\s*"((?:\\.|[^"\\])+)"/)
  const headersMatch = html.match(/var headers = (\{[^;]+\});/)
  if (!urlMatch || !headersMatch) throw new Error('Airtable shared-view bootstrap metadata was not found.')

  const headers = JSON.parse(headersMatch[1])
  delete headers['x-airtable-accept-msgpack']
  headers['x-time-zone'] = 'UTC'
  const apiUrl = new URL(decodeScriptString(urlMatch[1]), EMBED_URL)
  const response = await fetch(apiUrl, { headers })
  if (!response.ok) {
    const body = (await response.text()).slice(0, 500)
    throw new Error(`${response.status} ${response.statusText} for ${apiUrl}: ${body}`)
  }
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('json')) {
    const preview = (await response.text()).slice(0, 180)
    throw new Error(`Expected JSON from Airtable, received ${contentType}: ${preview}`)
  }
  return response.json()
}

function slugify(value) {
  return String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function choiceName(column, value) {
  const choices = column?.typeOptions?.choices || {}
  const getName = (id) => choices[id]?.name || id || ''
  return Array.isArray(value) ? value.map(getName) : getName(value)
}

function sectorFor(industry) {
  const value = String(industry || '').toLowerCase()
  const rules = [
    ['aerospace', 'Aerospace'], ['ai', 'AI'], ['analytics', 'Data / Analytics'],
    ['data', 'Data / Analytics'], ['construction', 'Construction'], ['consumer', 'Consumer Internet'],
    ['crypto', 'Crypto / Web3'], ['education', 'EdTech'], ['energy', 'Energy Tech'],
    ['finance', 'Fintech / Financial Services'], ['fintech', 'Fintech / Financial Services'],
    ['fitness', 'Health / Fitness Tech'], ['food', 'Food Delivery / Restaurants'],
    ['hardware', 'Hardware / Devices'], ['healthcare', 'Healthcare Technology'],
    ['hr', 'HR Tech / Recruiting'], ['infrastructure', 'Cloud / Infrastructure'],
    ['legal', 'Legal'], ['logistics', 'Logistics / Supply Chain'], ['manufacturing', 'Manufacturing'],
    ['marketing', 'Marketing / AdTech'], ['media', 'Media / Entertainment'],
    ['product', 'Product / Software'], ['recruit', 'HR Tech / Recruiting'],
    ['retail', 'Retail & E-commerce'], ['sales', 'Sales Tech'], ['security', 'Cybersecurity'],
    ['support', 'Customer Support Tech'], ['transport', 'Mobility / Transportation'],
    ['travel', 'Travel Tech'],
  ]
  return rules.find(([needle]) => value.includes(needle))?.[1] || 'Technology / Other'
}

function roleFamilyFor(sector) {
  if (['AI', 'Data / Analytics'].includes(sector)) return 'Data & AI'
  if (['Cloud / Infrastructure', 'Cybersecurity', 'Product / Software'].includes(sector)) return 'Software & Cloud'
  if (['Hardware / Devices', 'Manufacturing', 'Aerospace'].includes(sector)) return 'Engineering & Manufacturing'
  if (['Fintech / Financial Services', 'Crypto / Web3'].includes(sector)) return 'Fintech & Finance'
  if (sector === 'Healthcare Technology') return 'Healthcare Operations'
  if (['Food Delivery / Restaurants', 'Logistics / Supply Chain', 'Mobility / Transportation', 'Retail & E-commerce'].includes(sector)) return 'Operations & Support'
  if (['Sales Tech', 'Marketing / AdTech'].includes(sector)) return 'Sales & Operations'
  return 'Mixed Corporate'
}

function companyTypeFor(stage) {
  const value = String(stage || '').toLowerCase()
  if (value.includes('post-ipo')) return 'Public tech company'
  if (value.includes('acquired')) return 'Acquired tech company'
  return 'Tech / Startup'
}

function normalizeCountry(value) {
  const aliases = {
    USA: 'United States', 'United States of America': 'United States', UAE: 'United Arab Emirates',
    'Czech Republic': 'Czechia', 'Ivory Coast': "Cote d'Ivoire",
  }
  return aliases[value] || value || 'Unknown'
}

async function normalizeSharedView(data) {
  const table = data.data?.table
  if (!table?.columns || !table?.rows) throw new Error('Airtable response did not contain the expected table rows.')
  const columnsById = new Map(table.columns.map((column) => [column.id, column]))
  const columnsByName = new Map(table.columns.map((column) => [column.name, column]))
  const valueFor = (row, name) => {
    const column = columnsByName.get(name)
    const value = row.cellValuesByColumnId?.[column?.id]
    return choiceName(columnsById.get(column?.id), value)
  }

  const countriesByContinent = JSON.parse(await fs.readFile('data/global_countries.json', 'utf8'))
  const continentByCountry = new Map(Object.entries(countriesByContinent).flatMap(([continent, countries]) => countries.map((country) => [country, continent])))
  const previousRows = JSON.parse(await fs.readFile('data/global_layoffs.json', 'utf8'))
  const previousBySource = new Map(previousRows.filter((row) => row.source_url).map((row) => [row.source_url, row]))
  const previousByEvent = new Map(previousRows.map((row) => [`${slugify(row.company)}|${row.layoffsfyi_date}`, row]))
  const quarantine = []

  const rawRows = table.rows.map((row) => Object.fromEntries(table.columns.map((column) => [column.name, choiceName(column, row.cellValuesByColumnId?.[column.id])]).filter(([, value]) => value !== '' && value !== undefined)))
  const normalized = table.rows.flatMap((row) => {
    const company = String(valueFor(row, 'Company') || '').trim()
    const dateValue = valueFor(row, 'Date')
    const date = dateValue ? new Date(dateValue) : null
    const sourceUrl = String(valueFor(row, 'Source') || '').trim()
    const country = normalizeCountry(valueFor(row, 'Country'))
    if (!company || !date || Number.isNaN(date.valueOf())) {
      quarantine.push({ row_id: row.id, reason: !company ? 'missing_company' : 'invalid_date' })
      return []
    }
    if (!continentByCountry.has(country)) {
      quarantine.push({ row_id: row.id, company, country, reason: 'unknown_country' })
      return []
    }

    const eventDate = date.toISOString().slice(0, 10)
    const previous = previousBySource.get(sourceUrl) || previousByEvent.get(`${slugify(company)}|${eventDate}`)
    const industry = String(valueFor(row, 'Industry') || 'Other')
    const sector = previous?.sector || sectorFor(industry)
    const laidOff = Number(valueFor(row, '# Laid Off'))
    const affectedCount = Number.isFinite(laidOff) && laidOff > 0 ? Math.round(laidOff) : 0
    const percentage = Number(valueFor(row, '%'))
    const percentageLabel = Number.isFinite(percentage) && percentage > 0 ? `${Math.round(percentage * 100)}% workforce cut` : ''
    const aiLabel = String(valueFor(row, 'AI') || '').toLowerCase()
    const location = valueFor(row, 'Location HQ')
    const locations = Array.isArray(location) ? location : [location].filter(Boolean)
    const stage = valueFor(row, 'Stage')

    return [{
      ...previous,
      company,
      company_type: previous?.company_type || companyTypeFor(stage),
      sector,
      continent: continentByCountry.get(country),
      country,
      city: locations.join(', ') || previous?.city || 'Not specified',
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      affected_count: affectedCount,
      affected_count_note: affectedCount
        ? `Layoffs.fyi reported headcount${percentageLabel ? ` and ${percentageLabel}` : ''}`
        : percentageLabel ? `Headcount not reported; ${percentageLabel}` : 'Headcount not reported',
      roles_affected: previous?.roles_affected || 'Roles not specified in Layoffs.fyi event record',
      role_family: previous?.role_family || roleFamilyFor(sector),
      reason: previous?.reason || (aiLabel === 'yes'
        ? 'AI-related workforce reduction reported by Layoffs.fyi source coverage'
        : 'Publicly reported tech-company workforce reduction; specific business rationale varies by source article'),
      source_name: 'Layoffs.fyi source article',
      source_url: sourceUrl,
      confidence: sourceUrl ? 'HIGH' : 'MEDIUM',
      dataset_source: 'Layoffs.fyi',
      layoffsfyi_slug: slugify(company),
      layoffsfyi_date: eventDate,
    }]
  }).sort((a, b) => b.layoffsfyi_date.localeCompare(a.layoffsfyi_date) || a.company.localeCompare(b.company))

  return { normalized, rawRows, quarantine }
}

// Offline mode: `--from-raw <file>` rebuilds from a saved extract (array of rows keyed by
// column name), e.g. one captured in a browser when airtable.com is not reachable from this machine.
async function readRawExtract(file) {
  const rows = JSON.parse(await fs.readFile(file, 'utf8'))
  const list = Array.isArray(rows) ? rows : rows.rows
  const names = [...new Set(list.flatMap((row) => Object.keys(row)))]
  return {
    data: {
      table: {
        columns: names.map((name) => ({ id: name, name })),
        rows: list.map((row, index) => ({ id: `raw_${index}`, cellValuesByColumnId: row })),
      },
    },
  }
}

const rawFlag = process.argv.indexOf('--from-raw')
const data = rawFlag > -1 ? await readRawExtract(process.argv[rawFlag + 1]) : await readSharedView()
if (process.argv.includes('--inspect')) {
  const payload = data.data || {}
  const summarize = (value) => Array.isArray(value)
    ? { type: 'array', length: value.length, sample: value.slice(0, 2) }
    : value && typeof value === 'object'
      ? { type: 'object', keys: Object.keys(value), sample: Object.fromEntries(Object.entries(value).slice(0, 2)) }
      : { type: typeof value, value }
  console.log(JSON.stringify({
    keys: Object.keys(payload),
    tableKeys: Object.keys(payload.table || {}),
    columns: payload.table?.columns?.map(({ id, name, type }) => ({ id, name, type })),
    rowOrderCount: payload.table?.views?.[0]?.rowOrder?.length,
    rows: summarize(payload.table?.rows),
  }, null, 2).slice(0, 20000))
} else {
  const { normalized, rawRows, quarantine } = await normalizeSharedView(data)
  const retrievedAt = new Date().toISOString()
  const sourceYearTotals = Object.fromEntries([...new Set(normalized.map((row) => row.year))].sort().map((year) => {
    const rows = normalized.filter((row) => row.year === year)
    return [year, {
      employees: rows.reduce((sum, row) => sum + row.affected_count, 0),
      companies: new Set(rows.map((row) => row.company)).size,
      events: rows.length,
    }]
  }))
  const summary = {
    source: 'Layoffs.fyi public Airtable shared view',
    retrieved_at: retrievedAt,
    latest_event_date: normalized[0]?.layoffsfyi_date || null,
    years: Object.keys(sourceYearTotals).map(Number),
    source_year_totals: sourceYearTotals,
    rows: normalized.length,
    rows_with_known_headcount: normalized.filter((row) => row.affected_count > 0).length,
    sum_known_headcount: normalized.reduce((sum, row) => sum + row.affected_count, 0),
    countries: new Set(normalized.map((row) => row.country)).size,
    quarantined_rows: quarantine.length,
  }
  await fs.mkdir(path.join('data', 'raw'), { recursive: true })
  await fs.mkdir(path.join('public', 'data'), { recursive: true })
  const roleSignalMap = new Map()
  for (const { country, role_family, roles_affected, affected_count } of normalized) {
    const key = `${country}|${role_family}|${roles_affected}`
    const current = roleSignalMap.get(key) || { country, role_family, roles_affected, affected_count: 0 }
    current.affected_count += affected_count
    roleSignalMap.set(key, current)
  }
  const roleSignals = [...roleSignalMap.values()]
  await Promise.all([
    fs.writeFile('data/global_layoffs.json', `${JSON.stringify(normalized, null, 2)}\n`),
    fs.writeFile('public/data/global_layoffs.json', `${JSON.stringify(normalized)}\n`),
    fs.writeFile('data/layoff_role_signals.json', `${JSON.stringify(roleSignals.map(({ country, role_family, roles_affected, affected_count }) => [country, role_family, roles_affected, affected_count]))}\n`),
    fs.writeFile('data/layoffs_source_summary.json', `${JSON.stringify(summary, null, 2)}\n`),
    fs.writeFile('data/raw/layoffsfyi_public_view.json', `${JSON.stringify({ retrieved_at: retrievedAt, rows: rawRows })}\n`),
    fs.writeFile('data/raw/layoffsfyi_quarantine.json', `${JSON.stringify(quarantine, null, 2)}\n`),
  ])
  console.log(`Refreshed ${normalized.length} Layoffs.fyi events through ${summary.latest_event_date}; ${quarantine.length} rows quarantined.`)
}
