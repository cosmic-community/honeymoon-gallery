import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

// PATCH /api/media/:id — update a media item
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, caption, folderId, folderSlug, dateTaken } = body
    const metadata: Record<string, unknown> = {}
    if (caption !== undefined) metadata.caption = caption
    if (dateTaken !== undefined) metadata.date_taken = dateTaken
    if (folderSlug !== undefined) metadata.folder = folderSlug
    void folderId
    const res = await cosmic.objects.updateOne(id, { title, metadata })
    return NextResponse.json({ mediaItem: res.object })
  } catch {
    return NextResponse.json({ error: 'Failed to update media item' }, { status: 500 })
  }
}

// DELETE /api/media/:id — delete a media item
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await cosmic.objects.deleteOne(id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete media item' }, { status: 500 })
  }
}
