'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PreuploadHints, PreuploadSchema } from '@/lib/validators'

interface PreUploadFormProps {
  onSubmit: (data: PreuploadHints) => void
  onCancel?: () => void
}

export function PreUploadForm({ onSubmit, onCancel }: PreUploadFormProps) {
  const [formData, setFormData] = useState<PreuploadHints>({
    floor_area_m2: 0,
    living_rooms_count: 1,
    has_kitchen_living: false,
    bathrooms_count: 1
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Валидация через Zod
    const result = PreuploadSchema.safeParse(formData)
    
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.errors.forEach(err => {
        newErrors[err.path[0] as string] = err.message
      })
      setErrors(newErrors)
      return
    }
    
    setErrors({})
    onSubmit(formData)
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Параметры проекта</h2>
        <p className="text-zinc-600">
          Укажите базовые параметры для проверки данных, извлечённых из плана
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Площадь */}
        <div className="space-y-2">
          <Label htmlFor="floor_area_m2">
            Площадь по полу, м² <span className="text-red-500">*</span>
          </Label>
          <Input
            id="floor_area_m2"
            type="number"
            step="0.01"
            min="0"
            value={formData.floor_area_m2 || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              floor_area_m2: parseFloat(e.target.value) || 0
            }))}
            placeholder="Например: 75.5"
          />
          {errors.floor_area_m2 && (
            <p className="text-sm text-red-500">{errors.floor_area_m2}</p>
          )}
        </div>
        
        {/* Количество комнат */}
        <div className="space-y-2">
          <Label htmlFor="living_rooms_count">
            Количество жилых комнат <span className="text-red-500">*</span>
          </Label>
          <Input
            id="living_rooms_count"
            type="number"
            min="0"
            max="20"
            value={formData.living_rooms_count}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              living_rooms_count: parseInt(e.target.value) || 0
            }))}
            placeholder="Например: 3"
          />
          {errors.living_rooms_count && (
            <p className="text-sm text-red-500">{errors.living_rooms_count}</p>
          )}
        </div>
        
        {/* Кухня-гостиная */}
        <div className="space-y-2">
          <Label htmlFor="has_kitchen_living">
            Кухня-гостиная?
          </Label>
          <div className="flex items-center space-x-4 pt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="has_kitchen_living"
                checked={formData.has_kitchen_living === true}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  has_kitchen_living: true
                }))}
                className="w-4 h-4"
              />
              <span>Да</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="has_kitchen_living"
                checked={formData.has_kitchen_living === false}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  has_kitchen_living: false
                }))}
                className="w-4 h-4"
              />
              <span>Нет</span>
            </label>
          </div>
        </div>
        
        {/* Санузлы */}
        <div className="space-y-2">
          <Label htmlFor="bathrooms_count">
            Количество санузлов <span className="text-red-500">*</span>
          </Label>
          <Input
            id="bathrooms_count"
            type="number"
            min="0"
            max="10"
            value={formData.bathrooms_count}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              bathrooms_count: parseInt(e.target.value) || 0
            }))}
            placeholder="Например: 1"
          />
          {errors.bathrooms_count && (
            <p className="text-sm text-red-500">{errors.bathrooms_count}</p>
          )}
        </div>
        
        {/* Высота потолка (опционально) */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ceiling_height_m">
            Высота потолка, м (опционально)
          </Label>
          <Input
            id="ceiling_height_m"
            type="number"
            step="0.01"
            min="0"
            max="5"
            value={formData.ceiling_height_m || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              ceiling_height_m: e.target.value ? parseFloat(e.target.value) : undefined
            }))}
            placeholder="Например: 2.7"
          />
          {errors.ceiling_height_m && (
            <p className="text-sm text-red-500">{errors.ceiling_height_m}</p>
          )}
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button type="submit" size="lg">
          Продолжить
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" size="lg" onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  )
}

