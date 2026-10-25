import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateAiSafetyQuiz } from '../src/jobs-dashboard/aiSafetyQuiz.ts'

const protectedAnswers = { repetitiveWork: 0, physicalPresence: 0, humanTrust: 0, digitalOutput: 0, accountability: 0, learningReadiness: 0 }
const exposedAnswers = { repetitiveWork: 2, physicalPresence: 2, humanTrust: 2, digitalOutput: 2, accountability: 2, learningReadiness: 2 }

test('physical, accountable work is safer than repetitive digital work for equal role signals', () => {
  const signals = { automationRisk: 5, layoffRisk: 5, hiringDemand: 50 }
  const protectedResult = calculateAiSafetyQuiz(protectedAnswers, signals)
  const exposedResult = calculateAiSafetyQuiz(exposedAnswers, signals)
  assert.ok(protectedResult.safetyScore > exposedResult.safetyScore)
  assert.deepEqual(protectedResult.strongestProtections, ['physical presence', 'human trust', 'real-world accountability', 'learning readiness'])
})

test('demand protection is bounded and cannot create invalid scores', () => {
  for (const hiringDemand of [-100, 0, 100, 500]) {
    const result = calculateAiSafetyQuiz(exposedAnswers, { automationRisk: 10, layoffRisk: 10, hiringDemand })
    assert.ok(result.exposure >= 0 && result.exposure <= 100)
    assert.equal(result.safetyScore, 100 - result.exposure)
  }
})

test('low-exposure trade work retains uncertainty instead of returning a perfect score', () => {
  const result = calculateAiSafetyQuiz(protectedAnswers, { automationRisk: 3, layoffRisk: 4, hiringDemand: 89 })
  assert.equal(result.level, 'low')
  assert.ok(result.safetyScore < 100)
  assert.ok(result.safetyScore >= 85)
})
