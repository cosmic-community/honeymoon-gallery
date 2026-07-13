'use client'

import { useState } from 'react'
import Link from 'next/link'

const navLinks = [
  { href: '/folders', label: 'Folders' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contributors', label: 'Contributors' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  const closeMenu = () => setOpen(false)

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <span className="text-2xl">📸</span>
            <span className="font-serif text-xl font-semibold text-gray-900">
              Honeymoon Gallery
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-rose-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors px-4 py-1.5 rounded-full"
            >
              Upload
            </Link>
          </nav>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="md:hidden inline-flex items-center justify-center p-2 -mr-2 text-gray-700 hover:text-rose-500 transition-colors"
          >
            {open ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <nav className="md:hidden border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="block px-2 py-2.5 text-base font-medium text-gray-700 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={closeMenu}
              className="mt-1 text-center text-base font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors px-4 py-2.5 rounded-full"
            >
              Upload
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
