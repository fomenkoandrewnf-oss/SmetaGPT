import { openai } from './ai-client'
import { PROMPT_ROOM_EXTRACTION, buildUserInstruction } from './ai-prompts'
import { AnalysisResult, PreuploadHints, AnalysisResultSchema } from './validators'
import { AI_MODELS, TOKEN_COSTS, SANITY_THRESHOLDS } from './constants'
import { prisma } from './db'

// ============================================
// Типы
// ============================================

interface PageAnalysisResult {
  rooms: any[]
  total_area_m2: number
  ceiling_height_m?: number
  bathrooms_count: number
  features?: any
  notes?: string
}

interface AnalysisContext {
  projectId: string
  fileId: string
  imageUrls: string[]
  hints?: PreuploadHints
}

// ============================================
// Главная функция анализа
// ============================================

export async function analyzeDesignFile(
  context: AnalysisContext
): Promise<AnalysisResult & { warnings: string[] }> {
  const { projectId, fileId, imageUrls, hints } = context
  
  // Ограничиваем количество страниц для MVP
  const pagesToAnalyze = imageUrls.slice(0, 5)
  const pageResults: PageAnalysisResult[] = []
  
  console.log(`🔍 Начинаем анализ ${pagesToAnalyze.length} страниц для проекта ${projectId}`)
  
  // Анализируем каждую страницу
  for (let i = 0; i < pagesToAnalyze.length; i++) {
    const url = pagesToAnalyze[i]
    console.log(`  📄 Анализ страницы ${i + 1}/${pagesToAnalyze.length}`)
    
    try {
      const result = await analyzePageWithVision(url, hints)
      pageResults.push(result)
      
      // Логируем в БД
      await logAiRequest(projectId, PROMPT_ROOM_EXTRACTION, JSON.stringify(result))
      
    } catch (error) {
      console.error(`  ❌ Ошибка анализа страницы ${i + 1}:`, error)
      throw new Error(`Не удалось проанализировать страницу ${i + 1}: ${error}`)
    }
  }
  
  // Объединяем результаты со всех страниц
  const merged = mergePageResults(pageResults)
  
  // Валидация результата
  const validated = AnalysisResultSchema.parse(merged)
  
  // Санити-чек с hints
  const warnings = performSanityCheck(validated, hints)
  
  return {
    ...validated,
    warnings
  }
}

// ============================================
// Анализ одной страницы через Vision API
// ============================================

async function analyzePageWithVision(
  imageUrl: string,
  hints?: PreuploadHints
): Promise<PageAnalysisResult> {
  
  const startTime = Date.now()
  
  const response = await openai.chat.completions.create({
    model: AI_MODELS.VISION,
    messages: [
      {
        role: 'system',
        content: PROMPT_ROOM_EXTRACTION
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: buildUserInstruction(hints)
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          }
        ]
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2000
  })
  
  const duration = Date.now() - startTime
  console.log(`  ✅ Анализ завершён за ${duration}ms`)
  
  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('OpenAI вернул пустой ответ')
  }
  
  return JSON.parse(content)
}

// ============================================
// Объединение результатов с нескольких страниц
// ============================================

function mergePageResults(results: PageAnalysisResult[]): AnalysisResult {
  if (results.length === 0) {
    throw new Error('Нет результатов для объединения')
  }
  
  // Если только одна страница — возвращаем её
  if (results.length === 1) {
    return {
      total_area_m2: results[0].total_area_m2,
      ceiling_height_m: results[0].ceiling_height_m,
      rooms: results[0].rooms,
      bathrooms_count: results[0].bathrooms_count,
      notes: results[0].notes
    }
  }
  
  // Объединяем помещения (убираем дубликаты по имени)
  const allRooms = results.flatMap(r => r.rooms)
  const uniqueRooms = deduplicateRooms(allRooms)
  
  // Берём максимальную общую площадь (обычно на сводном плане)
  const total_area_m2 = Math.max(...results.map(r => r.total_area_m2))
  
  // Высота потолка — первая найденная
  const ceiling_height_m = results.find(r => r.ceiling_height_m)?.ceiling_height_m
  
  // Количество санузлов — максимум или по факту помещений
  const bathroomsFromRooms = uniqueRooms.filter(r => r.is_wet_zone).length
  const bathroomsFromData = Math.max(...results.map(r => r.bathrooms_count || 0))
  const bathrooms_count = Math.max(bathroomsFromRooms, bathroomsFromData)
  
  return {
    total_area_m2,
    ceiling_height_m,
    rooms: uniqueRooms,
    bathrooms_count,
    notes: 'Объединённые данные с нескольких страниц плана'
  }
}

// ============================================
// Дедупликация помещений
// ============================================

function deduplicateRooms(rooms: any[]): any[] {
  const map = new Map<string, any>()
  
  for (const room of rooms) {
    const key = `${room.name}_${room.area_m2}`.toLowerCase()
    
    if (!map.has(key)) {
      map.set(key, room)
    } else {
      // Если дубликат, объединяем данные (берём более полный)
      const existing = map.get(key)!
      map.set(key, {
        ...existing,
        perimeter_m: existing.perimeter_m || room.perimeter_m,
        height_m: existing.height_m || room.height_m,
        notes: existing.notes || room.notes
      })
    }
  }
  
  return Array.from(map.values())
}

// ============================================
// Санити-чек с входными параметрами
// ============================================

function performSanityCheck(
  analysis: AnalysisResult,
  hints?: PreuploadHints
): string[] {
  if (!hints) return []
  
  const warnings: string[] = []
  
  // Проверка площади
  const areaDeviation = Math.abs(analysis.total_area_m2 - hints.floor_area_m2) / hints.floor_area_m2
  if (areaDeviation > SANITY_THRESHOLDS.AREA_DEVIATION_PERCENT) {
    warnings.push(
      `Расхождение площади >10%: извлечено ${analysis.total_area_m2}м², указано ${hints.floor_area_m2}м² (${(areaDeviation * 100).toFixed(1)}%)`
    )
  }
  
  // Проверка количества комнат (жилые комнаты, без санузлов и кухни)
  const livingRooms = analysis.rooms.filter(r => 
    !r.is_wet_zone && 
    !r.name.toLowerCase().includes('кухня') &&
    !r.name.toLowerCase().includes('коридор') &&
    !r.name.toLowerCase().includes('холл')
  )
  const roomsDeviation = Math.abs(livingRooms.length - hints.living_rooms_count)
  if (roomsDeviation > SANITY_THRESHOLDS.ROOMS_DEVIATION_ABS) {
    warnings.push(
      `Расхождение количества комнат: извлечено ${livingRooms.length}, указано ${hints.living_rooms_count}`
    )
  }
  
  // Проверка санузлов
  const bathroomsDeviation = Math.abs(analysis.bathrooms_count - hints.bathrooms_count)
  if (bathroomsDeviation > SANITY_THRESHOLDS.BATHROOMS_DEVIATION_ABS) {
    warnings.push(
      `Расхождение количества санузлов: извлечено ${analysis.bathrooms_count}, указано ${hints.bathrooms_count}`
    )
  }
  
  return warnings
}

// ============================================
// Логирование AI запросов
// ============================================

async function logAiRequest(
  projectId: string,
  prompt: string,
  response: string,
  tokensIn: number = 0,
  tokensOut: number = 0
) {
  const model = AI_MODELS.VISION
  const costs = TOKEN_COSTS[model]
  const costUsd = (tokensIn * costs.input) + (tokensOut * costs.output)
  
  await prisma.aiLog.create({
    data: {
      projectId,
      model,
      prompt: prompt.substring(0, 5000), // Обрезаем для БД
      response: response.substring(0, 10000),
      costUsd,
      tokensIn,
      tokensOut
    }
  })
}

