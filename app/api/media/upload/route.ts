import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null
    const caption = formData.get('caption') as string | null
    const folderId = formData.get('folderId') as string | null
    const folderSlug = formData.get('folderSlug') as string | null
    const mediaType = formData.get('mediaType') as string | null
    const dateTaken = formData.get('dateTaken') as string | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // Upload to Cosmic media library
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Use the Cosmic SDK media upload
    const mediaRes = await cosmic.media.insertOne({
      media: {
        originalname: file.name,
        buffer,
      },
    })

    const mediaUrl = (mediaRes as unknown as { media: { url: string; imgix_url: string } }).media

    // Determine media type from MIME
    const type = mediaType || (file.type.startsWith('video/') ? 'Video' : 'Photo')

    // Create a media-item object
    const itemTitle = title || file.name.replace(/\.[^.]+$/, '')
    const slug = itemTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()

    const metadata: Record<string, unknown> = {
      media_type: type,
      media_file: mediaUrl.imgix_url || mediaUrl.url,
      caption: caption || '',
      date_taken: dateTaken || new Date().toISOString().split('T')[0],
    }

    if (folderId && folderSlug) {
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
