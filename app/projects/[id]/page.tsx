import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RoomPreview } from '@/components/RoomPreview'
import { ArrowLeft, Download, FileText, Plus } from 'lucide-react'
import { formatDate, formatMoney, formatNumber } from '@/lib/utils'

async function getProject(id: string) {
  // TODO: Заменить на реальный API call
  // const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${id}`)
  // return res.json()
  
  return {
    project: {
      id,
      name: 'Пример проекта',
      status: 'READY',
      floorAreaM2: 75.5,
      livingRoomsCount: 3,
      hasKitchenLiving: true,
      bathroomsCount: 2,
      ceilingHeightM: 2.7,
      createdAt: new Date(),
      analysis: {
        totalAreaM2: 76.2,
        ceilingHeightM: 2.7,
        roomsCount: 5,
        bathroomsCount: 2,
        hasWarnings: true
      },
      rooms: [
        { name: 'Спальня 1', areaM2: 15.5, perimeterM: 16.0, isWetZone: false, heightM: 2.7 },
        { name: 'Гостиная', areaM2: 25.0, perimeterM: 20.0, isWetZone: false, heightM: 2.7 },
        { name: 'Санузел', areaM2: 4.5, perimeterM: 9.0, isWetZone: true, heightM: 2.7 }
      ],
      estimates: []
    }
  }
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const { project } = await getProject(params.id)
  
  const warnings = project.analysis?.hasWarnings 
    ? ['Расхождение площади >10%: извлечено 76.2м², указано 75.5м²']
    : []
  
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Назад к проектам
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <div className="flex items-center gap-6 mt-2 text-sm text-zinc-600">
                <span>Площадь: {formatNumber(project.floorAreaM2)} м²</span>
                <span>Комнат: {project.livingRoomsCount}</span>
                <span>Санузлов: {project.bathroomsCount}</span>
                <span>Создан {formatDate(project.createdAt)}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {project.estimates.length > 0 && (
                <Link href={`/estimates/${project.estimates[0].id}`}>
                  <Button variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Смета
                  </Button>
                </Link>
              )}
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Создать смету
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Анализ */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6">Анализ плана</h2>
          
          {project.analysis ? (
            <RoomPreview rooms={project.rooms} warnings={warnings} />
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-600 mb-4">Анализ не выполнен</p>
              <Button>Запустить анализ</Button>
            </div>
          )}
        </section>
        
        {/* Сметы */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Сметы</h2>
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Новая смета
            </Button>
          </div>
          
          {project.estimates.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <FileText className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-600 mb-4">Нет смет</p>
              <Button>Создать смету</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {project.estimates.map((estimate: any) => (
                <Link key={estimate.id} href={`/estimates/${estimate.id}`}>
                  <div className="border rounded-lg p-4 hover:bg-zinc-50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Версия {estimate.version}</p>
                        <p className="text-sm text-zinc-600">
                          {formatDate(estimate.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatMoney(estimate.items.reduce((sum: number, item: any) => sum + item.total, 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

