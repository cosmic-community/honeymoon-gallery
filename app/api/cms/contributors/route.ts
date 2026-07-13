import { NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

export async function GET() {
  try {
    const res = await cosmic.objects
      .find({ type: 'contributors' })
      .props('id,title,slug,metadata')
      .limit(100)
    return NextResponse.json({ contributors: res.objects })
  } catch (err) {
    return NextResponse.json({ contributors: [] })
  }
}
