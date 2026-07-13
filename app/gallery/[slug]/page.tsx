// app/gallery/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMediaItem, getMetafieldValue } from '@/lib/cosmic'
import MediaTypeBadge from '@/components/MediaTypeBadge'
import { formatDate } from '@/lib/format'

export default async function MediaItemPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const item = await getMediaItem(slug)

  if (!item) {
    notFound()
  }

  const mediaFile = item.metadata?.media_file
  const title = getMetafieldValue(item.metadata?.title) || item.title
  const caption = getMetafieldValue(item.metadata?.caption)
  const mediaType = item.metadata?.media_type
  const isVideo = mediaType === 'Video'
  const folder = item.metadata?.folder
  const uploadedBy = item.metadata?.uploaded_by
  const dateTaken = formatDate(item.metadata?.date_taken)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6 flex items-center gap-3 text-sm">
        <Link href="/gallery" className="text-brand-600 hover:text-brand-700">
          ← Gallery
        </Link>
        {folder && (
          <>
            <span className="text-gray-300">/</span>
            <Link
              href={`/folders/${folder.slug}`}
              className="text-brand-600 hover:text-brand-700"
            >
              {getMetafieldValue(folder.metadata?.name) || folder.title}
            </Link>
          </>
        )}
      </div>

      <div className="rounded-2xl overflow-hidden bg-gray-900 shadow-xl">
        {mediaFile ? (
          isVideo ? (
            <video
              src={mediaFile.url}
              controls
              className="w-full max-h-[70vh] object-contain bg-black"
            />
          ) : (
            <img
              src={`${mediaFile.imgix_url}?w=2000&auto=format,compress`}
              alt={title}
              className="w-full max-h-[70vh] object-contain"
            />
          )
        ) : (
          <div className="w-full h-96 flex items-center justify-center text-6xl">
            🖼️
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            {title}
          </h1>
          <MediaTypeBadge type={mediaType} />
        </div>
        {caption && <p className="mt-4 text-lg text-gray-600">{caption}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-500 border-t border-gray-100 pt-6">
          {dateTaken && <span>📅 {dateTaken}</span>}
          {uploadedBy && (
            <Link
              href={`/contributors/${uploadedBy.slug}`}
              className="flex items-center gap-2 hover:text-brand-600 transition-colors"
            >
              {uploadedBy.metadata?.avatar ? (
                <img
                  src={`${uploadedBy.metadata.avatar.imgix_url}?w=64&h=64&fit=crop&auto=format,compress`}
                  alt={getMetafieldValue(uploadedBy.metadata?.name) || uploadedBy.title}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  👤
                </span>
              )}
              <span>
                Uploaded by{' '}
                {getMetafieldValue(uploadedBy.metadata?.name) || uploadedBy.title}
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}