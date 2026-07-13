import { NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

export async function GET() {
  try {
    const res = await cosmic.objects
      .find({ type: 'contributors' })
      .props('id,title,slug')
      .depth(0)
      .limit(50)
    return NextResponse.json({ contributors: res.objects ?? [] })
  } catch (err: unknown) {
    console.error('Failed to fetch contributors:', err)
    return NextResponse.json({ contributors: [] }, { status: 500 })
  }
}
