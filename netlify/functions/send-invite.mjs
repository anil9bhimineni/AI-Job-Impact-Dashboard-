import { sendLaunchInvite } from '../../server/whatsapp.mjs'

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } }),
    }
  }

  const auth = event.headers.authorization || event.headers.Authorization || ''
  const expected = process.env.ADMIN_INVITE_TOKEN
  if (!expected || auth !== `Bearer ${expected}`) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Missing or invalid admin invite token.' } }),
    }
  }

  const body = event.body ? JSON.parse(event.body) : {}
  const phone = String(body.phone || '').replace(/\D/g, '')
  if (!/^91\d{10}$/.test(phone)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { code: 'INVALID_PHONE', message: 'Use an India number like 917338606566.' } }),
    }
  }

  const result = await sendLaunchInvite(phone)
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, phone, result }),
  }
}
