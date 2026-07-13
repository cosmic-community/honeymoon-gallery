'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface MediaKeyboardNavProps {
  /** Slug of the previous item in the folder, if any. */
  prevSlug?: string | null
  /** Slug of the next item in the folder, if any. */
  nextSlug?: string | null
}

/**
 * Adds keyboard navigation between media items:
 *  - ArrowLeft  -> previous item (if available)
 *  - ArrowRight -> next item (if available)
 *
 * Renders nothing; it only attaches a window keydown listener. Presence of a
 * prev/next slug is required for the respective direction to do anything.
 */
export default function MediaKeyboardNav({
  prevSlug,
  nextSlug,
}: MediaKeyboardNavProps) {
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ignore when the user is typing in a field or using modifier combos.
      const target = event.target as HTMLElement | null
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        (target &&
          (target.isContentEditable ||
            ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)))
      ) {
        return
      }

      if (event.key === 'ArrowLeft' && prevSlug) {
        event.preventDefault()
        router.push(`/gallery/${prevSlug}`)
      } else if (event.key === 'ArrowRight' && nextSlug) {
        event.preventDefault()
        router.push(`/gallery/${nextSlug}`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [prevSlug, nextSlug, router])

  return null
}
