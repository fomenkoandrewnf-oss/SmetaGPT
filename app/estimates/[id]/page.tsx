'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StageAccordion } from '@/components/StageAccordion'
import { ArrowLeft, Download, Save, Loader2 } from 'lucide-react'
import { formatDate, formatMoney } from '@/lib/utils'
import { useParams } from 'next/navigation'

export default function EstimatePage() {
  const params = useParams()
  const estimateId = params.id as string
  
  const [estimate, setEstimate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [changes, setChanges] = useState<Map<string, { qty?: number; unitPrice?: number }>>(new Map())
  
  useEffect(() => {
    loadEstimate()
  }, [estimateId])
  
  const loadEstimate = async () => {
    try {
      const res = await fetch(`/api/estimates/${estimateId}`)
      if (res.ok) {
        const data = await res.json()
        setEstimate(data.estimate)
      }
    } catch (error) {
      console.error('Ошибка загрузки сметы:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleItemUpdate = (itemId: string, field: 'qty' | 'unitPrice', value: number) => {
    setChanges(prev => {
      const newChanges = new Map(prev)
      const current = newChanges.get(itemId) || {}
      newChanges.set(itemId, {
        ...current,
        [field === 'qty' ? 'qty' : 'unit_price']: value
      })
      return newChanges
    })
  }
  
  const handleSave = async () => {
    if (changes.size === 0) return
    
    setSaving(true)
    try {
      const updates = Array.from(changes.entries()).map(([id, data]) => ({
        id,
        ...data
      }))
      
      const res = await fetch(`/api/estimates/${estimateId}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (res.ok) {
        const data = await res.json()
        setEstimate(data.estimate)
        setChanges(new Map())
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error)
    } finally {
      setSaving(false)
    }
  }
  
  const handleExport = async (format: 'pdf' | 'xlsx') => {
    setExporting(true)
    try {
      const res = await fetch(`/api/estimates/${estimateId}/export?format=${format}`, {
        method: 'POST'
      })
      
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `smeta-${estimateId}.${format}`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Ошибка экспорта:', error)
    } finally {
      setExporting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }
  
  if (!estimate) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-zinc-600 mb-4">Смета не найдена</p>
          <Link href="/dashboard">
            <Button>Вернуться к проектам</Button>
          </Link>
        </div>
      </div>
    )
  }
  
  const hasChanges = changes.size > 0
  
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href={`/projects/${estimate.project.id}`}>
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Назад к проекту
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{estimate.project.name}</h1>
              <p className="text-zinc-600 mt-1">
                Смета • Версия {estimate.version} • {formatDate(estimate.createdAt)}
              </p>
            </div>
            
            <div className="flex gap-2">
              {hasChanges && (
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" />
                  Сохранить
                </Button>
              )}
              
              <div className="relative group">
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={exporting}
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Экспорт
                </Button>
                
                <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg hidden group-hover:block">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="block w-full text-left px-4 py-2 hover:bg-zinc-50"
                    disabled={exporting}
                  >
                    Скачать PDF
                  </button>
                  <button
                    onClick={() => handleExport('xlsx')}
                    className="block w-full text-left px-4 py-2 hover:bg-zinc-50"
                    disabled={exporting}
                  >
                    Скачать XLSX
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {hasChanges && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm text-yellow-800">
              У вас есть несохранённые изменения
            </div>
          )}
        </div>
      </header>
      
      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <StageAccordion
          items={estimate.items}
          onItemUpdate={handleItemUpdate}
          readonly={false}
        />
      </main>
    </div>
  )
}

