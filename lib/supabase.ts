import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase публичные ключи не настроены (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)')
}

if (!supabaseServiceRoleKey) {
  console.warn('⚠️  Supabase service role ключ не настроен (SUPABASE_SERVICE_ROLE_KEY) — загрузка файлов будет недоступна')
}

let cachedPublicClient: SupabaseClient | null = null
let cachedServiceClient: SupabaseClient | null = null

function createSupabaseClient(key: string): SupabaseClient {
  if (!supabaseUrl) {
    throw new Error('Supabase URL не задан. Укажите NEXT_PUBLIC_SUPABASE_URL в окружении.')
  }

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseAnonKey) {
    throw new Error('Supabase anon ключ не задан. Укажите NEXT_PUBLIC_SUPABASE_ANON_KEY в окружении.')
  }

  if (!cachedPublicClient) {
    cachedPublicClient = createSupabaseClient(supabaseAnonKey)
  }

  return cachedPublicClient
}

export function getSupabaseServiceRoleClient(): SupabaseClient {
  if (!supabaseServiceRoleKey) {
    throw new Error('Supabase service role ключ не задан. Укажите SUPABASE_SERVICE_ROLE_KEY в окружении.')
  }

  if (!cachedServiceClient) {
    cachedServiceClient = createSupabaseClient(supabaseServiceRoleKey)
  }

  return cachedServiceClient
}

export const PROJECT_FILES_BUCKET = 'project-files'

function getStorageClient(): SupabaseClient {
  return getSupabaseServiceRoleClient()
}

export async function uploadProjectFile(
  projectId: string,
  file: Buffer,
  filename: string,
  contentType: string
): Promise<{ path: string }> {
  const storage = getStorageClient()
  const path = `${projectId}/${Date.now()}-${filename}`

  const { data, error } = await storage
    .from(PROJECT_FILES_BUCKET)
    .upload(path, file, {
      contentType,
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Не удалось загрузить файл в Supabase Storage: ${error.message}`)
  }

  if (!data?.path) {
    throw new Error('Supabase не вернул путь загруженного файла')
  }

  return { path: data.path }
}

export async function getSignedUrl(path: string, expiresIn: number = 600): Promise<string> {
  const storage = getStorageClient()

  const { data, error } = await storage
    .from(PROJECT_FILES_BUCKET)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Не удалось создать подписанный URL: ${error.message}`)
  }

  if (!data?.signedUrl) {
    throw new Error('Supabase не вернул подписанный URL')
  }

  return data.signedUrl
}

export async function deleteProjectFile(path: string): Promise<void> {
  const storage = getStorageClient()

  const { error } = await storage
    .from(PROJECT_FILES_BUCKET)
    .remove([path])

  if (error) {
    throw new Error(`Не удалось удалить файл из Supabase Storage: ${error.message}`)
  }
}

export const isSupabaseStorageConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey)

