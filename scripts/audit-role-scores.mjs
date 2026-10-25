import fs from 'node:fs'
import {
  ROLE_MODEL_UPDATED_AT,
  ROLE_MODEL_VERSION,
  hiringDemandIndex,
  layoffRiskComponents,
  layoffRiskLabel,
  layoffRiskScore,
  modelRationale,
} from '../src/jobs-dashboard/scoringModel.js'

const rows = fs.readFileSync('data/sample_occupations.jsonl', 'utf8').trim().split('\n').map(JSON.parse)
const signals = JSON.parse(fs.readFileSync('data/layoff_role_signals.json', 'utf8'))
  .map(([country, role_family, roles_affected, affected_count]) => ({ country, role_family, roles_affected, affected_count }))

const failures = []
const auditRows = rows.map((row) => {
  const risk = layoffRiskScore(row, 'India', signals)
  const demand = hiringDemandIndex(row, { growth: 2 })
  const components = layoffRiskComponents(row, 'India', signals)
  if (row.scoring_model_version !== ROLE_MODEL_VERSION) failures.push(`${row.job_role}: missing current model version`)
  if (row.scoring_model_updated_at !== ROLE_MODEL_UPDATED_AT) failures.push(`${row.job_role}: missing current model date`)
  if (risk < 0 || risk > 10) failures.push(`${row.job_role}: risk out of range`)
  if (demand < 0 || demand > 100) failures.push(`${row.job_role}: demand out of range`)
  return {
    role: row.job_role,
    category: row.job_category,
    family: row.job_family,
    risk,
    risk_label: layoffRiskLabel(risk),
    demand_index: demand,
    components,
    rationale: modelRationale(row, 'India', signals),
  }
})

const customerSupport = auditRows.find((row) => row.role === 'Customer Support Executive')
if (!customerSupport || customerSupport.risk < 7) failures.push('Customer Support Executive must be High risk (>=7)')

for (const roleName of ['Voice Process Associate', 'Non-Voice Process Associate', 'Data Entry Operator - Government']) {
  const row = auditRows.find((item) => item.role === roleName)
  if (!row || row.risk < 7) failures.push(`${roleName} must be High risk (>=7)`)
}

const clinicalRows = auditRows.filter((row) => ['Clinical Care', 'Skilled Trades', 'Public Safety'].includes(row.family))
for (const row of clinicalRows) {
  if (row.risk > 6) failures.push(`${row.role}: protected physical/accountable role unexpectedly High risk`)
}

const distribution = auditRows.reduce((acc, row) => {
  acc[row.risk_label] = (acc[row.risk_label] || 0) + 1
  return acc
}, {})
const audit = {
  model_version: ROLE_MODEL_VERSION,
  model_updated_at: ROLE_MODEL_UPDATED_AT,
  scope: 'All 157 dashboard roles, India calibration',
  metric_note: 'Demand index is a modelled relative signal, not a count of live vacancies or total employment.',
  distribution,
  checks_passed: failures.length === 0,
  failures,
  roles: auditRows,
}
fs.writeFileSync('data/role_model_audit.json', `${JSON.stringify(audit, null, 2)}\n`)

console.log(`Audited ${auditRows.length} roles with ${ROLE_MODEL_VERSION}. Risk distribution: ${JSON.stringify(distribution)}.`)
console.log(`Customer Support Executive: risk ${customerSupport?.risk}/10 (${customerSupport?.risk_label}), demand ${customerSupport?.demand_index}/100.`)
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log('All calibration and data-contract checks passed.')
}
