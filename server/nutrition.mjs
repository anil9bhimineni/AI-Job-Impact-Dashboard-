export const indianFoodCatalog = [
  { id: 'roti', aliases: ['roti', 'chapati', 'phulka'], name: 'Whole-wheat roti', unit: 'piece', kcal: 110, protein: 3.5, carbs: 22, fat: 2 },
  { id: 'dal', aliases: ['dal', 'daal', 'lentils', 'sambar'], name: 'Dal tadka', unit: 'katori', kcal: 185, protein: 9, carbs: 27, fat: 5 },
  { id: 'rice', aliases: ['rice', 'chawal', 'biryani rice'], name: 'Cooked rice', unit: 'katori', kcal: 205, protein: 4, carbs: 45, fat: 0.5 },
  { id: 'sabzi', aliases: ['sabzi', 'curry', 'aloo gobi', 'vegetable'], name: 'Mixed sabzi', unit: 'katori', kcal: 205, protein: 5, carbs: 29, fat: 9 },
  { id: 'paneer', aliases: ['paneer', 'paneer curry'], name: 'Paneer curry', unit: 'katori', kcal: 280, protein: 15, carbs: 12, fat: 20 },
  { id: 'curd', aliases: ['curd', 'dahi', 'yogurt'], name: 'Curd', unit: 'katori', kcal: 90, protein: 5, carbs: 7, fat: 5 },
]

export function calculateTotals(items) {
  const totals = items.reduce((acc, item) => ({
    kcal: acc.kcal + item.kcal * item.portion,
    protein: acc.protein + item.protein * item.portion,
    carbs: acc.carbs + item.carbs * item.portion,
    fat: acc.fat + item.fat * item.portion,
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 })

  return Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, Math.round(value)]))
}

export function formatMealSummary(analysis) {
  const lines = analysis.items.map((item) => {
    const calories = Math.round(item.kcal * item.portion)
    return `- ${item.portion} ${item.unit} ${item.name}: ${Math.round(calories * 0.9)}-${Math.round(calories * 1.1)} kcal`
  })

  return [
    'Meal estimate:',
    ...lines,
    '',
    `Total: ${Math.round(analysis.totals.kcal * 0.9)}-${Math.round(analysis.totals.kcal * 1.1)} kcal`,
    `Protein: ${analysis.totals.protein}g | Carbs: ${analysis.totals.carbs}g | Fat: ${analysis.totals.fat}g`,
    '',
    'Reply YES to save, or send corrections like: 1 roti, more dal, no rice.',
  ].join('\n')
}
