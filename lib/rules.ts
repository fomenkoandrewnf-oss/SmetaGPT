import { PreuploadHints } from './validators'
import { STAGE_CODES, UNITS, COEFFICIENTS } from './constants'

// ============================================
// Типы
// ============================================

export interface Room {
  name: string
  area_m2: number
  perimeter_m?: number
  is_wet_zone?: boolean
  height_m?: number
}

export interface CalculationContext {
  area_total: number
  ceiling_height_m: number
  rooms: Room[]
  bathrooms_count: number
  has_kitchen_living: boolean
  hints: PreuploadHints
}

export interface WorkItem {
  stage_code: string
  work_code: string
  name: string
  unit: string
  qty: number
  base_coef: number
  notes?: string
}

// ============================================
// Главная функция расчёта всех работ
// ============================================

export function calculateAllWorks(context: CalculationContext): WorkItem[] {
  const works: WorkItem[] = []
  
  // 1. Кладка стен (если есть)
  // works.push(...calculateMasonry(context))
  
  // 2. Штукатурка стен
  works.push(...calculatePlaster(context))
  
  // 3. Черновая электрика
  works.push(...calculateElectric(context))
  
  // 4. Черновая сантехника
  works.push(...calculatePlumbing(context))
  
  // 5. Стяжка
  works.push(...calculateScreed(context))
  
  // 6. ГКЛ
  works.push(...calculateGKL(context))
  
  // 7. Плитка
  works.push(...calculateTile(context))
  
  // 8. Подготовка под покраску
  works.push(...calculatePaintPrep(context))
  
  // 9. Напольное покрытие
  works.push(...calculateFlooring(context))
  
  // 10. Окраска
  works.push(...calculatePaint(context))
  
  // 11. Финишные работы
  works.push(...calculateFinish(context))
  
  return works
}

// ============================================
// 2. Штукатурка стен
// ============================================

function calculatePlaster(ctx: CalculationContext): WorkItem[] {
  const h = ctx.ceiling_height_m || 2.7
  
  // Вычисляем площадь стен
  let wallsM2 = 0
  
  for (const room of ctx.rooms) {
    if (room.perimeter_m) {
      // Если есть периметр — точный расчёт
      wallsM2 += room.perimeter_m * h
    } else {
      // Аппроксимация: площадь_пола * коэффициент ≈ 2.6 для типичной комнаты
      wallsM2 += room.area_m2 * 2.6
    }
  }
  
  // Вычитаем проёмы (примерно 15% от площади стен)
  wallsM2 *= 0.85
  
  // Коэффициенты
  let coef = 0
  if (h > 3.0) {
    coef += COEFFICIENTS.PLASTER_HIGH_CEILING
  }
  
  return [{
    stage_code: STAGE_CODES.PLASTER,
    work_code: 'PLASTER_WALLS',
    name: 'Штукатурка стен по маякам',
    unit: UNITS.M2,
    qty: Math.round(wallsM2 * 100) / 100,
    base_coef: coef,
    notes: h > 3.0 ? 'Высокие потолки +10%' : undefined
  }]
}

// ============================================
// 3. Черновая электрика
// ============================================

function calculateElectric(ctx: CalculationContext): WorkItem[] {
  // Скоринговая модель для MVP
  let points = 0
  
  // Базовые точки по комнатам
  const livingRooms = ctx.rooms.filter(r => !r.is_wet_zone)
  points += livingRooms.length * 6
  
  // Санузлы
  points += ctx.bathrooms_count * 4
  
  // Кухня-гостиная
  if (ctx.has_kitchen_living) {
    points += 8
  }
  
  return [{
    stage_code: STAGE_CODES.ELEC_ROUGH,
    work_code: 'ELEC_POINT',
    name: 'Электроточка (розетка/выключатель)',
    unit: UNITS.POINT,
    qty: points,
    base_coef: 0,
    notes: 'Расчёт по скоринговой модели'
  }]
}

// ============================================
// 4. Черновая сантехника
// ============================================

function calculatePlumbing(ctx: CalculationContext): WorkItem[] {
  let points = ctx.bathrooms_count * 3
  
  // Кухня
  if (ctx.has_kitchen_living) {
    points += 2
  } else {
    points += 1
  }
  
  // Коэффициент при множественных санузлах
  let coef = 0
  if (ctx.bathrooms_count >= 2) {
    coef += COEFFICIENTS.PLUMB_MULTI_BATH
  }
  
  return [{
    stage_code: STAGE_CODES.PLUMB_ROUGH,
    work_code: 'PLUMB_POINT',
    name: 'Сантехническая точка',
    unit: UNITS.POINT,
    qty: points,
    base_coef: coef,
    notes: ctx.bathrooms_count >= 2 ? 'Несколько санузлов +10%' : undefined
  }]
}

// ============================================
// 5. Стяжка
// ============================================

function calculateScreed(ctx: CalculationContext): WorkItem[] {
  // Стяжка по всей площади
  let qty = ctx.area_total
  
  // Коэффициенты по площади
  let coef = 0
  const notes: string[] = []
  
  if (ctx.area_total > 150) {
    coef += COEFFICIENTS.SCREED_LARGE_150
    notes.push('Площадь >150м² +10%')
  } else if (ctx.area_total > 90) {
    coef += COEFFICIENTS.SCREED_LARGE_90
    notes.push('Площадь >90м² +5%')
  }
  
  return [{
    stage_code: STAGE_CODES.SCREED,
    work_code: 'SCREED_BASE',
    name: 'Стяжка пола 40мм',
    unit: UNITS.M2,
    qty: Math.round(qty * 100) / 100,
    base_coef: coef,
    notes: notes.join(', ') || undefined
  }]
}

// ============================================
// 6. ГКЛ (потолок)
// ============================================

function calculateGKL(ctx: CalculationContext): WorkItem[] {
  // ГКЛ потолок по всей площади (исключая влажные зоны при натяжных)
  const dryRooms = ctx.rooms.filter(r => !r.is_wet_zone)
  const qty = dryRooms.reduce((sum, r) => sum + r.area_m2, 0)
  
  return [{
    stage_code: STAGE_CODES.GKL,
    work_code: 'GKL_CEILING',
    name: 'Потолок из ГКЛ в 1 слой',
    unit: UNITS.M2,
    qty: Math.round(qty * 100) / 100,
    base_coef: 0,
    notes: 'Сухие помещения'
  }]
}

// ============================================
// 7. Плитка
// ============================================

function calculateTile(ctx: CalculationContext): WorkItem[] {
  const works: WorkItem[] = []
  const h = ctx.ceiling_height_m || 2.7
  
  // Плитка пол (мокрые зоны + кухня)
  const wetRooms = ctx.rooms.filter(r => r.is_wet_zone)
  let tileFloorM2 = wetRooms.reduce((sum, r) => sum + r.area_m2, 0)
  
  // Кухня-гостиная
  if (ctx.has_kitchen_living) {
    const kitchen = ctx.rooms.find(r => 
      r.name.toLowerCase().includes('кухня') ||
      r.name.toLowerCase().includes('гостиная')
    )
    if (kitchen) {
      tileFloorM2 += kitchen.area_m2 * 0.3 // 30% площади кухни
    }
  }
  
  // Коэффициент сложности
  let coef = 0
  if (ctx.area_total > 120) {
    coef += COEFFICIENTS.TILE_COMPLEX_120
  }
  
  works.push({
    stage_code: STAGE_CODES.TILE,
    work_code: 'TILE_FLOOR',
    name: 'Укладка плитки на пол',
    unit: UNITS.M2,
    qty: Math.round(tileFloorM2 * 100) / 100,
    base_coef: coef,
    notes: ctx.area_total > 120 ? 'Сложная раскладка +5%' : undefined
  })
  
  // Плитка стены (мокрые зоны)
  let tileWallsM2 = 0
  for (const room of wetRooms) {
    if (room.perimeter_m) {
      tileWallsM2 += room.perimeter_m * h * 0.8 // 80% высоты
    } else {
      tileWallsM2 += room.area_m2 * 2.6 * 0.8
    }
  }
  
  works.push({
    stage_code: STAGE_CODES.TILE,
    work_code: 'TILE_WALLS',
    name: 'Укладка плитки на стены',
    unit: UNITS.M2,
    qty: Math.round(tileWallsM2 * 100) / 100,
    base_coef: coef,
    notes: 'Мокрые зоны'
  })
  
  return works
}

// ============================================
// 8. Подготовка под покраску
// ============================================

function calculatePaintPrep(ctx: CalculationContext): WorkItem[] {
  const h = ctx.ceiling_height_m || 2.7
  
  // Стены под покраску (сухие помещения, минус плитка)
  const dryRooms = ctx.rooms.filter(r => !r.is_wet_zone)
  let paintableWallsM2 = 0
  
  for (const room of dryRooms) {
    if (room.perimeter_m) {
      paintableWallsM2 += room.perimeter_m * h
    } else {
      paintableWallsM2 += room.area_m2 * 2.6
    }
  }
  
  paintableWallsM2 *= 0.85 // Минус проёмы
  
  return [{
    stage_code: STAGE_CODES.PAINT_PREP,
    work_code: 'PUTTY',
    name: 'Шпаклевка стен под окраску',
    unit: UNITS.M2,
    qty: Math.round(paintableWallsM2 * 100) / 100,
    base_coef: 0
  }]
}

// ============================================
// 9. Напольное покрытие
// ============================================

function calculateFlooring(ctx: CalculationContext): WorkItem[] {
  // Ламинат/паркет в сухих помещениях
  const dryRooms = ctx.rooms.filter(r => !r.is_wet_zone)
  const qty = dryRooms.reduce((sum, r) => sum + r.area_m2, 0)
  
  return [{
    stage_code: STAGE_CODES.FLOOR,
    work_code: 'FLOOR_LAMINATE',
    name: 'Укладка ламината',
    unit: UNITS.M2,
    qty: Math.round(qty * 100) / 100,
    base_coef: 0,
    notes: 'Сухие помещения'
  }]
}

// ============================================
// 10. Окраска
// ============================================

function calculatePaint(ctx: CalculationContext): WorkItem[] {
  const h = ctx.ceiling_height_m || 2.7
  
  // Окраска стен (те же площади, что и подготовка)
  const dryRooms = ctx.rooms.filter(r => !r.is_wet_zone)
  let paintWallsM2 = 0
  
  for (const room of dryRooms) {
    if (room.perimeter_m) {
      paintWallsM2 += room.perimeter_m * h
    } else {
      paintWallsM2 += room.area_m2 * 2.6
    }
  }
  
  paintWallsM2 *= 0.85
  
  // Окраска потолков
  const paintCeilingM2 = dryRooms.reduce((sum, r) => sum + r.area_m2, 0)
  
  return [
    {
      stage_code: STAGE_CODES.PAINT,
      work_code: 'PAINT_WALLS',
      name: 'Окраска стен',
      unit: UNITS.M2,
      qty: Math.round(paintWallsM2 * 100) / 100,
      base_coef: 0
    },
    {
      stage_code: STAGE_CODES.PAINT,
      work_code: 'PAINT_CEILING',
      name: 'Окраска потолков',
      unit: UNITS.M2,
      qty: Math.round(paintCeilingM2 * 100) / 100,
      base_coef: 0
    }
  ]
}

// ============================================
// 11. Финишные работы
// ============================================

function calculateFinish(ctx: CalculationContext): WorkItem[] {
  const works: WorkItem[] = []
  
  // Установка сантехприборов
  works.push({
    stage_code: STAGE_CODES.FINISH,
    work_code: 'FIN_TOILET',
    name: 'Установка унитаза',
    unit: UNITS.SHT,
    qty: ctx.bathrooms_count,
    base_coef: 0
  })
  
  works.push({
    stage_code: STAGE_CODES.FINISH,
    work_code: 'FIN_SINK',
    name: 'Установка раковины',
    unit: UNITS.SHT,
    qty: ctx.bathrooms_count + (ctx.has_kitchen_living ? 1 : 0),
    base_coef: 0
  })
  
  // Плинтуса
  const dryRooms = ctx.rooms.filter(r => !r.is_wet_zone)
  let baseboardM = 0
  for (const room of dryRooms) {
    if (room.perimeter_m) {
      baseboardM += room.perimeter_m
    } else {
      // Аппроксимация периметра через площадь
      baseboardM += Math.sqrt(room.area_m2) * 4
    }
  }
  
  works.push({
    stage_code: STAGE_CODES.FINISH,
    work_code: 'FIN_BASEBOARD',
    name: 'Установка плинтуса',
    unit: UNITS.M,
    qty: Math.round(baseboardM * 100) / 100,
    base_coef: 0
  })
  
  return works
}

