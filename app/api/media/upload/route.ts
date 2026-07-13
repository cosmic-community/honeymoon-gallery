import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

// The file bytes are uploaded directly from the browser to Cosmic (see
// UploadZone + /api/media/upload-config). This route now only receives the
// resulting media `name` plus metadata and creates the media-item object.
// Because no file bytes pass through this function, the Vercel 4.5MB request
// body limit no longer applies to uploads.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      mediaName,
      originalName,
      mimeType,
      title,
      caption,
      folderSlug,
      mediaType,
      dateTaken,
    } = body as {
      mediaName?: string
      originalName?: string
      mimeType?: string
      title?: string
      caption?: string
      folderSlug?: string
      mediaType?: string
      dateTaken?: string
    }

    if (!mediaName) {
      return NextResponse.json(
        { error: 'No media name provided' },
        { status: 400 }
      )
    }

    // Determine media type from MIME when not explicitly provided
    const type =
      mediaType || ((mimeType || '').startsWith('video/') ? 'Video' : 'Photo')

    const fallbackName = (originalName || mediaName).replace(/\.[^.]+$/, '')
    const itemTitle = title || fallbackName
    const slug =
      itemTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now()

    // For Cosmic 'file' type metafields, the value must be the media name (not a URL)
    const metadata: Record<string, unknown> = {
      title: itemTitle,
      media_type: type,
      media_file: mediaName,
      caption: caption || '',
      date_taken: dateTaken || new Date().toISOString().split('T')[0],
    }

    if (folderSlug) {
      metadata.folder = folderSlug
    }

    const objRes = await cosmic.objects.insertOne({
      title: itemTitle,
      slug,
      type: 'media-items',
      status: 'published',
      metadata,
    })

    return NextResponse.json({ mediaItem: objRes.object }, { status: 201 })
  } catch (err: unknown) {
    console.error('Upload error:', err)
    const cosmicErr = err as { status?: number; message?: string }
    return NextResponse.json(
      { error: cosmicErr.message || 'Upload failed', status: cosmicErr.status },
      { status: cosmicErr.status || 500 }
    )
  }
}
