import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

// GET /api/folders  — list all folders
export async function GET() {
  try {
    const res = await cosmic.objects
      .find({ type: 'folders' })
      .props(['id', 'slug', 'title', 'metadata'])
      .depth(1)
    return NextResponse.json({ folders: res.objects })
  } catch (e: unknown) {
    const err = e as { status?: number }
    if (err.status === 404) return NextResponse.json({ folders: [] })
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 })
  }
}

// POST /api/folders  — create a folder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, location, date } = body
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const res = await cosmic.objects.insertOne({
      title,
      slug,
      type: 'folders',
      status: 'published',
      metadata: { description, location, date },
    })
    return NextResponse.json({ folder: res.object }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 })
  }
}
