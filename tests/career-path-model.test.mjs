import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { careerPathRecommendation } from '../src/jobs-dashboard/careerPathModel.ts'
import { layoffRiskScore } from '../src/jobs-dashboard/scoringModel.js'

const roles = readFileSync(new URL('../data/sample_occupations.jsonl', import.meta.url), 'utf8').trim().split('\n').map(JSON.parse)
const roleNames = new Set(roles.map((row) => row.job_role))
const signals = JSON.parse(readFileSync(new URL('../data/layoff_role_signals.json', import.meta.url), 'utf8'))
  .map(([country, role_family, roles_affected, affected_count]) => ({ country, role_family, roles_affected, affected_count }))

const scoreFor = (role) => ({
  automationRisk: role.automation_risk_score,
  layoffRisk: layoffRiskScore(role, 'India', signals),
  growth: role.growth_outlook_score + 1,
})
const targetSignals = Object.fromEntries(roles.map((role) => [role.job_role, scoreFor(role)]))
const recommendationFor = (role) => careerPathRecommendation(role, { ...scoreFor(role), targetSignals })

test('all 157 roles receive a valid confidence-gated decision', () => {
  assert.equal(roles.length, 157)
  roles.forEach((role) => {
    const recommendation = recommendationFor(role)
    assert.ok(['stay_and_upgrade', 'monitor', 'transition_recommended', 'insufficient_evidence'].includes(recommendation.decision), role.job_role)
    assert.ok(['high', 'medium', 'low'].includes(recommendation.confidence), role.job_role)
    assert.ok(recommendation.message.length > 30, role.job_role)
    assert.equal(recommendation.nextRoles.includes(role.job_role), false, role.job_role)
    recommendation.nextRoles.forEach((target) => assert.ok(roleNames.has(target), `${role.job_role} points to missing ${target}`))
  })
})

test('plumber and civil site engineer stay in-role instead of receiving forced alternatives', () => {
  for (const name of ['Plumber', 'Civil Site Engineer']) {
    const role = roles.find((row) => row.job_role === name)
    const recommendation = recommendationFor(role)
    assert.equal(recommendation.decision, 'stay_and_upgrade', name)
    assert.deepEqual(recommendation.nextRoles, [], name)
    assert.equal(recommendation.confidence, 'high', name)
  }
})

test('customer support receives adjacent customer-operations paths', () => {
  const role = roles.find((row) => row.job_role === 'Customer Support Executive')
  const recommendation = recommendationFor(role)
  assert.equal(recommendation.decision, 'transition_recommended')
  assert.deepEqual(recommendation.nextRoles, ['Customer Experience Manager', 'Training Coordinator'])
})

test('BPO mappings do not leak into software QA or voice-process substrings', () => {
  const nonVoice = recommendationFor(roles.find((row) => row.job_role === 'Non-Voice Process Associate'))
  const qualityBpo = recommendationFor(roles.find((row) => row.job_role === 'Quality Analyst - BPO'))
  assert.deepEqual(nonVoice.nextRoles, ['Business Analyst - IT'])
  assert.deepEqual(qualityBpo.nextRoles, ['Customer Experience Manager', 'Training Coordinator', 'Team Leader - BPO'])
})

test('recommended destinations improve at least one signal and are not high risk', () => {
  roles.forEach((role) => {
    const source = scoreFor(role)
    recommendationFor(role).nextRoles.forEach((name) => {
      const target = targetSignals[name]
      assert.ok(target.automationRisk <= 7, `${role.job_role} points to high-automation ${name}`)
      assert.ok(target.layoffRisk <= 6, `${role.job_role} points to high-layoff ${name}`)
      assert.ok(
        target.automationRisk < source.automationRisk || target.layoffRisk < source.layoffRisk || target.growth > source.growth,
        `${role.job_role} does not improve by moving to ${name}`,
      )
    })
  })
})

test('high pressure without an evidence-backed adjacency says the model is unsure', () => {
  const recommendation = careerPathRecommendation({ job_role: 'Unmapped Specialist', job_family: 'Unknown' }, { automationRisk: 9, layoffRisk: 8, growth: 3 })
  assert.equal(recommendation.decision, 'insufficient_evidence')
  assert.equal(recommendation.confidence, 'low')
  assert.deepEqual(recommendation.nextRoles, [])
  assert.match(recommendation.title, /not sure/i)
})
