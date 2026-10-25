import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { analyzeMealImage } from './mealAnalyzer.mjs'
import { billingStatus } from './billing.mjs'
import { handleWhatsAppWebhook, integrationStatus, sendLaunchInvite, verifyWebhook } from './whatsapp.mjs'
import { handler as vacancyHandler } from '../netlify/functions/vacancies.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const dist = join(root, 'dist')
const port = Number(process.env.PORT || process.env.API_PORT || 8787)
const host = process.env.HOST || '127.0.0.1'

function json(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  })
  res.end(JSON.stringify(payload))
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

async function serveStatic(req, res, pathname) {
  const filePath = pathname === '/' ? join(dist, 'index.html') : join(dist, pathname)
  const safePath = resolve(filePath)
  if (!safePath.startsWith(dist)) return false

  try {
    const file = await readFile(safePath)
    const type = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.ico': 'image/x-icon',
    }[extname(filePath)] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': type })
    res.end(file)
    return true
  } catch {
    return false
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  if (req.method === 'OPTIONS') return json(res, 204, {})

  try {
    if (url.pathname === '/health') {
      return json(res, 200, {
        status: 'ok',
        service: 'global-ai-impact-dashboard',
        whatsappConfigured: integrationStatus().configured,
        analyzer: process.env.VISION_API_URL ? 'external-ready' : 'demo',
      })
    }

    if (url.pathname === '/api/config' && req.method === 'GET') {
      return json(res, 200, {
        data: {
          whatsapp: integrationStatus(),
          analyzer: {
            mode: process.env.VISION_API_URL ? 'external-ready' : 'demo',
            hasVisionApiUrl: Boolean(process.env.VISION_API_URL),
          },
          billing: billingStatus(),
        },
      })
    }

    if (url.pathname === '/api/analyze-meal' && req.method === 'POST') {
      const body = await readBody(req)
      const analysis = await analyzeMealImage({
        source: 'web',
        mimeType: body.mimeType,
        bytes: body.imageDataUrl ? Buffer.byteLength(body.imageDataUrl) : null,
      })
      return json(res, 200, { data: analysis })
    }

    if (url.pathname === '/api/send-invite' && req.method === 'POST') {
      const auth = req.headers.authorization || ''
      const expected = process.env.ADMIN_INVITE_TOKEN
      if (!expected || auth !== `Bearer ${expected}`) {
        return json(res, 401, { error: { code: 'UNAUTHORIZED', message: 'Missing or invalid admin invite token.' } })
      }

      const body = await readBody(req)
      const phone = String(body.phone || '').replace(/\D/g, '')
      if (!/^91\d{10}$/.test(phone)) {
        return json(res, 400, { error: { code: 'INVALID_PHONE', message: 'Use an India number like 917338606566.' } })
      }

      const result = await sendLaunchInvite(phone)
      return json(res, 200, { ok: true, phone, result })
    }

    if (url.pathname === '/webhooks/whatsapp' && req.method === 'GET') {
      const verified = verifyWebhook(url.searchParams)
      if (verified.ok) {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        return res.end(verified.challenge)
      }
      return json(res, 403, { error: { code: 'WEBHOOK_VERIFY_FAILED', message: 'Invalid verify token.' } })
    }

    if (url.pathname === '/webhooks/whatsapp' && req.method === 'POST') {
      const payload = await readBody(req)
      const result = await handleWhatsAppWebhook(payload)
      return json(res, 200, { ok: true, ...result })
    }

    if (url.pathname === '/api/vacancies' && req.method === 'GET') {
      const result = await vacancyHandler({ rawUrl: url.toString() })
      res.writeHead(result.statusCode, result.headers)
      return res.end(result.body)
    }

    if (await serveStatic(req, res, url.pathname)) return
    if (url.pathname.startsWith('/assets/')) return json(res, 404, { error: { code: 'NOT_FOUND', message: 'Asset not found.' } })

    const fallback = await readFile(join(dist, 'index.html'))
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(fallback)
  } catch (error) {
    json(res, 500, {
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    })
  }
})

server.listen(port, host, () => {
  console.log(`Global AI Impact Dashboard API listening on http://${host}:${port}`)
})
