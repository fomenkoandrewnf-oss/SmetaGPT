import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const envFile = process.env.SUPABASE_ENV_FILE ?? '.env.local'
const envPath = resolve(process.cwd(), envFile)

if (existsSync(envPath)) {
  loadEnv({ path: envPath })
  console.log(`ℹ️  Загружены переменные окружения из ${envFile}`)
} else {
  console.log('ℹ️  Файл окружения не найден, используем переменные из текущей среды')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Не заданы NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

try {
  const { data: buckets, error } = await supabase.storage.listBuckets()

  if (error) {
    console.error('❌ Ошибка подключения к Supabase:', error.message)
    process.exit(1)
  }

  console.log(`✅ Подключение к Supabase выполнено. Доступно бакетов: ${buckets?.length ?? 0}`)

  const hasProjectFilesBucket = buckets?.some((bucket) => bucket.name === 'project-files')

  if (!hasProjectFilesBucket) {
    console.warn('⚠️  Bucket "project-files" не найден. Создайте его в Supabase Storage.')
  } else {
    console.log('✅ Bucket "project-files" доступен.')
  }

  process.exit(0)
} catch (error) {
  console.error('❌ Не удалось выполнить проверку Supabase:', error)
  process.exit(1)
}
