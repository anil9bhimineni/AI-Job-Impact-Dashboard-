import assert from 'node:assert/strict'
import test from 'node:test'
import { handler } from '../netlify/functions/geo.mjs'

test('geo endpoint exposes only coarse country data', async () => {
  const response = await handler({}, { geo: { country: { name: 'India', code: 'IN' }, ip: '203.0.113.10' } })
  const payload = JSON.parse(response.body)
  assert.equal(response.statusCode, 200)
  assert.deepEqual(payload.data.country, { name: 'India', code: 'IN' })
  assert.doesNotMatch(response.body, /203\.0\.113\.10/)
  assert.equal(response.headers['Cache-Control'], 'private, no-store')
})

test('geo endpoint returns a safe null when location is unavailable', async () => {
  const response = await handler({}, {})
  const payload = JSON.parse(response.body)
  assert.equal(payload.data.country, null)
  assert.equal(payload.data.source, 'fallback')
})
