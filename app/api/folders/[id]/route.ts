import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

// PATCH /api/folders/:id — update a folder
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, location, date } = body
    const res = await cosmic.objects.updateOne(id, {
      title,
      metadata: { description, location, date },
    })
    return NextResponse.json({ folder: res.object })
  } catch {
    return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 })
  }
}

// DELETE /api/folders/:id — delete a folder
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await cosmic.objects.deleteOne(id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 })
  }
}
