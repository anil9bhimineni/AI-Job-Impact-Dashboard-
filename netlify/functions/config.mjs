import { integrationStatus } from '../../server/whatsapp.mjs'
import { billingStatus } from '../../server/billing.mjs'

export async function handler() {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        whatsapp: integrationStatus(),
        analyzer: {
          mode: process.env.VISION_API_URL ? 'external-ready' : 'demo',
          hasVisionApiUrl: Boolean(process.env.VISION_API_URL),
        },
        billing: billingStatus(),
        invite: {
          hasAdminInviteToken: Boolean(process.env.ADMIN_INVITE_TOKEN),
          publicAppUrl: process.env.PUBLIC_APP_URL || '',
        },
      },
    }),
  }
}
