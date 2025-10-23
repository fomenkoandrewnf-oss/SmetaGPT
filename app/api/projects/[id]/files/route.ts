import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateUploadedFile } from '@/lib/pdf-utils'
import { isSupabaseStorageConfigured, uploadProjectFile } from '@/lib/supabase'

// POST /api/projects/:id/files - Загрузить файл
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Файл не предоставлен' },
        { status: 400 }
      )
    }
    
    // Читаем файл
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Валидация
    const validation = await validateUploadedFile(buffer, file.name)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    if (!isSupabaseStorageConfigured) {
      return NextResponse.json(
        { error: 'Supabase Storage не настроен' },
        { status: 500 }
      )
    }

    let storagePath: string

    try {
      const uploadResult = await uploadProjectFile(
        params.id,
        buffer,
        file.name,
        validation.mimeType!
      )

      storagePath = uploadResult.path
    } catch (error) {
      console.error('Ошибка сохранения файла в Supabase Storage:', error)
      return NextResponse.json(
        { error: 'Не удалось сохранить файл в Supabase Storage' },
        { status: 500 }
      )
    }
    
    // Сохраняем в БД
    const projectFile = await prisma.projectFile.create({
      data: {
        projectId: params.id,
        storagePath,
        fileType: validation.mimeType!,
        fileName: file.name,
        fileSize: validation.sizeBytes!,
        pageCount: validation.pageCount
      }
    })
    
    // Обновляем статус проекта
    await prisma.project.update({
      where: { id: params.id },
      data: { status: 'ANALYZING' }
    })
    
    return NextResponse.json({ file: projectFile }, { status: 201 })
  } catch (error) {
    console.error('Ошибка загрузки файла:', error)
    return NextResponse.json(
      { error: 'Не удалось загрузить файл' },
      { status: 500 }
    )
  }
}

