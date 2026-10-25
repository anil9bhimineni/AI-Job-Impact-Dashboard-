import { analyzeMealImage } from '../../server/mealAnalyzer.mjs'

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } }),
    }
  }

  const body = event.body ? JSON.parse(event.body) : {}
  const analysis = await analyzeMealImage({
    source: 'netlify-web',
    mimeType: body.mimeType,
    bytes: body.imageDataUrl ? Buffer.byteLength(body.imageDataUrl) : null,
  })

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: analysis }),
  }
}
