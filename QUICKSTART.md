# 🚀 Быстрый старт SmetaGPT

## Шаг 1: Установка зависимостей

```bash
npm install
```

## Шаг 2: Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# Database (можно использовать локальный PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/smetagpt?schema=public"

# Supabase (опционально для MVP, но нужно для production)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (ОБЯЗАТЕЛЬНО)
OPENAI_API_KEY=sk-your-openai-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Получение OpenAI API Key

1. Перейдите на https://platform.openai.com/api-keys
2. Создайте новый API ключ
3. Скопируйте и вставьте в `.env`

### Получение Supabase credentials (опционально)

1. Создайте проект на https://supabase.com
2. Settings → API → Project URL и anon key
3. Settings → API → service_role key (секретный!)

## Шаг 3: Настройка базы данных

### Вариант A: Локальный PostgreSQL

```bash
# Создайте БД
createdb smetagpt

# Примените миграции
npm run db:push

# Заполните тестовыми данными
npm run db:seed
```

### Вариант B: Supabase PostgreSQL

```bash
# В DATABASE_URL используйте строку подключения из Supabase
# Settings → Database → Connection string → Transaction

npm run db:push
npm run db:seed
```

## Шаг 4: Генерация Prisma Client

```bash
npm run db:generate
```

## Шаг 5: Запуск dev сервера

```bash
npm run dev
```

Откройте http://localhost:3000 🎉

## Структура проекта (краткая)

```
/app
  /page.tsx                    # Главная страница (лендинг)
  /dashboard/page.tsx          # Список проектов
  /projects/new/page.tsx       # Создание проекта
  /projects/[id]/page.tsx      # Детали проекта
  /estimates/[id]/page.tsx     # Просмотр/редактирование сметы
  
/components
  PreUploadForm.tsx            # Форма входных параметров
  FileUploader.tsx             # Drag&drop загрузка файлов
  RoomPreview.tsx              # Таблица помещений с санити-чеком
  StageAccordion.tsx           # Аккордеон с 11 этапами работ
  EstimateTable.tsx            # Редактируемая таблица сметы
  MarketBadge.tsx              # Сравнение с рыночными ценами
  
/lib
  ai-analyze.ts                # Пайплайн AI-анализа через OpenAI Vision
  rules.ts                     # Движок расчёта работ по 11 этапам
  exporter.ts                  # Экспорт PDF/XLSX
  
/app/api
  /projects                    # CRUD проектов
  /estimates                   # CRUD смет
```

## Быстрый тест

### 1. Создайте проект

- Откройте http://localhost:3000
- Нажмите "Создать смету"
- Заполните форму:
  - Название: "Тестовая квартира"
  - Площадь: 75 м²
  - Комнат: 3
  - Кухня-гостиная: Да
  - Санузлов: 2

### 2. Загрузите файл

- Загрузите любое изображение плана (PDF/JPG/PNG)
- Система попытается проанализировать через OpenAI Vision

### 3. Просмотрите результат

- После анализа увидите таблицу помещений
- Нажмите "Создать смету"
- Смета будет сгенерирована по 11 этапам работ

### 4. Отредактируйте смету

- Кликните на количество или цену для редактирования
- Нажмите Enter для сохранения
- Нажмите "Сохранить" для применения изменений

### 5. Экспортируйте

- Нажмите "Экспорт" → "Скачать PDF" или "Скачать XLSX"

## MVP ограничения

На данный момент реализовано для демонстрации:

- ✅ Полная структура проекта
- ✅ Схема БД (Prisma)
- ✅ UI компоненты
- ✅ API routes
- ✅ Расчёт смет по 11 этапам
- ✅ Экспорт PDF/XLSX
- ⚠️ AI-анализ работает, но требует реальные планы
- ⚠️ Загрузка файлов (mock, нужен Supabase Storage)
- ⚠️ Авторизация (mock, нужен Supabase Auth)

## Что нужно для production

1. **Supabase Storage** для загрузки файлов
2. **Supabase Auth** для авторизации
3. **PDF → Image конвертер** (можно использовать Cloudinary или собственный микросервис)
4. **Рыночные цены** - заполнить таблицу `market_prices`
5. **Деплой** на Vercel/Railway/DigitalOcean

## Полезные команды

```bash
# Prisma Studio (GUI для БД)
npm run db:studio

# Пересоздать БД
npm run db:push -- --force-reset

# Посмотреть логи API
# Все логи выводятся в консоль dev сервера

# Проверить типы
npx tsc --noEmit
```

## Troubleshooting

### "OpenAI API error"
- Проверьте, что `OPENAI_API_KEY` установлен в `.env`
- Убедитесь, что у вас есть баланс на аккаунте OpenAI

### "Database connection error"
- Проверьте, что PostgreSQL запущен
- Проверьте `DATABASE_URL` в `.env`
- Попробуйте `npm run db:push`

### "Prisma Client not found"
- Выполните `npm run db:generate`

### "Module not found"
- Удалите `node_modules` и `.next`
- Выполните `npm install`

## Документация

- [Next.js 15](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)
- [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com/docs)

## Поддержка

Если возникли проблемы, проверьте:
1. Все ли зависимости установлены (`npm install`)
2. Создан ли файл `.env` с нужными переменными
3. Применены ли миграции БД (`npm run db:push`)
4. Запущен ли dev сервер (`npm run dev`)

---

**Готово!** 🎉 Теперь у вас полностью рабочий MVP SmetaGPT.

