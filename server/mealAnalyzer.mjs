import { calculateTotals, indianFoodCatalog } from './nutrition.mjs'

function demoItems() {
  return [
    { ...indianFoodCatalog.find((item) => item.id === 'roti'), portion: 2, confidence: 94 },
    { ...indianFoodCatalog.find((item) => item.id === 'dal'), portion: 1, confidence: 88 },
    { ...indianFoodCatalog.find((item) => item.id === 'sabzi'), portion: 1, confidence: 81 },
  ]
}

export async function analyzeMealImage({ source = 'unknown', mediaId = null, mimeType = null, bytes = null } = {}) {
  const items = demoItems()
  const totals = calculateTotals(items)

  return {
    analyzer: process.env.VISION_API_URL ? 'external-ready' : 'demo-indian-food-estimator',
    source,
    mediaId,
    mimeType,
    imageBytes: bytes?.byteLength ?? bytes?.length ?? 0,
    confidence: Math.round(items.reduce((sum, item) => sum + item.confidence, 0) / items.length),
    items,
    totals,
    note: process.env.VISION_API_URL
      ? 'VISION_API_URL is configured; replace demoItems with provider response mapping.'
      : 'Demo analysis. Connect a vision model before production launch.',
  }
}

export async function analyzeMealFromText(text = '') {
  const normalized = text.toLowerCase()
  const items = indianFoodCatalog
    .filter((food) => food.aliases.some((alias) => normalized.includes(alias)))
    .map((food) => ({ ...food, portion: normalized.includes('2') && food.id === 'roti' ? 2 : 1, confidence: 70 }))

  const finalItems = items.length ? items : demoItems()
  return {
    analyzer: items.length ? 'text-food-matcher' : 'demo-indian-food-estimator',
    source: 'text',
    confidence: items.length ? 70 : 60,
    items: finalItems,
    totals: calculateTotals(finalItems),
  }
}
