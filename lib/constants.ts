// ============================================
// Коды этапов работ
// ============================================

export const STAGE_CODES = {
  MASONRY: 'MASONRY',
  PLASTER: 'PLASTER',
  ELEC_ROUGH: 'ELEC_ROUGH',
  PLUMB_ROUGH: 'PLUMB_ROUGH',
  SCREED: 'SCREED',
  GKL: 'GKL',
  TILE: 'TILE',
  PAINT_PREP: 'PAINT_PREP',
  FLOOR: 'FLOOR',
  PAINT: 'PAINT',
  FINISH: 'FINISH'
} as const

export type StageCode = keyof typeof STAGE_CODES

// ============================================
// Названия этапов
// ============================================

export const STAGE_NAMES: Record<StageCode, string> = {
  MASONRY: 'Кладка стен',
  PLASTER: 'Штукатурка стен',
  ELEC_ROUGH: 'Черновая электрика',
  PLUMB_ROUGH: 'Черновая сантехника',
  SCREED: 'Стяжка',
  GKL: 'ГКЛ (перегородки/потолки/короба)',
  TILE: 'Плитка (пол/стены)',
  PAINT_PREP: 'Подготовка стен под окраску',
  FLOOR: 'Напольное покрытие',
  PAINT: 'Окраска стен/потолков',
  FINISH: 'Финишные работы'
}

// ============================================
// Порядок этапов
// ============================================

export const STAGE_ORDER: StageCode[] = [
  'MASONRY',
  'PLASTER',
  'ELEC_ROUGH',
  'PLUMB_ROUGH',
  'SCREED',
  'GKL',
  'TILE',
  'PAINT_PREP',
  'FLOOR',
  'PAINT',
  'FINISH'
]

// ============================================
// Единицы измерения
// ============================================

export const UNITS = {
  M2: 'м²',
  M: 'м.п.',
  SHT: 'шт',
  POINT: 'точка'
} as const

// ============================================
// Коэффициенты
// ============================================

export const COEFFICIENTS = {
  // Площадь > 90 м² → стяжка +5%
  SCREED_LARGE_90: 0.05,
  // Площадь > 120 м² → плитка сложная +5%
  TILE_COMPLEX_120: 0.05,
  // Площадь > 150 м² → стяжка +10%
  SCREED_LARGE_150: 0.10,
  // 2+ санузла → сантехточки +10%
  PLUMB_MULTI_BATH: 0.10,
  // Высота > 3м → штукатурка +10%
  PLASTER_HIGH_CEILING: 0.10,
  // Мозаика → плитка +15%
  TILE_MOSAIC: 0.15
} as const

// ============================================
// Лимиты файлов
// ============================================

export const FILE_LIMITS = {
  MAX_SIZE_MB: 25,
  MAX_PAGES: 5,
  ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png']
} as const

// ============================================
// Санити-чек пороги
// ============================================

export const SANITY_THRESHOLDS = {
  AREA_DEVIATION_PERCENT: 0.10,  // 10%
  ROOMS_DEVIATION_ABS: 1,         // ±1 комната
  BATHROOMS_DEVIATION_ABS: 1      // ±1 санузел
} as const

// ============================================
// OpenAI модели
// ============================================

export const AI_MODELS = {
  VISION: 'gpt-4o-mini',
  TEXT: 'gpt-4o-mini'
} as const

// ============================================
// Стоимость токенов (примерные USD)
// ============================================

export const TOKEN_COSTS = {
  'gpt-4o-mini': {
    input: 0.00015 / 1000,   // за токен
    output: 0.0006 / 1000
  },
  'gpt-4o': {
    input: 0.005 / 1000,
    output: 0.015 / 1000
  }
} as const

