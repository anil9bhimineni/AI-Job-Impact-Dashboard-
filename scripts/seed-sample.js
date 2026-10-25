import fs from 'node:fs'
import path from 'node:path'

const samplePath = path.resolve('data/sample_occupations.jsonl')
const rows = fs.readFileSync(samplePath, 'utf8')
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line))
const layoffsPath = path.resolve('data/india_layoffs.json')
const layoffRows = JSON.parse(fs.readFileSync(layoffsPath, 'utf8'))
const globalLayoffsPath = path.resolve('data/global_layoffs.json')
const globalLayoffRows = JSON.parse(fs.readFileSync(globalLayoffsPath, 'utf8'))
const countriesPath = path.resolve('data/global_countries.json')
const countriesByContinent = JSON.parse(fs.readFileSync(countriesPath, 'utf8'))

const validScores = ['metro_score', 'tech_adoption_score', 'remote_work_score', 'growth_outlook_score']
const required = [
  'occupation_title',
  'job_category',
  'job_role',
  'industry_type',
  'job_family',
  'india_sector',
  'metro_category',
  'india_skill_level',
  'india_education_band',
  'metro_rationale',
  'sector_rationale',
  'scores_rationale',
]

for (const row of rows) {
  for (const field of required) {
    if (!row[field]) throw new Error(`Missing ${field} for ${row.occupation_title ?? 'unknown occupation'}`)
  }
  for (const field of validScores) {
    if (!Number.isInteger(row[field]) || row[field] < 0 || row[field] > 10) {
      throw new Error(`Invalid ${field} for ${row.occupation_title}`)
    }
  }
}

const layoffRequired = [
  'company',
  'company_type',
  'sector',
  'city',
  'state',
  'affected_count_note',
  'roles_affected',
  'role_family',
  'reason',
  'source_name',
  'confidence',
]

for (const row of layoffRows) {
  for (const field of layoffRequired) {
    if (!row[field]) throw new Error(`Missing ${field} for layoff record ${row.company ?? 'unknown company'}`)
  }
  if (!Number.isInteger(row.year) || row.year < 2016 || row.year > 2030) {
    throw new Error(`Invalid year for layoff record ${row.company}`)
  }
  if (!Number.isInteger(row.month) || row.month < 1 || row.month > 12) {
    throw new Error(`Invalid month for layoff record ${row.company}`)
  }
  if (!Number.isInteger(row.affected_count) || row.affected_count < 0) {
    throw new Error(`Invalid affected_count for layoff record ${row.company}`)
  }
  if (row.reported_count_display && typeof row.reported_count_display !== 'string') {
    throw new Error(`Invalid reported_count_display for layoff record ${row.company}`)
  }
}

const countrySet = new Set()
for (const [continent, countries] of Object.entries(countriesByContinent)) {
  if (!Array.isArray(countries) || !countries.length) throw new Error(`No countries listed for ${continent}`)
  for (const country of countries) {
    if (!country || typeof country !== 'string') throw new Error(`Invalid country in ${continent}`)
    countrySet.add(country)
  }
}

const globalLayoffRequired = [
  'company',
  'company_type',
  'sector',
  'continent',
  'country',
  'city',
  'roles_affected',
  'role_family',
  'reason',
  'source_name',
  'confidence',
]

for (const row of globalLayoffRows) {
  for (const field of globalLayoffRequired) {
    if (!row[field]) throw new Error(`Missing ${field} for global layoff record ${row.company ?? 'unknown company'}`)
  }
  if (!countriesByContinent[row.continent]?.includes(row.country)) {
    throw new Error(`Country ${row.country} does not belong to ${row.continent} in global countries`)
  }
  if (!Number.isInteger(row.year) || row.year < 2016 || row.year > 2030) {
    throw new Error(`Invalid year for global layoff record ${row.company}`)
  }
  if (!Number.isInteger(row.month) || row.month < 1 || row.month > 12) {
    throw new Error(`Invalid month for global layoff record ${row.company}`)
  }
  if (!Number.isInteger(row.affected_count) || row.affected_count < 0) {
    throw new Error(`Invalid affected_count for global layoff record ${row.company}`)
  }
}

console.log(`Validated ${rows.length} sample occupation records from ${samplePath}`)
console.log(`Validated ${layoffRows.length} sample layoff records from ${layoffsPath}`)
console.log(`Validated ${countrySet.size} countries from ${countriesPath}`)
console.log(`Validated ${globalLayoffRows.length} global layoff records from ${globalLayoffsPath}`)
