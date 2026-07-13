import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

/**
 * Creates a media-items object for a file that has ALREADY been uploaded
 * to the Cosmic media library directly from the browser.
 *
 * The file bytes are no longer sent through this route (that would hit
 * Vercel's 4.5MB request-body limit). The browser uploads the bytes via
 * cosmic.media.insertOne() and then posts the resulting media name plus
 * lightweight metadata here as JSON.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      mediaName?: string
      title?: string
      caption?: string
      folderSlug?: string
      mediaType?: string
      dateTaken?: string
      originalName?: string
    }

    const {
      mediaName,
      title,
      caption,
      folderSlug,
      mediaType,
      dateTaken,
      originalName,
    } = body

    if (!mediaName) {
      return NextResponse.json(
        { error: 'Missing uploaded media name' },
        { status: 400 }
      )
    }

    const type = mediaType || 'Photo'

    const baseName = title || originalName?.replace(/\.[^.]+$/, '') || 'Untitled'
    const itemTitle = baseName
    const slug =
      itemTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now()

    // For Cosmic 'file' type metafields, the value must be the media name.
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
    console.error('Create media-item error:', err)
    const cosmicErr = err as { status?: number; message?: string }
    return NextResponse.json(
      { error: cosmicErr.message || 'Failed to create media item', status: cosmicErr.status },
      { status: cosmicErr.status || 500 }
    )
  }
}
