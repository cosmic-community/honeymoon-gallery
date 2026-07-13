import { NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

// GET /api/contributors — list all contributors
export async function GET() {
  try {
    const res = await cosmic.objects
      .find({ type: 'contributors' })
      .props(['id', 'slug', 'title', 'metadata'])
      .depth(1)
    return NextResponse.json({ contributors: res.objects })
  } catch (e: unknown) {
    const err = e as { status?: number }
    if (err.status === 404) return NextResponse.json({ contributors: [] })
    return NextResponse.json({ error: 'Failed to fetch contributors' }, { status: 500 })
  }
}
