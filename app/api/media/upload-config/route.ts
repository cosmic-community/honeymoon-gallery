import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE = 'hg_auth'
const AUTH_CODE = process.env.AUTH_CODE || 'Spiro1010'

// Returns the Cosmic upload credential to the browser so it can upload files
// DIRECTLY to Cosmic, bypassing the Vercel serverless 4.5MB request body limit.
//
// SECURITY: This is gated behind the same auth cookie the rest of the admin
// area uses. The write key is only returned to an authenticated session and is
// never included in the static client bundle. Middleware also protects this
// route, but we re-check the cookie here as defense-in-depth.
export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(AUTH_COOKIE)
  if (cookie?.value !== AUTH_CODE) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bucketSlug = process.env.COSMIC_BUCKET_SLUG
  const writeKey = process.env.COSMIC_WRITE_KEY

  if (!bucketSlug || !writeKey) {
    return NextResponse.json(
      { error: 'Server is missing Cosmic upload configuration' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    uploadUrl: `https://upload.cosmicjs.com/v3/buckets/${bucketSlug}/media`,
    writeKey,
  })
}
