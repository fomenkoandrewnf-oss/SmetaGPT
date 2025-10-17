import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Zap, FileText, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold">SmetaGPT</span>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Войти</Button>
            </Link>
            <Link href="/projects/new">
              <Button>Начать</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI-оценщик строительных проектов
        </h1>
        <p className="text-xl text-zinc-600 mb-8 max-w-2xl mx-auto">
          Загрузите дизайн-проект — получите детальную смету за 3 минуты. 
          Искусственный интеллект анализирует планы и рассчитывает стоимость работ.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/projects/new">
            <Button size="lg" className="gap-2 text-lg px-8 py-6">
              Создать смету
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6">
            Посмотреть пример
          </Button>
        </div>
      </section>
      
      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">Как это работает</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">1. Загрузите план</h3>
            <p className="text-zinc-600">
              Укажите базовые параметры и загрузите дизайн-проект в PDF, JPG или PNG. 
              До 5 страниц за раз.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">2. AI анализирует</h3>
            <p className="text-zinc-600">
              Искусственный интеллект извлекает помещения, площади, высоты и 
              мокрые зоны. Проверяет на расхождения.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">3. Получите смету</h3>
            <p className="text-zinc-600">
              Смета по 11 этапам работ готова. Редактируйте цены и количество, 
              экспортируйте в PDF/XLSX.
            </p>
          </div>
        </div>
      </section>
      
      {/* Benefits */}
      <section className="bg-blue-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Преимущества</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Быстро</h3>
                <p className="text-zinc-600">
                  Смета готова за 3 минуты вместо нескольких часов ручной работы
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Точно</h3>
                <p className="text-zinc-600">
                  AI извлекает метрики из планов и сверяет с вашими параметрами
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Сравнение с рынком</h3>
                <p className="text-zinc-600">
                  Проверяйте свои цены с рыночными медианами по региону
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Каталоги цен</h3>
                <p className="text-zinc-600">
                  Сохраняйте свои расценки и используйте их для новых проектов
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold mb-6">Готовы попробовать?</h2>
        <p className="text-xl text-zinc-600 mb-8 max-w-2xl mx-auto">
          Создайте первую смету бесплатно и оцените возможности AI-оценщика
        </p>
        <Link href="/projects/new">
          <Button size="lg" className="gap-2 text-lg px-8 py-6">
            Начать сейчас
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </section>
      
      {/* Footer */}
      <footer className="border-t bg-zinc-50 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-zinc-600">
          <p>© 2025 SmetaGPT. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
}
