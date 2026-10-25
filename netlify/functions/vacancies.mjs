const json = (statusCode, body) => ({
  statusCode,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': statusCode === 200 ? 'public, max-age=300' : 'no-store' },
  body: JSON.stringify(body),
})

export async function handler(event) {
  const feedUrl = process.env.VACANCY_FEED_URL
  if (!feedUrl) {
    return json(503, {
      status: 'unavailable',
      message: 'A verified role-level vacancy provider has not been configured yet.',
      vacancies: [],
    })
  }

  const requestUrl = new URL(event.rawUrl || `https://dashboard.invalid${event.path || '/api/vacancies'}${event.rawQuery ? `?${event.rawQuery}` : ''}`)
  const upstream = new URL(feedUrl)
  upstream.searchParams.set('role', requestUrl.searchParams.get('role') || '')
  upstream.searchParams.set('country', requestUrl.searchParams.get('country') || '')
  upstream.searchParams.set('limit', '10')

  try {
    const response = await fetch(upstream, {
      headers: process.env.VACANCY_FEED_TOKEN ? { authorization: `Bearer ${process.env.VACANCY_FEED_TOKEN}` } : {},
    })
    if (!response.ok) return json(502, { status: 'unavailable', message: `Vacancy provider returned ${response.status}.`, vacancies: [] })
    const payload = await response.json()
    const vacancies = (Array.isArray(payload.vacancies) ? payload.vacancies : []).slice(0, 10).map((row) => ({
      id: String(row.id || row.url || ''),
      title: String(row.title || ''),
      employer: String(row.employer || ''),
      location: String(row.location || ''),
      posted_at: String(row.posted_at || ''),
      source: String(row.source || 'Configured vacancy provider'),
      url: String(row.url || ''),
    })).filter((row) => row.title && row.employer && row.url.startsWith('http'))
    return json(200, { status: 'ready', vacancies, retrieved_at: new Date().toISOString() })
  } catch {
    return json(502, { status: 'unavailable', message: 'The configured vacancy provider could not be reached.', vacancies: [] })
  }
}
