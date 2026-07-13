export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-gray-100 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {year} Honeymoon Gallery. All memories preserved with love.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <span className="text-lg">📸</span> Share your journey
          </p>
        </div>
      </div>
    </footer>
  )
}