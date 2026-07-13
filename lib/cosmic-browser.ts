'use client'

import { createBucketClient } from '@cosmicjs/sdk'

export interface UploadConfig {
  bucketSlug: string
  readKey: string
  writeKey: string
}

export interface UploadedMedia {
  name: string
  url: string
  imgix_url: string
}

let cachedConfig: UploadConfig | null = null

/**
 * Fetch the Cosmic upload credentials for the current authenticated admin
 * session. The result is cached for the lifetime of the page so we only
 * hit the server once per session.
 */
export async function getUploadConfig(): Promise<UploadConfig> {
  if (cachedConfig) return cachedConfig

  const res = await fetch('/api/media/upload-config', {
    method: 'GET',
    credentials: 'same-origin',
  })

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Your session has expired. Please log in again.')
    }
    throw new Error('Could not load upload configuration.')
  }

  cachedConfig = (await res.json()) as UploadConfig
  return cachedConfig
}

/**
 * Upload a single file's bytes directly from the browser to Cosmic using
 * the SDK media method. Because this runs client-side, the bytes never
 * pass through a Vercel serverless function, so there is no 4.5MB request
 * body ceiling — large photos and videos upload fine.
 *
 * Returns the uploaded media record (name/url) which the caller then
 * associates with a media-items object via /api/media/upload.
 */
export async function uploadFileToCosmic(file: File): Promise<UploadedMedia> {
  const config = await getUploadConfig()

  const cosmic = createBucketClient({
    bucketSlug: config.bucketSlug,
    readKey: config.readKey,
    writeKey: config.writeKey,
  })

  // The SDK accepts a browser File directly for the media payload.
  const res = await cosmic.media.insertOne({
    media: file,
  })

  const media = (res as unknown as { media: UploadedMedia }).media
  if (!media?.name) {
    throw new Error('Cosmic did not return an uploaded media name.')
  }
  return media
}
