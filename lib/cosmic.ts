import { createBucketClient } from '@cosmicjs/sdk'
import type { Folder, MediaItem, Contributor } from '@/types'

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
})

// Simple error helper for Cosmic SDK
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error
}

// Safely render a metafield value that may be an object
export function getMetafieldValue(field: unknown): string {
  if (field === null || field === undefined) return ''
  if (typeof field === 'string') return field
  if (typeof field === 'number' || typeof field === 'boolean') return String(field)
  if (typeof field === 'object' && field !== null && 'value' in field) {
    return String((field as { value: unknown }).value)
  }
  if (typeof field === 'object' && field !== null && 'key' in field) {
    return String((field as { key: unknown }).key)
  }
  return ''
}

// Fetch all folders
export async function getFolders(): Promise<Folder[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'folders' })
      .props(['id', 'slug', 'title', 'metadata'])
      .depth(1)
      .options({ cache: 'no-store' })

    const folders = response.objects as Folder[]
    return folders.sort((a, b) => {
      const dateA = new Date(a.metadata?.date || '').getTime()
      const dateB = new Date(b.metadata?.date || '').getTime()
      return dateB - dateA
    })
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return []
    }
    throw new Error('Failed to fetch folders')
  }
}

// Fetch a single folder by slug
export async function getFolder(slug: string): Promise<Folder | null> {
  try {
    const response = await cosmic.objects
      .findOne({ type: 'folders', slug })
      .props(['id', 'slug', 'title', 'metadata'])
      .depth(1)
      .options({ cache: 'no-store' })

    return response.object as Folder
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    throw new Error('Failed to fetch folder')
  }
}

// Fetch all media items
export async function getMediaItems(): Promise<MediaItem[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'media-items' })
      .props(['id', 'slug', 'title', 'metadata'])
      .depth(1)
      .options({ cache: 'no-store' })

    const items = response.objects as MediaItem[]
    return items.sort((a, b) => {
      const dateA = new Date(a.metadata?.date_taken || '').getTime()
      const dateB = new Date(b.metadata?.date_taken || '').getTime()
      return dateB - dateA
    })
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return []
    }
    throw new Error('Failed to fetch media items')
  }
}

// Fetch media items in a folder
export async function getMediaItemsByFolder(folderId: string): Promise<MediaItem[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'media-items', 'metadata.folder': folderId })
      .props(['id', 'slug', 'title', 'metadata'])
      .depth(1)
      .options({ cache: 'no-store' })

    const items = response.objects as MediaItem[]
    return items.sort((a, b) => {
      const dateA = new Date(a.metadata?.date_taken || '').getTime()
      const dateB = new Date(b.metadata?.date_taken || '').getTime()
      return dateB - dateA
    })
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return []
    }
    throw new Error('Failed to fetch media items for folder')
  }
}

// Fetch a single media item by slug
export async function getMediaItem(slug: string): Promise<MediaItem | null> {
  try {
    const response = await cosmic.objects
      .findOne({ type: 'media-items', slug })
      .props(['id', 'slug', 'title', 'metadata'])
      .depth(1)
      .options({ cache: 'no-store' })

    return response.object as MediaItem
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    throw new Error('Failed to fetch media item')
  }
}

// Fetch all contributors
export async function getContributors(): Promise<Contributor[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'contributors' })
      .props(['id', 'slug', 'title', 'metadata'])
      .depth(1)

    return response.objects as Contributor[]
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return []
    }
    throw new Error('Failed to fetch contributors')
  }
}

// Fetch a single contributor by slug
export async function getContributor(slug: string): Promise<Contributor | null> {
  try {
    const response = await cosmic.objects
      .findOne({ type: 'contributors', slug })
      .props(['id', 'slug', 'title', 'metadata'])
      .depth(1)

    return response.object as Contributor
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    throw new Error('Failed to fetch contributor')
  }
}

// Fetch media items uploaded by a contributor
export async function getMediaItemsByContributor(contributorId: string): Promise<MediaItem[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'media-items', 'metadata.uploaded_by': contributorId })
      .props(['id', 'slug', 'title', 'metadata'])
      .depth(1)
      .options({ cache: 'no-store' })

    return response.objects as MediaItem[]
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return []
    }
    throw new Error('Failed to fetch media items for contributor')
  }
}