const baseUrl = process.env.FITSAATHI_API_URL || 'http://127.0.0.1:8787'

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options)
  const text = await response.text()
  let body
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }
  if (!response.ok) {
    throw new Error(`${response.status} ${path}: ${JSON.stringify(body)}`)
  }
  return body
}

const health = await request('/health')
console.log('health:', health.status, health.service)

const inboundText = {
  entry: [{
    changes: [{
      value: {
        messages: [{
          from: '919999999999',
          type: 'text',
          text: { body: '2 roti dal sabzi' },
        }],
      },
    }],
  }],
}

const estimate = await request('/webhooks/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(inboundText),
})
console.log('estimate messages:', estimate.received)

const confirm = await request('/webhooks/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    entry: [{
      changes: [{
        value: {
          messages: [{
            from: '919999999999',
            type: 'text',
            text: { body: 'YES' },
          }],
        },
      }],
    }],
  }),
})
console.log('confirmation messages:', confirm.received)

const config = await request('/api/config')
console.log('pending meals:', config.data.whatsapp.pendingMeals)
console.log('saved meals:', config.data.whatsapp.savedMeals)
