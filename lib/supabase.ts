import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase credentials не настроены')
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder')

// Storage bucket для файлов проектов
export const PROJECT_FILES_BUCKET = 'project-files'

// Функции для работы с файлами
export async function uploadProjectFile(
  projectId: string,
  file: Buffer,
  filename: string,
  contentType: string
) {
  const path = `${projectId}/${Date.now()}-${filename}`
  
  const { data, error } = await supabase.storage
    .from(PROJECT_FILES_BUCKET)
    .upload(path, file, {
      contentType,
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) throw error
  return data
}

export async function getSignedUrl(path: string, expiresIn: number = 600) {
  const { data, error } = await supabase.storage
    .from(PROJECT_FILES_BUCKET)
    .createSignedUrl(path, expiresIn)
  
  if (error) throw error
  return data.signedUrl
}

export async function deleteProjectFile(path: string) {
  const { error } = await supabase.storage
    .from(PROJECT_FILES_BUCKET)
    .remove([path])
  
  if (error) throw error
}

