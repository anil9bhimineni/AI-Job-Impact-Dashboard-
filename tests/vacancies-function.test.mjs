import assert from 'node:assert/strict'
import test from 'node:test'
import { handler } from '../netlify/functions/vacancies.mjs'

test('vacancies endpoint fails honestly when no verified provider is configured', async () => {
  const previous = process.env.VACANCY_FEED_URL
  delete process.env.VACANCY_FEED_URL
  try {
    const response = await handler({ rawUrl: 'https://example.test/api/vacancies?role=Nurse&country=India' })
    assert.equal(response.statusCode, 503)
    const payload = JSON.parse(response.body)
    assert.equal(payload.status, 'unavailable')
    assert.deepEqual(payload.vacancies, [])
  } finally {
    if (previous) process.env.VACANCY_FEED_URL = previous
  }
})
