import { NextRequest, NextResponse } from 'next/server'

const AUTH_CODE = process.env.AUTH_CODE || 'Spiro1010'
const AUTH_COOKIE = 'hg_auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  if (body.code === AUTH_CODE) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set(AUTH_COOKIE, AUTH_CODE, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      // 30-day session
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === 'production',
    })
    return res
  }
  return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
}
