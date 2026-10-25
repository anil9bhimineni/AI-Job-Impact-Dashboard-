import { handleWhatsAppWebhook, verifyWebhook } from '../../server/whatsapp.mjs'

export async function handler(event) {
  if (event.httpMethod === 'GET') {
    const params = new URLSearchParams(event.queryStringParameters || {})
    const verified = verifyWebhook(params)
    if (verified.ok) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: verified.challenge,
      }
    }
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { code: 'WEBHOOK_VERIFY_FAILED', message: 'Invalid verify token.' } }),
    }
  }

  if (event.httpMethod === 'POST') {
    const payload = event.body ? JSON.parse(event.body) : {}
    const result = await handleWhatsAppWebhook(payload)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, ...result }),
    }
  }

  return {
    statusCode: 405,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET or POST.' } }),
  }
}
