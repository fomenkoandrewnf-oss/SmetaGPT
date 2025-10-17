import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Список публичных путей, не требующих авторизации
const publicPaths = ['/', '/api/auth']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Пропускаем публичные пути
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // TODO: Проверка авторизации через Supabase
  // const session = await getServerSession()
  // if (!session) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }
  
  // Для MVP пропускаем все запросы
  // Добавляем mock headers для userId и companyId
  const response = NextResponse.next()
  response.headers.set('x-user-id', 'temp-user-id')
  response.headers.set('x-company-id', 'temp-company-id')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

