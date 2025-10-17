import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateAllWorks, CalculationContext } from '@/lib/rules'

// POST /api/estimates - Создать смету
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, catalogId } = body
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId обязателен' },
        { status: 400 }
      )
    }
    
    // Получаем проект с анализом и помещениями
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        analysis: true,
        rooms: true,
        company: true
      }
    })
    
    if (!project) {
      return NextResponse.json(
        { error: 'Проект не найден' },
        { status: 404 }
      )
    }
    
    if (!project.analysis) {
      return NextResponse.json(
        { error: 'Сначала нужно проанализировать проект' },
        { status: 400 }
      )
    }
    
    // Получаем или создаём дефолтный каталог цен
    let catalog = catalogId 
      ? await prisma.priceCatalog.findUnique({
          where: { id: catalogId },
          include: { items: true }
        })
      : await prisma.priceCatalog.findFirst({
          where: { 
            companyId: project.companyId || undefined,
            isDefault: true
          },
          include: { items: true }
        })
    
    if (!catalog && project.companyId) {
      // Создаём дефолтный каталог для компании
      catalog = await prisma.priceCatalog.create({
        data: {
          companyId: project.companyId,
          name: 'Базовый каталог',
          isDefault: true,
          items: {
            create: [] // Будет заполнен через seed
          }
        },
        include: { items: true }
      })
    }
    
    if (!catalog) {
      return NextResponse.json(
        { error: 'Каталог цен не найден' },
        { status: 404 }
      )
    }
    
    // Подготавливаем контекст для расчёта
    const context: CalculationContext = {
      area_total: project.analysis.totalAreaM2 || project.floorAreaM2,
      ceiling_height_m: project.analysis.ceilingHeightM || project.ceilingHeightM || 2.7,
      rooms: project.rooms.map(r => ({
        name: r.name,
        area_m2: r.areaM2,
        perimeter_m: r.perimeterM || undefined,
        is_wet_zone: r.isWetZone,
        height_m: r.heightM || undefined
      })),
      bathrooms_count: project.analysis.bathroomsCount || project.bathroomsCount,
      has_kitchen_living: project.hasKitchenLiving,
      hints: {
        floor_area_m2: project.floorAreaM2,
        living_rooms_count: project.livingRoomsCount,
        has_kitchen_living: project.hasKitchenLiving,
        bathrooms_count: project.bathroomsCount,
        ceiling_height_m: project.ceilingHeightM
      }
    }
    
    // Вычисляем все работы
    const workItems = calculateAllWorks(context)
    
    // TODO: Получить userId из сессии
    const userId = request.headers.get('x-user-id') || 'temp-user-id'
    
    // Создаём смету
    const estimate = await prisma.estimate.create({
      data: {
        projectId,
        catalogId: catalog.id,
        createdById: userId,
        version: 1
      }
    })
    
    // Создаём строки сметы с ценами из каталога
    const estimateItems = workItems.map(work => {
      const priceItem = catalog!.items.find(
        item => item.stageCode === work.stage_code && item.workCode === work.work_code
      )
      
      const unitPrice = priceItem 
        ? priceItem.basePrice * (1 + work.base_coef)
        : 0
      
      const total = work.qty * unitPrice
      
      return {
        estimateId: estimate.id,
        stageCode: work.stage_code,
        workCode: work.work_code,
        name: work.name,
        unit: work.unit,
        qty: work.qty,
        unitPrice,
        total,
        metaJson: {
          base_coef: work.base_coef,
          notes: work.notes
        }
      }
    })
    
    await prisma.estimateItem.createMany({
      data: estimateItems
    })
    
    // Получаем полную смету
    const fullEstimate = await prisma.estimate.findUnique({
      where: { id: estimate.id },
      include: {
        items: {
          orderBy: [
            { stageCode: 'asc' },
            { workCode: 'asc' }
          ]
        },
        project: true,
        catalog: true
      }
    })
    
    return NextResponse.json({ estimate: fullEstimate }, { status: 201 })
  } catch (error) {
    console.error('Ошибка создания сметы:', error)
    return NextResponse.json(
      { error: 'Не удалось создать смету', details: String(error) },
      { status: 500 }
    )
  }
}

