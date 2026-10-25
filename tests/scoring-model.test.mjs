import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  ROLE_MODEL_VERSION,
  hiringDemandIndex,
  layoffRiskLabel,
  layoffRiskScore,
} from '../src/jobs-dashboard/scoringModel.js'

const roles = readFileSync(new URL('../data/sample_occupations.jsonl', import.meta.url), 'utf8').trim().split('\n').map(JSON.parse)
const signals = JSON.parse(readFileSync(new URL('../data/layoff_role_signals.json', import.meta.url), 'utf8'))
  .map(([country, role_family, roles_affected, affected_count]) => ({ country, role_family, roles_affected, affected_count }))

test('every occupation has a current, bounded and reproducible score', () => {
  assert.equal(roles.length, 157)
  roles.forEach((role) => {
    assert.equal(role.scoring_model_version, ROLE_MODEL_VERSION, role.job_role)
    assert.ok(layoffRiskScore(role, 'India', signals) >= 0 && layoffRiskScore(role, 'India', signals) <= 10, role.job_role)
    assert.ok(hiringDemandIndex(role, { growth: 2 }) >= 0 && hiringDemandIndex(role, { growth: 2 }) <= 100, role.job_role)
  })
})

test('customer support and routine process roles are high layoff risk', () => {
  for (const name of ['Customer Support Executive', 'Voice Process Associate', 'Non-Voice Process Associate', 'Data Entry Operator - Government']) {
    const role = roles.find((row) => row.job_role === name)
    assert.ok(role, `${name} is missing`)
    assert.equal(layoffRiskLabel(layoffRiskScore(role, 'India', signals)), 'High', name)
  }
})

test('physical and accountable families are not classified high', () => {
  roles.filter((row) => ['Clinical Care', 'Skilled Trades', 'Public Safety'].includes(row.job_family)).forEach((role) => {
    assert.notEqual(layoffRiskLabel(layoffRiskScore(role, 'India', signals)), 'High', role.job_role)
  })
})

