const defaultPaymentLinks = {
  challenge: process.env.PAYMENT_LINK_CHALLENGE || '',
  pro: process.env.PAYMENT_LINK_PRO || '',
  coach: process.env.PAYMENT_LINK_COACH || '',
}

const users = new Map()

export const plans = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    weeklySnaps: Number(process.env.FREE_WEEKLY_SNAP_LIMIT || 5),
  },
  challenge: {
    id: 'challenge',
    name: '14-day Snap Challenge',
    price: 99,
    weeklySnaps: 42,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 199,
    weeklySnaps: Infinity,
  },
  coach: {
    id: 'coach',
    name: 'Coach',
    price: 999,
    weeklySnaps: Infinity,
  },
}

function currentWeekKey(date = new Date()) {
  const firstDay = new Date(date.getFullYear(), 0, 1)
  const days = Math.floor((date - firstDay) / 86400000)
  return `${date.getFullYear()}-W${Math.ceil((days + firstDay.getDay() + 1) / 7)}`
}

export function getUserBilling(userId) {
  const weekKey = currentWeekKey()
  const existing = users.get(userId)
  if (existing && existing.weekKey === weekKey) return existing

  const next = {
    userId,
    planId: existing?.planId || 'free',
    weekKey,
    weeklySnapsUsed: 0,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  users.set(userId, next)
  return next
}

export function setUserPlan(userId, planId) {
  const current = getUserBilling(userId)
  const next = {
    ...current,
    planId: plans[planId] ? planId : current.planId,
    updatedAt: new Date().toISOString(),
  }
  users.set(userId, next)
  return next
}

export function canUseSnap(userId) {
  const billing = getUserBilling(userId)
  const plan = plans[billing.planId] || plans.free
  return {
    allowed: plan.weeklySnaps === Infinity || billing.weeklySnapsUsed < plan.weeklySnaps,
    billing,
    plan,
    remaining: plan.weeklySnaps === Infinity ? null : Math.max(0, plan.weeklySnaps - billing.weeklySnapsUsed),
  }
}

export function recordSnap(userId) {
  const billing = getUserBilling(userId)
  const next = {
    ...billing,
    weeklySnapsUsed: billing.weeklySnapsUsed + 1,
    updatedAt: new Date().toISOString(),
  }
  users.set(userId, next)
  return next
}

export function paymentLinks() {
  return defaultPaymentLinks
}

export function upgradeMessage(userId) {
  const status = canUseSnap(userId)
  const links = paymentLinks()
  return [
    'You have used your free meal snaps for this week.',
    '',
    'Upgrade options:',
    `- 14-day Snap Challenge: ₹99${links.challenge ? `\n  ${links.challenge}` : ''}`,
    `- Pro: ₹199/month for unlimited meal snaps${links.pro ? `\n  ${links.pro}` : ''}`,
    `- Coach: from ₹999/month with human-reviewed feedback${links.coach ? `\n  ${links.coach}` : ''}`,
    '',
    `Current plan: ${status.plan.name}. Reply UPGRADE for payment options.`,
  ].join('\n')
}

export function billingStatus() {
  return {
    freeWeeklySnapLimit: plans.free.weeklySnaps,
    trackedUsers: users.size,
    paymentLinksConfigured: {
      challenge: Boolean(defaultPaymentLinks.challenge),
      pro: Boolean(defaultPaymentLinks.pro),
      coach: Boolean(defaultPaymentLinks.coach),
    },
    plans: Object.values(plans).map((plan) => ({
      ...plan,
      weeklySnaps: plan.weeklySnaps === Infinity ? 'unlimited' : plan.weeklySnaps,
    })),
  }
}
