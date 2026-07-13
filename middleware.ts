import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE = 'hg_auth'
const AUTH_CODE = process.env.AUTH_CODE || 'Spiro1010'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow the login page and its POST handler
  if (pathname === '/login') return NextResponse.next()

  // Always allow static assets and Next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/dashboard-console-capture')
  ) {
    return NextResponse.next()
  }

  // Check auth cookie
  const cookie = request.cookies.get(AUTH_COOKIE)
  if (cookie?.value === AUTH_CODE) return NextResponse.next()

  // Not authenticated — redirect to login, preserving intended URL
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
