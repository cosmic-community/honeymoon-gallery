// app/contributors/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getContributor,
  getMediaItemsByContributor,
  getMetafieldValue,
} from '@/lib/cosmic'
import MediaCard from '@/components/MediaCard'

export default async function ContributorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const contributor = await getContributor(slug)

  if (!contributor) {
    notFound()
  }

  const mediaItems = await getMediaItemsByContributor(contributor.id)
  const avatar = contributor.metadata?.avatar
  const name = getMetafieldValue(contributor.metadata?.name) || contributor.title
  const bio = getMetafieldValue(contributor.metadata?.bio)
  const email = getMetafieldValue(contributor.metadata?.email)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/contributors"
        className="text-sm text-brand-600 hover:text-brand-700"
      >
        ← Back to contributors
      </Link>

      <div className="mt-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 ring-4 ring-white shadow-md shrink-0">
          {avatar ? (
            <img
              src={`${avatar.imgix_url}?w=300&h=300&fit=crop&auto=format,compress`}
              alt={name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              👤
            </div>
          )}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="font-serif text-4xl font-bold text-gray-900">{name}</h1>
          {email && (
            <a
              href={`mailto:${email}`}
              className="mt-1 inline-block text-sm text-brand-600 hover:text-brand-700"
            >
              {email}
            </a>
          )}
          {bio && <p className="mt-3 max-w-2xl text-gray-600">{bio}</p>}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">
          Uploaded Memories ({mediaItems.length})
        </h2>
        {mediaItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaItems.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            This contributor hasn&apos;t uploaded any media yet.
          </p>
        )}
      </div>
    </div>
  )
}