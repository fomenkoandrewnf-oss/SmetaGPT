import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CreateProjectSchema } from '@/lib/validators'

// GET /api/projects - Список проектов
export async function GET(request: NextRequest) {
  try {
    // TODO: Получить userId из сессии
    const userId = request.headers.get('x-user-id') || 'temp-user-id'
    
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        files: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        estimates: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Ошибка получения проектов:', error)
    return NextResponse.json(
      { error: 'Не удалось загрузить проекты' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Создать проект
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Валидация
    const result = CreateProjectSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Неверные данные', details: result.error.errors },
        { status: 400 }
      )
    }
    
    const data = result.data
    
    // TODO: Получить userId и companyId из сессии
    const userId = request.headers.get('x-user-id') || 'temp-user-id'
    const companyId = request.headers.get('x-company-id') || null
    
    // Создаём проект
    const project = await prisma.project.create({
      data: {
        userId,
        companyId,
        name: data.name,
        floorAreaM2: data.floor_area_m2,
        livingRoomsCount: data.living_rooms_count,
        hasKitchenLiving: data.has_kitchen_living,
        bathroomsCount: data.bathrooms_count,
        ceilingHeightM: data.ceiling_height_m,
        status: 'DRAFT'
      }
    })
    
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Ошибка создания проекта:', error)
    return NextResponse.json(
      { error: 'Не удалось создать проект' },
      { status: 500 }
    )
  }
}

