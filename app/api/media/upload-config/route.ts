import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE = 'hg_auth'
const AUTH_CODE = process.env.AUTH_CODE || 'Spiro1010'

/**
 * Returns the Cosmic upload credentials to an authenticated admin session.
 *
 * The browser needs the bucket slug + write key to call
 * cosmic.media.insertOne() directly (so large file bytes never pass
 * through a Vercel function and hit the 4.5MB request-body limit).
 *
 * The write key is NOT baked into the client bundle; it is only handed
 * out at runtime to a session that already holds the hg_auth cookie
 * (the same gate the middleware enforces on the admin area).
 */
export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(AUTH_COOKIE)
  if (cookie?.value !== AUTH_CODE) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bucketSlug = process.env.COSMIC_BUCKET_SLUG
  const readKey = process.env.COSMIC_READ_KEY
  const writeKey = process.env.COSMIC_WRITE_KEY

  if (!bucketSlug || !readKey || !writeKey) {
    return NextResponse.json(
      { error: 'Cosmic credentials are not configured on the server' },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { bucketSlug, readKey, writeKey },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
