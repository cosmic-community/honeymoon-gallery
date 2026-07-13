import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            <span className="font-serif text-xl font-semibold text-gray-900">
              Honeymoon Gallery
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/folders"
              className="text-sm font-medium text-gray-600 hover:text-rose-500 transition-colors"
            >
              Folders
            </Link>
            <Link
              href="/gallery"
              className="text-sm font-medium text-gray-600 hover:text-rose-500 transition-colors"
            >
              Gallery
            </Link>
            <Link
              href="/contributors"
              className="text-sm font-medium text-gray-600 hover:text-rose-500 transition-colors"
            >
              Contributors
            </Link>
            <Link
              href="/admin"
              className="text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors px-4 py-1.5 rounded-full"
            >
              Upload
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
