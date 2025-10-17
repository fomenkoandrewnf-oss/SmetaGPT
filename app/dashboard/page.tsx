import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Clock, CheckCircle } from 'lucide-react'
import { formatDate, formatMoney } from '@/lib/utils'

// Это будет Server Component
async function getProjects() {
  // TODO: Заменить на реальный API call с auth
  // const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/projects`, {
  //   headers: { cookie: cookies().toString() }
  // })
  // return res.json()
  
  return { projects: [] } // Mock для разработки
}

export default async function DashboardPage() {
  const { projects } = await getProjects()
  
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Проекты</h1>
              <p className="text-zinc-600 mt-1">
                Управление проектами и сметами
              </p>
            </div>
            <Link href="/projects/new">
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Новый проект
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white border-2 border-dashed rounded-lg p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Нет проектов</h3>
        <p className="text-zinc-600 mb-6">
          Создайте ваш первый проект, чтобы начать работу
        </p>
        <Link href="/projects/new">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Создать проект
          </Button>
        </Link>
      </div>
    </div>
  )
}

function ProjectCard({ project }: { project: any }) {
  const statusConfig = {
    DRAFT: { label: 'Черновик', color: 'bg-zinc-100 text-zinc-700', icon: Clock },
    ANALYZING: { label: 'Анализ', color: 'bg-blue-100 text-blue-700', icon: Clock },
    READY: { label: 'Готов', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    ARCHIVED: { label: 'Архив', color: 'bg-zinc-100 text-zinc-500', icon: FileText }
  }
  
  const status = statusConfig[project.status as keyof typeof statusConfig]
  const StatusIcon = status.icon
  
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-lg">{project.name}</h3>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>
        
        <div className="space-y-2 text-sm text-zinc-600">
          <div className="flex justify-between">
            <span>Площадь:</span>
            <span className="font-medium">{project.floorAreaM2} м²</span>
          </div>
          <div className="flex justify-between">
            <span>Комнат:</span>
            <span className="font-medium">{project.livingRoomsCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Санузлов:</span>
            <span className="font-medium">{project.bathroomsCount}</span>
          </div>
        </div>
        
        {project.estimates?.[0] && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-600">Последняя смета:</span>
              <span className="font-bold text-blue-600">
                {formatMoney(
                  project.estimates[0].items.reduce((sum: number, item: any) => sum + item.total, 0)
                )}
              </span>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-xs text-zinc-500">
          Создан {formatDate(new Date(project.createdAt))}
        </div>
      </div>
    </Link>
  )
}

