'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PreUploadForm } from '@/components/PreUploadForm'
import { FileUploader } from '@/components/FileUploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PreuploadHints } from '@/lib/validators'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState<'name' | 'params' | 'file'>('name')
  const [projectName, setProjectName] = useState('')
  const [params, setParams] = useState<PreuploadHints | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (projectName.trim()) {
      setStep('params')
    }
  }
  
  const handleParamsSubmit = (data: PreuploadHints) => {
    setParams(data)
    setStep('file')
  }
  
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
  }
  
  const handleCreateProject = async () => {
    if (!projectName || !params || !file) return
    
    setLoading(true)
    setError(null)
    
    try {
      // 1. Создаём проект
      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          ...params
        })
      })
      
      if (!projectRes.ok) {
        throw new Error('Не удалось создать проект')
      }
      
      const { project } = await projectRes.json()
      
      // 2. Загружаем файл
      const formData = new FormData()
      formData.append('file', file)
      
      const fileRes = await fetch(`/api/projects/${project.id}/files`, {
        method: 'POST',
        body: formData
      })
      
      if (!fileRes.ok) {
        throw new Error('Не удалось загрузить файл')
      }
      
      const { file: uploadedFile } = await fileRes.json()
      
      // 3. Запускаем анализ
      const analyzeRes = await fetch(`/api/projects/${project.id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: uploadedFile.id,
          usePreuploadHints: true
        })
      })
      
      if (!analyzeRes.ok) {
        throw new Error('Не удалось проанализировать файл')
      }
      
      // Переходим на страницу проекта
      router.push(`/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Назад к проектам
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Новый проект</h1>
          <p className="text-zinc-600 mt-1">
            Создайте проект и загрузите дизайн-план
          </p>
        </div>
      </header>
      
      {/* Steps indicator */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-2">
            <StepIndicator number={1} label="Название" active={step === 'name'} completed={step !== 'name'} />
            <div className="w-12 h-0.5 bg-zinc-300" />
            <StepIndicator number={2} label="Параметры" active={step === 'params'} completed={step === 'file'} />
            <div className="w-12 h-0.5 bg-zinc-300" />
            <StepIndicator number={3} label="Файл" active={step === 'file'} completed={false} />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {step === 'name' && (
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectName">
                  Название проекта <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Например: Квартира на Ленинском"
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" size="lg">
                Продолжить
              </Button>
            </form>
          )}
          
          {step === 'params' && (
            <PreUploadForm
              onSubmit={handleParamsSubmit}
              onCancel={() => setStep('name')}
            />
          )}
          
          {step === 'file' && (
            <div className="space-y-6">
              <FileUploader
                onFileSelect={handleFileSelect}
                onFileRemove={() => setFile(null)}
                currentFile={file}
                disabled={loading}
              />
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                  {error}
                </div>
              )}
              
              <div className="flex gap-4">
                <Button
                  onClick={handleCreateProject}
                  disabled={!file || loading}
                  size="lg"
                  className="gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Создание проекта...' : 'Создать проект'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep('params')}
                  disabled={loading}
                >
                  Назад
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StepIndicator({ 
  number, 
  label, 
  active, 
  completed 
}: { 
  number: number
  label: string
  active: boolean
  completed: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center font-semibold
        ${completed ? 'bg-green-600 text-white' : ''}
        ${active ? 'bg-blue-600 text-white' : ''}
        ${!active && !completed ? 'bg-zinc-200 text-zinc-600' : ''}
      `}>
        {completed ? '✓' : number}
      </div>
      <span className={`text-sm font-medium ${active ? 'text-blue-600' : 'text-zinc-600'}`}>
        {label}
      </span>
    </div>
  )
}

