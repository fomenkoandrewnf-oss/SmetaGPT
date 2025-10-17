import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { exportToExcel, exportToPdf, prepareEstimateData } from '@/lib/exporter'

// POST /api/estimates/:id/export?format=pdf|xlsx
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'pdf'
    
    if (!['pdf', 'xlsx'].includes(format)) {
      return NextResponse.json(
        { error: 'Неверный формат. Используйте pdf или xlsx' },
        { status: 400 }
      )
    }
    
    // Получаем смету
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
        }
      }
    })
    
    if (!estimate) {
      return NextResponse.json(
        { error: 'Смета не найдена' },
        { status: 404 }
      )
    }
    
    // Подготавливаем данные
    const exportData = prepareEstimateData(
      estimate,
      estimate.project,
      estimate.project.company || undefined
    )
    
    // Генерируем файл
    let buffer: Buffer
    let contentType: string
    let filename: string
    
    if (format === 'xlsx') {
      buffer = await exportToExcel(exportData)
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      filename = `smeta-${estimate.project.name}-${Date.now()}.xlsx`
    } else {
      buffer = await exportToPdf(exportData)
      contentType = 'application/pdf'
      filename = `smeta-${estimate.project.name}-${Date.now()}.pdf`
    }
    
    // Возвращаем файл
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': buffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Ошибка экспорта:', error)
    return NextResponse.json(
      { error: 'Не удалось экспортировать смету', details: String(error) },
      { status: 500 }
    )
  }
}

