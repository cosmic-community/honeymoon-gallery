import { getContributors } from '@/lib/cosmic'
import ContributorCard from '@/components/ContributorCard'

export const metadata = {
  title: 'Contributors | Honeymoon Gallery',
  description: 'Meet the people sharing their memories.',
}

export default async function ContributorsPage() {
  const contributors = await getContributors()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-gray-900">
          Contributors
        </h1>
        <p className="mt-2 text-gray-500">
          The people behind these beautiful memories.
        </p>
      </div>
      {contributors.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {contributors.map((contributor) => (
            <ContributorCard key={contributor.id} contributor={contributor} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No contributors yet.</p>
      )}
    </div>
  )
}