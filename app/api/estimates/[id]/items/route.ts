import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { UpdateEstimateItemsSchema } from '@/lib/validators'

// PATCH /api/estimates/:id/items - Обновить строки сметы
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Валидация
    const result = UpdateEstimateItemsSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Неверные данные', details: result.error.errors },
        { status: 400 }
      )
    }
    
    const updates = result.data
    
    // Обновляем каждую строку
    for (const update of updates) {
      const item = await prisma.estimateItem.findUnique({
        where: { id: update.id }
      })
      
      if (!item) continue
      
      const qty = update.qty !== undefined ? update.qty : item.qty
      const unitPrice = update.unit_price !== undefined ? update.unit_price : item.unitPrice
      const total = qty * unitPrice
      
      await prisma.estimateItem.update({
        where: { id: update.id },
        data: {
          qty,
          unitPrice,
          total
        }
      })
    }
    
    // Обновляем timestamp сметы
    await prisma.estimate.update({
      where: { id: params.id },
      data: { updatedAt: new Date() }
    })
    
    // Возвращаем обновлённую смету
    const estimate = await prisma.estimate.findUnique({
      where: { id: params.id },
      include: {
        items: {
          orderBy: [
            { stageCode: 'asc' },
            { workCode: 'asc' }
          ]
        }
      }
    })
    
    return NextResponse.json({ estimate })
  } catch (error) {
    console.error('Ошибка обновления сметы:', error)
    return NextResponse.json(
      { error: 'Не удалось обновить смету' },
      { status: 500 }
    )
  }
}

