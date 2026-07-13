import Link from 'next/link'
import { getFolders, getMediaItems, getMetafieldValue } from '@/lib/cosmic'
import FolderCard from '@/components/FolderCard'
import MediaCard from '@/components/MediaCard'

export default async function HomePage() {
  const [folders, mediaItems] = await Promise.all([
    getFolders(),
    getMediaItems(),
  ])

  const recentMedia = mediaItems.slice(0, 8)
  const heroImage = folders[0]?.metadata?.cover_image || mediaItems[0]?.metadata?.media_file

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {heroImage ? (
            <img
              src={`${heroImage.imgix_url}?w=2400&h=1200&fit=crop&auto=format,compress`}
              alt="Gallery hero"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-700" />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white text-balance">
            Every memory, beautifully preserved
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-white/90">
            Browse and share your favorite photos and videos, organized into
            folders by the places and moments that matter most.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/folders"
              className="px-6 py-3 rounded-full bg-white text-brand-600 font-medium hover:bg-brand-50 transition-colors"
            >
              Explore Folders
            </Link>
            <Link
              href="/gallery"
              className="px-6 py-3 rounded-full bg-white/20 text-white font-medium backdrop-blur border border-white/30 hover:bg-white/30 transition-colors"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Folders */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl font-bold text-gray-900">Folders</h2>
          <Link
            href="/folders"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View all →
          </Link>
        </div>
        {folders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders.slice(0, 6).map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No folders yet.</p>
        )}
      </section>

      {/* Recent Media */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl font-bold text-gray-900">
            Recent Memories
          </h2>
          <Link
            href="/gallery"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View all →
          </Link>
        </div>
        {recentMedia.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentMedia.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No media items yet.</p>
        )}
      </section>
    </div>
  )
}