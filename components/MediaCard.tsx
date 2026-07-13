import Link from 'next/link'
import type { MediaItem } from '@/types'
import { getMetafieldValue } from '@/lib/cosmic'
import MediaTypeBadge from '@/components/MediaTypeBadge'
import MediaWithSkeleton from '@/components/MediaWithSkeleton'

interface MediaCardProps {
  item: MediaItem
}

export default function MediaCard({ item }: MediaCardProps) {
  const mediaFile = item.metadata?.media_file
  const title = getMetafieldValue(item.metadata?.title) || item.title
  const mediaType = item.metadata?.media_type
  const isVideo = mediaType === 'Video'

  return (
    <Link
      href={`/gallery/${item.slug}`}
      className="group relative block overflow-hidden rounded-xl bg-gray-100 aspect-square shadow-sm hover:shadow-lg transition-all"
    >
      {mediaFile ? (
        isVideo ? (
          <div className="relative w-full h-full">
            <MediaWithSkeleton
              isVideo
              src={mediaFile.url}
              alt={title}
              muted
              playsInline
              preload="metadata"
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center text-xl">
                ▶️
              </span>
            </div>
          </div>
        ) : (
          <MediaWithSkeleton
            isVideo={false}
            src={`${mediaFile.imgix_url}?w=600&h=600&fit=crop&auto=format,compress`}
            alt={title}
            width={300}
            height={300}
            wrapperClassName="w-full h-full"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl">
          🖼️
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-2 left-2">
        <MediaTypeBadge type={mediaType} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-sm font-medium truncate">{title}</p>
      </div>
    </Link>
  )
}