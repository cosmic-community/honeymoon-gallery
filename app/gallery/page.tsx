import { getMediaItems } from '@/lib/cosmic'
import MediaCard from '@/components/MediaCard'

export const metadata = {
  title: 'Gallery | Honeymoon Gallery',
  description: 'Browse all photos and videos.',
}

export default async function GalleryPage() {
  const mediaItems = await getMediaItems()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-gray-900">Gallery</h1>
        <p className="mt-2 text-gray-500">
          All {mediaItems.length} memories in one place.
        </p>
      </div>
      {mediaItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No media items have been uploaded yet.</p>
      )}
    </div>
  )
}