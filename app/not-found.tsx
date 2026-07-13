import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-32 text-center">
      <div className="text-6xl mb-4">📸</div>
      <h1 className="font-serif text-4xl font-bold text-gray-900">
        Page Not Found
      </h1>
      <p className="mt-4 text-gray-500">
        We couldn&apos;t find the memory you were looking for.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block px-6 py-3 rounded-full bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}