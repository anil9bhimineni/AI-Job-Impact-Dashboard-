import { analyzeMealFromText, analyzeMealImage } from './mealAnalyzer.mjs'
import { canUseSnap, recordSnap, upgradeMessage } from './billing.mjs'
import { formatMealSummary } from './nutrition.mjs'

const graphVersion = process.env.WHATSAPP_GRAPH_API_VERSION || 'v22.0'
const graphBase = `https://graph.facebook.com/${graphVersion}`
const pendingMeals = new Map()
const savedMeals = []

function credentials() {
  return {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  }
}

export function integrationStatus() {
  return {
    graphVersion,
    configured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    hasAccessToken: Boolean(process.env.WHATSAPP_ACCESS_TOKEN),
    hasPhoneNumberId: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID),
    hasVerifyToken: Boolean(process.env.WHATSAPP_VERIFY_TOKEN),
    pendingMeals: pendingMeals.size,
    savedMeals: savedMeals.length,
  }
}

export function verifyWebhook(searchParams) {
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return { ok: true, challenge }
  }

  return { ok: false, challenge: null }
}

async function sendWhatsAppPayload(payload) {
  const { accessToken, phoneNumberId } = credentials()
  if (!accessToken || !phoneNumberId) {
    return { dryRun: true, payload }
  }

  const response = await fetch(`${graphBase}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responsePayload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(`WhatsApp send failed: ${response.status} ${JSON.stringify(responsePayload)}`)
  }
  return responsePayload
}

export async function sendWhatsAppText(to, body) {
  return sendWhatsAppPayload({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body },
  })
}

export async function sendLaunchInvite(to) {
  const appUrl = process.env.PUBLIC_APP_URL || 'https://6a4fe212b8805b59d59063d1--whimsical-pika-963cd4.netlify.app'
  const body = [
    'Hi, Global AI Impact Dashboard is ready.',
    '',
    'Open the app:',
    appUrl,
    '',
    'How it works:',
    '1. Tap Snap meal',
    '2. Upload a plate photo',
    '3. Confirm calories and macros',
    '',
    'Once the WhatsApp business number is connected, you will be able to send food photos directly here.',
  ].join('\n')

  return sendWhatsAppText(to, body)
}

export async function sendMealReview(to, analysis) {
  const body = formatMealSummary(analysis)
  return sendWhatsAppPayload({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: body },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'save_meal', title: 'Save meal' } },
          { type: 'reply', reply: { id: 'edit_meal', title: 'Edit' } },
          { type: 'reply', reply: { id: 'discard_meal', title: 'Discard' } },
        ],
      },
    },
  })
}

async function getMediaUrl(mediaId) {
  const { accessToken } = credentials()
  if (!accessToken) return null

  const response = await fetch(`${graphBase}/${mediaId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(`WhatsApp media lookup failed: ${response.status} ${JSON.stringify(payload)}`)
  }
  return payload
}

async function downloadMedia(mediaUrl) {
  const { accessToken } = credentials()
  if (!accessToken || !mediaUrl) return { bytes: null, mimeType: null }

  const response = await fetch(mediaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) {
    throw new Error(`WhatsApp media download failed: ${response.status}`)
  }

  return {
    bytes: Buffer.from(await response.arrayBuffer()),
    mimeType: response.headers.get('content-type'),
  }
}

function incomingMessages(payload) {
  return payload?.entry?.flatMap((entry) => (
    entry.changes?.flatMap((change) => change.value?.messages || []) || []
  )) || []
}

export async function handleWhatsAppWebhook(payload) {
  const messages = incomingMessages(payload)
  const results = []

  for (const message of messages) {
    const from = message.from
    const interactiveReply = message.interactive?.button_reply?.id

    if (interactiveReply === 'save_meal' || interactiveReply === 'discard_meal' || interactiveReply === 'edit_meal') {
      const outbound = await handleMealAction(from, interactiveReply)
      results.push({ from, type: 'interactive', outbound })
      continue
    }

    if (message.type === 'image' && message.image?.id) {
      if (!canUseSnap(from).allowed) {
        const outbound = await sendWhatsAppText(from, upgradeMessage(from))
        results.push({ from, type: 'image-limit', outbound })
        continue
      }
      const media = await getMediaUrl(message.image.id)
      const downloaded = await downloadMedia(media?.url)
      const analysis = await analyzeMealImage({
        source: 'whatsapp',
        mediaId: message.image.id,
        mimeType: downloaded.mimeType || media?.mime_type || message.image.mime_type,
        bytes: downloaded.bytes,
      })
      recordSnap(from)
      pendingMeals.set(from, { analysis, createdAt: new Date().toISOString(), source: 'image' })
      const outbound = await sendMealReview(from, analysis)
      results.push({ from, type: 'image', analysis, outbound })
      continue
    }

    if (message.type === 'text') {
      const text = message.text?.body || ''
      const normalized = text.trim().toLowerCase()
      if (['yes', 'y', 'save', 'confirm', 'looks right'].includes(normalized)) {
        const outbound = await handleMealAction(from, 'save_meal')
        results.push({ from, type: 'text-confirmation', outbound })
        continue
      }
      if (['no', 'discard', 'cancel'].includes(normalized)) {
        const outbound = await handleMealAction(from, 'discard_meal')
        results.push({ from, type: 'text-discard', outbound })
        continue
      }
      if (['upgrade', 'pricing', 'price', 'pay', 'subscription'].includes(normalized)) {
        const outbound = await sendWhatsAppText(from, upgradeMessage(from))
        results.push({ from, type: 'upgrade', outbound })
        continue
      }

      const shouldEstimate = /(roti|dal|rice|sabzi|paneer|curd|kcal|calorie)/i.test(text)
      let outbound
      if (shouldEstimate) {
        if (!canUseSnap(from).allowed) {
          outbound = await sendWhatsAppText(from, upgradeMessage(from))
          results.push({ from, type: 'text-limit', outbound })
          continue
        }
        const analysis = await analyzeMealFromText(text)
        recordSnap(from)
        pendingMeals.set(from, { analysis, createdAt: new Date().toISOString(), source: 'text' })
        outbound = await sendMealReview(from, analysis)
      } else {
        const status = canUseSnap(from)
        const remaining = status.remaining === null ? 'unlimited' : status.remaining
        outbound = await sendWhatsAppText(from, `Hi, this service can estimate calories, protein, carbs and fat from a clear meal photo. You have ${remaining} meal snaps left this week. Reply UPGRADE anytime for plans.`)
      }
      results.push({ from, type: 'text', outbound })
      continue
    }

    const outbound = await sendWhatsAppText(from, 'Please send a meal photo so this service can estimate calories.')
    results.push({ from, type: message.type, outbound })
  }

  return { received: messages.length, results }
}

async function handleMealAction(from, action) {
  const pending = pendingMeals.get(from)

  if (action === 'edit_meal') {
    return sendWhatsAppText(from, 'Reply with corrections like: "1 roti, more dal, no rice" or send a clearer meal photo.')
  }

  if (!pending) {
    return sendWhatsAppText(from, 'I do not have a pending meal for you. Send a meal photo to start.')
  }

  if (action === 'discard_meal') {
    pendingMeals.delete(from)
    return sendWhatsAppText(from, 'Discarded. Send another meal photo whenever you are ready.')
  }

  const saved = {
    id: `${from}-${Date.now()}`,
    from,
    savedAt: new Date().toISOString(),
    ...pending.analysis,
  }
  savedMeals.unshift(saved)
  pendingMeals.delete(from)

  return sendWhatsAppText(from, `Saved. Today this meal adds ${saved.totals.kcal} kcal, ${saved.totals.protein}g protein, ${saved.totals.carbs}g carbs and ${saved.totals.fat}g fat.`)
}
