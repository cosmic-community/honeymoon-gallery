import Link from 'next/link'
import type { Folder } from '@/types'
import { getMetafieldValue } from '@/lib/cosmic'
import { formatDate } from '@/lib/format'

interface FolderCardProps {
  folder: Folder
}

export default function FolderCard({ folder }: FolderCardProps) {
  const coverImage = folder.metadata?.cover_image
  const name = getMetafieldValue(folder.metadata?.name) || folder.title
  const location = getMetafieldValue(folder.metadata?.location)
  const date = formatDate(folder.metadata?.date)

  return (
    <Link
      href={`/folders/${folder.slug}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {coverImage ? (
          <img
            src={`${coverImage.imgix_url}?w=800&h=600&fit=crop&auto=format,compress`}
            alt={name}
            width={400}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            📁
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
          {name}
        </h3>
        {location && (
          <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
            <span>📍</span> {location}
          </p>
        )}
        {date && <p className="mt-1 text-xs text-gray-400">{date}</p>}
      </div>
    </Link>
  )
}