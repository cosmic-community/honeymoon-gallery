// app/folders/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFolder, getMediaItemsByFolder, getMetafieldValue } from '@/lib/cosmic'
import MediaCard from '@/components/MediaCard'
import { formatDate } from '@/lib/format'

export default async function FolderPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const folder = await getFolder(slug)

  if (!folder) {
    notFound()
  }

  const mediaItems = await getMediaItemsByFolder(folder.id)
  const coverImage = folder.metadata?.cover_image
  const name = getMetafieldValue(folder.metadata?.name) || folder.title
  const description = getMetafieldValue(folder.metadata?.description)
  const location = getMetafieldValue(folder.metadata?.location)
  const date = formatDate(folder.metadata?.date)

  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {coverImage ? (
            <img
              src={`${coverImage.imgix_url}?w=2400&h=900&fit=crop&auto=format,compress`}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-700" />
          )}
          <div className="absolute inset-0 bg-black/45" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Link
            href="/folders"
            className="text-sm text-white/80 hover:text-white"
          >
            ← Back to folders
          </Link>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-bold text-white text-balance">
            {name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-white/90 text-sm">
            {location && <span>📍 {location}</span>}
            {date && <span>📅 {date}</span>}
            <span>🖼️ {mediaItems.length} items</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {description && (
          <p className="max-w-3xl text-lg text-gray-600 mb-10">{description}</p>
        )}
        {mediaItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaItems.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No media in this folder yet.</p>
        )}
      </div>
    </div>
  )
}