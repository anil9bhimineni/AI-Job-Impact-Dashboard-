export async function handler(_event, context = {}) {
  const country = context.geo?.country
  const name = String(country?.name || '').trim()
  const code = String(country?.code || '').trim().toUpperCase()

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
    body: JSON.stringify({
      data: {
        country: name ? { name, code: code || null } : null,
        source: name ? 'netlify-geolocation' : 'fallback',
      },
    }),
  }
}
