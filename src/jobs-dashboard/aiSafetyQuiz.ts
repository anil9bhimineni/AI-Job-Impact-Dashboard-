export type QuizAnswer = 0 | 1 | 2

export type QuizAnswers = {
  repetitiveWork: QuizAnswer
  physicalPresence: QuizAnswer
  humanTrust: QuizAnswer
  digitalOutput: QuizAnswer
  accountability: QuizAnswer
  learningReadiness: QuizAnswer
}

export type QuizRoleSignals = {
  automationRisk: number
  layoffRisk: number
  hiringDemand: number
}

const weights: Record<keyof QuizAnswers, number> = {
  repetitiveWork: 10,
  physicalPresence: 9,
  humanTrust: 8,
  digitalOutput: 8,
  accountability: 7,
  learningReadiness: 8,
}

export function calculateAiSafetyQuiz(answers: QuizAnswers, signals: QuizRoleSignals) {
  const answerRisk = (Object.keys(weights) as Array<keyof QuizAnswers>)
    .reduce((total, key) => total + answers[key] * weights[key], 0) / 2
  const roleRisk = signals.automationRisk * 4.2 + signals.layoffRisk * 2.4
  const demandProtection = Math.max(0, Math.min(100, signals.hiringDemand)) * 0.18
  const exposure = Math.round(Math.max(0, Math.min(100, answerRisk + roleRisk - demandProtection)))
  const safetyScore = 100 - exposure
  const level = exposure >= 67 ? 'high' : exposure >= 40 ? 'moderate' : 'low'
  const strongestProtections = [
    answers.physicalPresence === 0 ? 'physical presence' : null,
    answers.humanTrust === 0 ? 'human trust' : null,
    answers.accountability === 0 ? 'real-world accountability' : null,
    answers.learningReadiness === 0 ? 'learning readiness' : null,
  ].filter(Boolean) as string[]
  return {
    exposure,
    safetyScore,
    level,
    strongestProtections,
    version: 'india-ai-safety-quiz-2026.08-v1',
  }
}

