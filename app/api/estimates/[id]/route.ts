import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/estimates/:id - Получить смету
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const estimate = await prisma.estimate.findUnique({
      where: { id: params.id },
      include: {
        items: {
          orderBy: [
            { stageCode: 'asc' },
            { workCode: 'asc' }
          ]
        },
        project: {
          include: {
            company: {
              select: {
                name: true,
                logo: true
              }
            }
          }
        },
        catalog: true
      }
    })
    
    if (!estimate) {
      return NextResponse.json(
        { error: 'Смета не найдена' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ estimate })
  } catch (error) {
    console.error('Ошибка получения сметы:', error)
    return NextResponse.json(
      { error: 'Не удалось загрузить смету' },
      { status: 500 }
    )
  }
}

