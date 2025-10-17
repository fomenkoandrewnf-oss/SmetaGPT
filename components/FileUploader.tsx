'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FILE_LIMITS } from '@/lib/constants'
import { formatFileSize } from '@/lib/utils'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  onFileRemove?: () => void
  disabled?: boolean
  currentFile?: File | null
}

export function FileUploader({ 
  onFileSelect, 
  onFileRemove, 
  disabled = false,
  currentFile = null
}: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null)
  
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)
    
    // Проверка отклонённых файлов
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`Файл слишком большой. Максимум ${FILE_LIMITS.MAX_SIZE_MB}МБ`)
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Неподдерживаемый формат. Используйте PDF, JPG или PNG')
      } else {
        setError('Ошибка загрузки файла')
      }
      return
    }
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      
      // Дополнительная проверка размера
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > FILE_LIMITS.MAX_SIZE_MB) {
        setError(`Файл слишком большой: ${sizeMB.toFixed(1)}МБ. Максимум ${FILE_LIMITS.MAX_SIZE_MB}МБ`)
        return
      }
      
      onFileSelect(file)
    }
  }, [onFileSelect])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: FILE_LIMITS.MAX_SIZE_MB * 1024 * 1024,
    multiple: false,
    disabled
  })
  
  const handleRemove = () => {
    setError(null)
    onFileRemove?.()
  }
  
  // Если файл уже выбран
  if (currentFile) {
    return (
      <div className="border-2 border-zinc-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">{currentFile.name}</p>
              <p className="text-sm text-zinc-500">
                {formatFileSize(currentFile.size)}
              </p>
            </div>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-zinc-300 hover:border-zinc-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100' : 'bg-zinc-100'}`}>
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-600' : 'text-zinc-600'}`} />
          </div>
          
          <div>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Отпустите файл' : 'Перетащите файл сюда'}
            </p>
            <p className="text-sm text-zinc-500 mb-4">
              или нажмите для выбора
            </p>
            <p className="text-xs text-zinc-400">
              PDF, JPG или PNG • До {FILE_LIMITS.MAX_SIZE_MB}МБ • До {FILE_LIMITS.MAX_PAGES} страниц
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}

