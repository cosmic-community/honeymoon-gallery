// app/gallery/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMediaItem, getMediaItemsByFolder, getMetafieldValue } from '@/lib/cosmic'
import MediaTypeBadge from '@/components/MediaTypeBadge'
import MediaWithSkeleton from '@/components/MediaWithSkeleton'
import { formatDate } from '@/lib/format'
import type { MediaItem } from '@/types'

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

  // Determine previous / next items within the same folder (if any)
  let prevItem: MediaItem | null = null
  let nextItem: MediaItem | null = null
  if (folder?.id) {
    const siblings = await getMediaItemsByFolder(folder.id)
    const currentIndex = siblings.findIndex((sibling) => sibling.id === item.id)
    if (currentIndex !== -1) {
      prevItem = currentIndex > 0 ? siblings[currentIndex - 1] ?? null : null
      nextItem =
        currentIndex < siblings.length - 1
          ? siblings[currentIndex + 1] ?? null
          : null
    }
  }

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
            <MediaWithSkeleton
              isVideo
              src={mediaFile.url}
              alt={title}
              controls
              preload="metadata"
              wrapperClassName="w-full min-h-[300px] max-h-[70vh]"
              className="w-full max-h-[70vh] object-contain bg-black"
            />
          ) : (
            <MediaWithSkeleton
              isVideo={false}
              src={`${mediaFile.imgix_url}?w=2000&auto=format,compress`}
              alt={title}
              wrapperClassName="w-full min-h-[300px] max-h-[70vh]"
              className="w-full max-h-[70vh] object-contain"
            />
          )
        ) : (
          <div className="w-full h-96 flex items-center justify-center text-6xl">
            🖼️
          </div>
        )}
      </div>

      {(prevItem || nextItem) && (
        <nav
          aria-label="Media navigation"
          className="mt-6 flex items-stretch justify-between gap-4"
        >
          {prevItem ? (
            <Link
              href={`/gallery/${prevItem.slug}`}
              className="group flex flex-1 items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              <span className="text-brand-600 text-lg">←</span>
              <span className="min-w-0">
                <span className="block text-xs uppercase tracking-wide text-gray-400">
                  Previous
                </span>
                <span className="block truncate text-sm font-medium text-gray-900">
                  {getMetafieldValue(prevItem.metadata?.title) || prevItem.title}
                </span>
              </span>
            </Link>
          ) : (
            <span className="flex-1" aria-hidden="true" />
          )}

          {nextItem ? (
            <Link
              href={`/gallery/${nextItem.slug}`}
              className="group flex flex-1 items-center justify-end gap-3 rounded-xl border border-gray-200 px-4 py-3 text-right transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              <span className="min-w-0">
                <span className="block text-xs uppercase tracking-wide text-gray-400">
                  Next
                </span>
                <span className="block truncate text-sm font-medium text-gray-900">
                  {getMetafieldValue(nextItem.metadata?.title) || nextItem.title}
                </span>
              </span>
              <span className="text-brand-600 text-lg">→</span>
            </Link>
          ) : (
            <span className="flex-1" aria-hidden="true" />
          )}
        </nav>
      )}

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
