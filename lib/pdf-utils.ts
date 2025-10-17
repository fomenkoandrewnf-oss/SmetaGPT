import { PDFDocument } from 'pdf-lib'
import sharp from 'sharp'

// ============================================
// Конвертация PDF в изображения для OpenAI Vision
// ============================================

export async function convertPdfToImages(
  pdfBuffer: Buffer,
  maxPages: number = 5
): Promise<Buffer[]> {
  // Для MVP используем простой подход:
  // 1. Читаем PDF через pdf-lib
  // 2. Конвертируем каждую страницу в изображение
  
  const pdfDoc = await PDFDocument.load(pdfBuffer)
  const pageCount = Math.min(pdfDoc.getPageCount(), maxPages)
  
  console.log(`📄 PDF содержит ${pdfDoc.getPageCount()} страниц, обрабатываем ${pageCount}`)
  
  const images: Buffer[] = []
  
  for (let i = 0; i < pageCount; i++) {
    console.log(`  Конвертация страницы ${i + 1}/${pageCount}...`)
    
    // Извлекаем страницу
    const singlePageDoc = await PDFDocument.create()
    const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [i])
    singlePageDoc.addPage(copiedPage)
    
    const pdfBytes = await singlePageDoc.save()
    
    // Для реальной конвертации PDF->Image нужна дополнительная библиотека
    // В MVP можно использовать внешний сервис или Playwright
    // Пока заглушка - вернём оригинальный буфер страницы
    images.push(Buffer.from(pdfBytes))
  }
  
  return images
}

// ============================================
// Конвертация изображения в формат для Vision API
// ============================================

export async function optimizeImageForVision(
  imageBuffer: Buffer,
  maxWidth: number = 2000,
  quality: number = 85
): Promise<Buffer> {
  // Оптимизируем размер и качество изображения для Vision API
  return await sharp(imageBuffer)
    .resize(maxWidth, null, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality })
    .toBuffer()
}

// ============================================
// Загрузка изображения в Supabase Storage и получение временного URL
// ============================================

export async function uploadToStorageAndGetUrl(
  buffer: Buffer,
  path: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  // Здесь будет интеграция с Supabase Storage
  // Возвращаем временный публичный URL для Vision API
  
  // TODO: Реализовать загрузку в Supabase
  // const { data, error } = await supabase.storage
  //   .from('project-files')
  //   .upload(path, buffer, { contentType })
  
  // Для MVP - заглушка
  return `https://storage.supabase.co/placeholder/${path}`
}

// ============================================
// Генерация временного подписанного URL (TTL)
// ============================================

export async function generateSignedUrl(
  storagePath: string,
  expiresInSeconds: number = 600 // 10 минут
): Promise<string> {
  // TODO: Реализовать генерацию подписанного URL через Supabase
  // const { data, error } = await supabase.storage
  //   .from('project-files')
  //   .createSignedUrl(storagePath, expiresInSeconds)
  
  return `https://storage.supabase.co/signed/${storagePath}?expires=${expiresInSeconds}`
}

// ============================================
// Валидация файла
// ============================================

export interface FileValidationResult {
  valid: boolean
  error?: string
  mimeType?: string
  sizeBytes?: number
  pageCount?: number
}

export async function validateUploadedFile(
  buffer: Buffer,
  originalName: string,
  maxSizeMB: number = 25
): Promise<FileValidationResult> {
  const sizeBytes = buffer.length
  const sizeMB = sizeBytes / (1024 * 1024)
  
  // Проверка размера
  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `Файл слишком большой: ${sizeMB.toFixed(1)}MB (максимум ${maxSizeMB}MB)`
    }
  }
  
  // Определяем тип файла по заголовку
  const header = buffer.slice(0, 4).toString('hex')
  let mimeType: string
  let pageCount: number | undefined
  
  if (header === '25504446') {
    // PDF
    mimeType = 'application/pdf'
    try {
      const pdfDoc = await PDFDocument.load(buffer)
      pageCount = pdfDoc.getPageCount()
      
      if (pageCount > 20) {
        return {
          valid: false,
          error: `Слишком много страниц: ${pageCount} (максимум 20)`
        }
      }
    } catch (error) {
      return {
        valid: false,
        error: 'Не удалось прочитать PDF файл'
      }
    }
  } else if (header.startsWith('ffd8ff')) {
    // JPEG
    mimeType = 'image/jpeg'
    pageCount = 1
  } else if (header.startsWith('89504e47')) {
    // PNG
    mimeType = 'image/png'
    pageCount = 1
  } else {
    return {
      valid: false,
      error: 'Неподдерживаемый формат файла. Используйте PDF, JPG или PNG'
    }
  }
  
  return {
    valid: true,
    mimeType,
    sizeBytes,
    pageCount
  }
}

