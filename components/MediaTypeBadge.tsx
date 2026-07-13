import type { MediaType } from '@/types'

interface MediaTypeBadgeProps {
  type?: MediaType
  className?: string
}

export default function MediaTypeBadge({ type, className = '' }: MediaTypeBadgeProps) {
  if (!type) return null

  const isVideo = type === 'Video'
  const styles = isVideo
    ? 'bg-purple-100 text-purple-700'
    : 'bg-brand-100 text-brand-700'

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles} ${className}`}
    >
      <span>{isVideo ? '🎥' : '📷'}</span>
      {type}
    </span>
  )
}