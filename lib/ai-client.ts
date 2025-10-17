import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY не установлен в переменных окружения')
}

