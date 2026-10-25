import { integrationStatus } from '../../server/whatsapp.mjs'

export async function handler() {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'ok',
      service: 'global-ai-impact-dashboard',
      whatsappConfigured: integrationStatus().configured,
      analyzer: process.env.VISION_API_URL ? 'external-ready' : 'demo',
    }),
  }
}
