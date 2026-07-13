import Link from 'next/link'
import type { Contributor } from '@/types'
import { getMetafieldValue } from '@/lib/cosmic'

interface ContributorCardProps {
  contributor: Contributor
}

export default function ContributorCard({ contributor }: ContributorCardProps) {
  const avatar = contributor.metadata?.avatar
  const name = getMetafieldValue(contributor.metadata?.name) || contributor.title
  const bio = getMetafieldValue(contributor.metadata?.bio)

  return (
    <Link
      href={`/contributors/${contributor.slug}`}
      className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all"
    >
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 ring-4 ring-white shadow-md">
        {avatar ? (
          <img
            src={`${avatar.imgix_url}?w=200&h=200&fit=crop&auto=format,compress`}
            alt={name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            👤
          </div>
        )}
      </div>
      <h3 className="mt-4 font-serif text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
        {name}
      </h3>
      {bio && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-3">{bio}</p>
      )}
    </Link>
  )
}