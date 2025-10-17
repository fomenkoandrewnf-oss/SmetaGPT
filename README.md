# SmetaGPT - AI-оценщик строительных проектов

## О проекте

SaaS-платформа для быстрого расчёта смет по дизайн-проектам с использованием искусственного интеллекта (OpenAI Vision).

### Основные возможности

- 📄 Загрузка дизайн-проектов (PDF, JPG, PNG)
- 🤖 AI-анализ планов через OpenAI Vision API
- 📊 Автоматический расчёт смет по 11 этапам работ
- ✏️ Редактирование количества и цен
- 📈 Сравнение с рыночными ценами
- 📁 Каталоги цен компании
- 📤 Экспорт в PDF и XLSX

## Технологический стек

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes
- **База данных**: PostgreSQL + Prisma ORM
- **AI**: OpenAI API (gpt-4o-mini Vision)
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth
- **Экспорт**: ExcelJS, Playwright (PDF)

## Установка

### Требования

- Node.js 18+
- PostgreSQL 14+
- OpenAI API Key
- Supabase Account (опционально)

### Шаги установки

1. **Клонировать репозиторий**
```bash
git clone <repository-url>
cd SmetaGPT
```

2. **Установить зависимости**
```bash
npm install
```

3. **Настроить переменные окружения**

Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

Заполните переменные:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smetagpt"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Настроить базу данных**
```bash
# Применить миграции
npx prisma migrate dev

# Заполнить тестовыми данными
npx prisma db seed
```

5. **Запустить dev сервер**
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## Структура проекта

```
/app
  /(auth)/login          # Авторизация
  /dashboard             # Список проектов
  /projects/new          # Создание проекта
  /projects/[id]         # Детали проекта
  /estimates/[id]        # Просмотр/редактирование сметы
  /api                   # API Routes
    /projects            # CRUD проектов
    /estimates           # CRUD смет
    /prices              # Каталоги цен
    /market              # Рыночные цены

/components
  /ui                    # shadcn/ui компоненты
  PreUploadForm.tsx      # Форма входных параметров
  FileUploader.tsx       # Загрузка файлов
  RoomPreview.tsx        # Таблица помещений
  StageAccordion.tsx     # Аккордеон с этапами работ
  EstimateTable.tsx      # Таблица сметы
  MarketBadge.tsx        # Сравнение с рынком

/lib
  db.ts                  # Prisma client
  validators.ts          # Zod схемы валидации
  constants.ts           # Константы (этапы, коды и т.д.)
  ai-client.ts           # OpenAI клиент
  ai-prompts.ts          # Промпты для Vision API
  ai-analyze.ts          # Пайплайн анализа
  rules.ts               # Движок расчёта работ
  exporter.ts            # Экспорт PDF/XLSX
  pdf-utils.ts           # Утилиты для PDF
  supabase.ts            # Supabase клиент
  utils.ts               # Общие утилиты

/prisma
  schema.prisma          # Схема БД
  seed.ts                # Seed данные
```

## Этапы работ

1. **MASONRY** - Кладка стен
2. **PLASTER** - Штукатурка стен
3. **ELEC_ROUGH** - Черновая электрика
4. **PLUMB_ROUGH** - Черновая сантехника
5. **SCREED** - Стяжка
6. **GKL** - ГКЛ (перегородки/потолки/короба)
7. **TILE** - Плитка (пол/стены)
8. **PAINT_PREP** - Подготовка стен под окраску
9. **FLOOR** - Напольное покрытие
10. **PAINT** - Окраска стен/потолков
11. **FINISH** - Финишные работы

## API Endpoints

### Проекты
- `GET /api/projects` - Список проектов
- `POST /api/projects` - Создать проект
- `GET /api/projects/:id` - Детали проекта
- `PATCH /api/projects/:id` - Обновить проект
- `DELETE /api/projects/:id` - Удалить проект

### Файлы
- `POST /api/projects/:id/files` - Загрузить файл

### Анализ
- `POST /api/projects/:id/analyze` - Запустить AI-анализ
- `GET /api/projects/:id/analyze` - Получить результаты

### Сметы
- `POST /api/estimates` - Создать смету
- `GET /api/estimates/:id` - Получить смету
- `PATCH /api/estimates/:id/items` - Обновить строки
- `POST /api/estimates/:id/export?format=pdf|xlsx` - Экспортировать

## Roadmap

### M0 (MVP)
- [x] Базовая структура проекта
- [x] Схема БД
- [x] Pre-Upload форма
- [x] AI-анализ через OpenAI Vision
- [x] Расчёт смет по 11 этапам
- [x] Редактирование смет
- [x] Экспорт PDF/XLSX
- [ ] Деплой на production

### M1
- [ ] Полная интеграция Supabase Auth
- [ ] Supabase Storage для файлов
- [ ] Роли пользователей
- [ ] Market compare
- [ ] Улучшение UI/UX

### M2
- [ ] Импорт/экспорт каталогов цен
- [ ] Расширенная аналитика
- [ ] История версий смет
- [ ] Шаринг ссылок на сметы

### M3
- [ ] Поддержка DWG файлов
- [ ] Расширенные узлы (двери/окна/проёмы)
- [ ] Multi-tenancy для компаний
- [ ] Интеграция с 1С

## Лицензия

Proprietary

## Контакты

- Email: contact@smetagpt.ru
- Website: https://smetagpt.ru
