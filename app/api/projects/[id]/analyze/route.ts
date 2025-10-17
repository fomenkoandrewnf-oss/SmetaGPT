import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { analyzeDesignFile } from '@/lib/ai-analyze'
import { SANITY_THRESHOLDS } from '@/lib/constants'

// POST /api/projects/:id/analyze - Запустить AI-анализ
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { fileId, usePreuploadHints = true } = body
    
    // Получаем проект
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        files: true
      }
    })
    
    if (!project) {
      return NextResponse.json(
        { error: 'Проект не найден' },
        { status: 404 }
      )
    }
    
    // Получаем файл
    const file = project.files.find(f => f.id === fileId) || project.files[0]
    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 404 }
      )
    }
    
    // TODO: Конвертировать PDF в изображения и загрузить
    // const imageUrls = await convertAndUploadImages(file.storagePath)
    
    // MOCK для MVP
    const imageUrls = [
      `https://example.com/mock/${file.id}/page-1.jpg`,
      `https://example.com/mock/${file.id}/page-2.jpg`
    ]
    
    // Подготовка hints
    const hints = usePreuploadHints ? {
      floor_area_m2: project.floorAreaM2,
      living_rooms_count: project.livingRoomsCount,
      has_kitchen_living: project.hasKitchenLiving,
      bathrooms_count: project.bathroomsCount,
      ceiling_height_m: project.ceilingHeightM || undefined
    } : undefined
    
    // Запускаем анализ
    console.log(`🚀 Запуск AI-анализа для проекта ${params.id}`)
    
    const analysisResult = await analyzeDesignFile({
      projectId: params.id,
      fileId: file.id,
      imageUrls,
      hints
    })
    
    // Вычисляем отклонения
    const areaDeviation = hints 
      ? (analysisResult.total_area_m2 - hints.floor_area_m2) / hints.floor_area_m2 
      : 0
    
    const roomsDeviation = hints
      ? analysisResult.rooms.length - hints.living_rooms_count
      : 0
    
    const bathroomsDeviation = hints
      ? analysisResult.bathrooms_count - hints.bathrooms_count
      : 0
    
    const hasWarnings = analysisResult.warnings.length > 0
    
    // Сохраняем анализ в БД
    const analysis = await prisma.projectAnalysis.upsert({
      where: { projectId: params.id },
      create: {
        projectId: params.id,
        aiModel: 'gpt-4o-mini',
        rawJson: analysisResult,
        totalAreaM2: analysisResult.total_area_m2,
        ceilingHeightM: analysisResult.ceiling_height_m,
        roomsCount: analysisResult.rooms.length,
        bathroomsCount: analysisResult.bathrooms_count,
        areaDeviation,
        roomsDeviation,
        bathroomsDeviation,
        hasWarnings
      },
      update: {
        rawJson: analysisResult,
        totalAreaM2: analysisResult.total_area_m2,
        ceilingHeightM: analysisResult.ceiling_height_m,
        roomsCount: analysisResult.rooms.length,
        bathroomsCount: analysisResult.bathrooms_count,
        areaDeviation,
        roomsDeviation,
        bathroomsDeviation,
        hasWarnings
      }
    })
    
    // Сохраняем помещения
    await prisma.room.deleteMany({
      where: { projectId: params.id }
    })
    
    await prisma.room.createMany({
      data: analysisResult.rooms.map(room => ({
        projectId: params.id,
        name: room.name,
        areaM2: room.area_m2,
        perimeterM: room.perimeter_m,
        isWetZone: room.is_wet_zone || false,
        heightM: room.height_m,
        notes: room.notes
      }))
    })
    
    // Обновляем статус проекта
    await prisma.project.update({
      where: { id: params.id },
      data: { status: 'READY' }
    })
    
    return NextResponse.json({
      analysis,
      warnings: analysisResult.warnings,
      rooms: analysisResult.rooms
    })
  } catch (error) {
    console.error('Ошибка анализа:', error)
    
    // Обновляем статус на ошибку
    await prisma.project.update({
      where: { id: params.id },
      data: { status: 'DRAFT' }
    })
    
    return NextResponse.json(
      { error: 'Не удалось проанализировать файл', details: String(error) },
      { status: 500 }
    )
  }
}

// GET /api/projects/:id/analyze - Получить результаты анализа
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysis = await prisma.projectAnalysis.findUnique({
      where: { projectId: params.id },
      include: {
        project: {
          include: {
            rooms: true
          }
        }
      }
    })
    
    if (!analysis) {
      return NextResponse.json(
        { error: 'Анализ не найден' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Ошибка получения анализа:', error)
    return NextResponse.json(
      { error: 'Не удалось загрузить анализ' },
      { status: 500 }
    )
  }
}

