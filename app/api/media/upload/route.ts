import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null
    const caption = formData.get('caption') as string | null
    const folderSlug = formData.get('folderSlug') as string | null
    const mediaType = formData.get('mediaType') as string | null
    const dateTaken = formData.get('dateTaken') as string | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // Upload to Cosmic media library
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const mediaRes = await cosmic.media.insertOne({
      media: {
        originalname: file.name,
        buffer,
      },
    })

    const uploadedMedia = (mediaRes as unknown as { media: { url: string; imgix_url: string } }).media

    // Determine media type from MIME if not provided
    const type = mediaType || (file.type.startsWith('video/') ? 'Video' : 'Photo')

    // Build object title and slug
    const itemTitle = title || file.name.replace(/\.[^.]+$/, '')
    const slug =
      itemTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
      '-' +
      Date.now()

    // Build metadata — all metafields in the media-items schema
    const metadata: Record<string, unknown> = {
      // Required text metafield
      title: itemTitle,
      // Radio-buttons metafield: 'Photo' | 'Video'
      media_type: type,
      // File metafield: pass the full media object so Cosmic resolves it correctly
      media_file: {
        url: uploadedMedia.url,
        imgix_url: uploadedMedia.imgix_url,
      },
      // Textarea metafield
      caption: caption || '',
      // Date metafield
      date_taken: dateTaken || new Date().toISOString().split('T')[0],
    }

    // Object relationship: pass slug so Cosmic resolves it to an ObjectId
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
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export const config = {
  api: { bodyParser: false },
}
