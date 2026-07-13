'use client'

import { useState, type CSSProperties } from 'react'

interface MediaWithSkeletonProps {
  isVideo: boolean
  src: string
  alt: string
  className?: string
  /** Applied to the wrapper element. Should establish sizing/aspect ratio. */
  wrapperClassName?: string
  /**
   * Initial aspect ratio (width / height) used to reserve space for the
   * skeleton BEFORE the media loads, so the box does not resize (and cause a
   * layout/height jump) once the real media arrives. Once the media loads its
   * natural aspect ratio is measured and applied, snapping the box to the exact
   * rendered size. Defaults to 16/10 as a neutral placeholder.
   */
  aspectRatio?: number
  /** Video-only attributes */
  controls?: boolean
  muted?: boolean
  playsInline?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  width?: number
  height?: number
}

/**
 * Renders an image or video with an animated shimmer skeleton that shows
 * while the media loads, then cross-fades to the loaded media.
 *
 * The wrapper reserves space using an aspect-ratio box so the layout height is
 * stable from first paint through load (no height jump). If a caller sets an
 * explicit height on the wrapper (e.g. h-full inside a fixed grid cell), pass
 * aspectRatio only when you want the box to size itself.
 */
export default function MediaWithSkeleton({
  isVideo,
  src,
  alt,
  className = '',
  wrapperClassName = '',
  aspectRatio,
  controls = false,
  muted = false,
  playsInline = false,
  preload = 'metadata',
  width,
  height,
}: MediaWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false)
  const [ratio, setRatio] = useState<number | undefined>(aspectRatio)

  // Only reserve an aspect-ratio box when a ratio is known. When callers size
  // the wrapper explicitly (e.g. aspect-square grid cells) they omit
  // aspectRatio and we leave layout entirely to their classes.
  const wrapperStyle: CSSProperties | undefined = ratio
    ? { aspectRatio: String(ratio) }
    : undefined

  return (
    <div className={`relative ${wrapperClassName}`} style={wrapperStyle}>
      {!loaded && (
        <div
          aria-hidden="true"
          className="skeleton-shimmer absolute inset-0 h-full w-full"
        />
      )}
      {isVideo ? (
        <video
          src={src}
          controls={controls}
          muted={muted}
          playsInline={playsInline}
          preload={preload}
          onLoadedMetadata={(e) => {
            const el = e.currentTarget
            if (el.videoWidth && el.videoHeight) {
              setRatio(el.videoWidth / el.videoHeight)
            }
          }}
          onLoadedData={() => setLoaded(true)}
          className={`${className} transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={(e) => {
            const el = e.currentTarget
            if (el.naturalWidth && el.naturalHeight) {
              setRatio(el.naturalWidth / el.naturalHeight)
            }
            setLoaded(true)
          }}
          onError={() => setLoaded(true)}
          className={`${className} transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  )
}
