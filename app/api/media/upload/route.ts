import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      mediaName,
      mediaType,
      thumbnail,
      title,
      folderId,
      contributorSlug,
    } = body

    if (!mediaName) {
      return NextResponse.json({ error: 'mediaName is required' }, { status: 400 })
    }

    const cleanTitle = title || mediaName.replace(/\.[^.]+$/, '')

    const metadata: Record<string, any> = {
      title: cleanTitle,
      media_type: mediaType || 'Image',
      media_file: mediaName,
      caption: '',
      date_taken: new Date().toISOString().slice(0, 10),
    }

    // Set thumbnail — the imgix URL with resize params
    if (thumbnail) {
      metadata.thumbnail = thumbnail
    }

    // Set folder using the object ID
    if (folderId) {
      metadata.folder = folderId
    }

    // Set uploaded_by using the contributor slug (Cosmic resolves slug -> ID)
    if (contributorSlug) {
      metadata.uploaded_by = contributorSlug
    }

    const result = await cosmic.objects.insertOne({
      title: cleanTitle,
      type: 'media-items',
      metadata,
    })

    return NextResponse.json({ success: true, object: result.object })
  } catch (err: any) {
    console.error('[upload] error:', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
