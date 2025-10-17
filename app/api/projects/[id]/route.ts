import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/projects/:id - Детали проекта
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        files: {
          orderBy: { createdAt: 'desc' }
        },
        analysis: true,
        rooms: {
          orderBy: { name: 'asc' }
        },
        estimates: {
          include: {
            items: {
              orderBy: [
                { stageCode: 'asc' },
                { workCode: 'asc' }
              ]
            },
            catalog: true
          },
          orderBy: { createdAt: 'desc' }
        },
        company: {
          select: {
            name: true,
            logo: true
          }
        }
      }
    })
    
    if (!project) {
      return NextResponse.json(
        { error: 'Проект не найден' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ project })
  } catch (error) {
    console.error('Ошибка получения проекта:', error)
    return NextResponse.json(
      { error: 'Не удалось загрузить проект' },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/:id - Обновить проект
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...body.name && { name: body.name },
        ...body.status && { status: body.status }
      }
    })
    
    return NextResponse.json({ project })
  } catch (error) {
    console.error('Ошибка обновления проекта:', error)
    return NextResponse.json(
      { error: 'Не удалось обновить проект' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/:id - Удалить проект
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.project.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка удаления проекта:', error)
    return NextResponse.json(
      { error: 'Не удалось удалить проект' },
      { status: 500 }
    )
  }
}

