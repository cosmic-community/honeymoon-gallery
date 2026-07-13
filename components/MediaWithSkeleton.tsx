'use client'

import { useState } from 'react'

interface MediaWithSkeletonProps {
  isVideo: boolean
  src: string
  alt: string
  className?: string
  /** Applied to the wrapper element. Should establish sizing/aspect ratio. */
  wrapperClassName?: string
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
 */
export default function MediaWithSkeleton({
  isVideo,
  src,
  alt,
  className = '',
  wrapperClassName = '',
  controls = false,
  muted = false,
  playsInline = false,
  preload = 'metadata',
  width,
  height,
}: MediaWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={`relative ${wrapperClassName}`}>
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
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={`${className} transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  )
}
