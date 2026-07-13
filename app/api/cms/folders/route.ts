import { NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

export async function GET() {
  try {
    const res = await cosmic.objects
      .find({ type: 'folders' })
      .props('id,title,slug')
      .limit(100)
    return NextResponse.json({ folders: res.objects })
  } catch (err) {
    return NextResponse.json({ folders: [] })
  }
}
