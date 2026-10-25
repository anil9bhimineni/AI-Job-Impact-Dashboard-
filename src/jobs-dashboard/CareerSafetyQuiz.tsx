import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronLeft, RotateCcw, Share2, ShieldCheck } from 'lucide-react'
import { calculateAiSafetyQuiz, type QuizAnswer, type QuizAnswers } from './aiSafetyQuiz'

type Role = Record<string, unknown>

const questions: Array<{
  key: keyof QuizAnswers
  title: string
  help: string
  options: [string, string, string]
}> = [
  { key: 'repetitiveWork', title: 'How repetitive is most of your work?', help: 'Think about your actual weekly tasks, not only your job title.', options: ['Mostly varied', 'A mix', 'Mostly repetitive'] },
  { key: 'physicalPresence', title: 'Does the work require you to be physically present?', help: 'On-site repair, care, inspection, and field work are harder to automate end to end.', options: ['Usually', 'Sometimes', 'Rarely'] },
  { key: 'humanTrust', title: 'How important are trust and sensitive conversations?', help: 'Judgement, negotiation, care, and relationship ownership can reduce exposure.', options: ['Central', 'Sometimes needed', 'Minimal'] },
  { key: 'digitalOutput', title: 'Is your main output created on a computer?', help: 'Fully digital tasks are generally easier for AI systems to assist or automate.', options: ['Mostly physical', 'Mixed', 'Mostly digital'] },
  { key: 'accountability', title: 'Are you accountable for real-world outcomes?', help: 'Safety, legal, financial, people, and site responsibility can protect parts of a role.', options: ['Yes, directly', 'Shared', 'Limited'] },
  { key: 'learningReadiness', title: 'Can you spend two hours a week upgrading skills?', help: 'This changes transition readiness, not the underlying exposure of the occupation.', options: ['Yes', 'Maybe', 'Not currently'] },
]

function numberSignal(value: unknown, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export function CareerSafetyQuiz({ role, country = 'India' }: { role: Role; country?: string }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({})
  const [copied, setCopied] = useState(false)
  const complete = questions.every((question) => answers[question.key] !== undefined)
  const roleName = String(role.job_role ?? role.occupation_title ?? 'your role')
  const result = useMemo(() => complete ? calculateAiSafetyQuiz(answers as QuizAnswers, {
    automationRisk: numberSignal(role.automationRisk, numberSignal(role.automation, numberSignal(role.automation_risk_score))),
    layoffRisk: numberSignal(role.layoffRisk, numberSignal(role.layoff_risk_score)),
    hiringDemand: numberSignal(role.hiringDemand, numberSignal(role.growth_outlook_score) * 10),
  }) : null, [answers, complete, role])

  const answer = (value: QuizAnswer) => {
    setAnswers((current) => ({ ...current, [questions[step].key]: value }))
    if (step < questions.length - 1) setStep((current) => current + 1)
  }

  const share = async () => {
    if (!result) return
    const url = new URL(window.location.href)
    url.searchParams.set('ref', 'ai-safety-quiz-share')
    const text = `${roleName}: ${result.level} personal AI exposure (${result.exposure}/100). Explore the India career outlook.`
    if (navigator.share) await navigator.share({ title: 'Is my career AI-safe?', text, url: url.toString() })
    else {
      await navigator.clipboard.writeText(`${text} ${url}`)
      setCopied(true)
    }
  }

  if (result) {
    return (
      <section className="career-quiz result" aria-live="polite">
        <div className="career-quiz-heading"><span><ShieldCheck size={19} /> Two-minute career check</span><strong>Personal estimate · {country}</strong></div>
        <div className={`career-quiz-score ${result.level}`}><b>{result.safetyScore}</b><span>AI-safety score</span><em>{result.level} exposure</em></div>
        <div className="career-quiz-result-copy">
          <h2>{roleName}: your work profile has {result.level} AI exposure</h2>
          <p>This combines the role model with your task pattern. It is directional—not a prediction that your job will disappear.</p>
          {result.strongestProtections.length > 0 && <p><CheckCircle2 size={16} /> Strongest protections: {result.strongestProtections.join(', ')}.</p>}
          <small>Model {result.version}. Answers stay in this browser unless you choose to save them after signing in.</small>
          <div><button type="button" onClick={() => void share()}><Share2 size={16} /> {copied ? 'Copied' : 'Share result'}</button><button type="button" onClick={() => { setAnswers({}); setStep(0); setCopied(false) }}><RotateCcw size={16} /> Retake</button></div>
        </div>
      </section>
    )
  }

  const question = questions[step]
  return (
    <section className="career-quiz">
      <div className="career-quiz-heading"><span><ShieldCheck size={19} /> Two-minute career check</span><strong>{step + 1} / {questions.length}</strong></div>
      <div className="career-quiz-progress"><i style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
      <div className="career-quiz-question">
        <span className="eyebrow">Is my career AI-safe?</span>
        <h2>{question.title}</h2>
        <p>{question.help}</p>
        <strong className="quiz-instruction">Choose one answer</strong>
        <div role="radiogroup" aria-label={question.title}>{question.options.map((option, index) => {
          const selected = answers[question.key] === index
          return <button key={option} type="button" role="radio" aria-checked={selected} className={selected ? 'selected' : ''} onClick={() => answer(index as QuizAnswer)}><span className="quiz-option-marker">{String.fromCharCode(65 + index)}</span><span>{option}</span></button>
        })}</div>
      </div>
      <footer><button type="button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}><ChevronLeft size={16} /> Back</button><span>Based on tasks, human judgement, physical presence, demand, and learning readiness.</span></footer>
    </section>
  )
}
