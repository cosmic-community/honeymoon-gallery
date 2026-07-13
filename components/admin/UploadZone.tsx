'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createBucketClient } from '@cosmicjs/sdk'

interface Folder {
  id: string
  title: string
  slug: string
}

interface Contributor {
  id: string
  title: string
  slug: string
}

interface UploadZoneProps {
  folders?: Folder[]
  contributors?: Contributor[]
}

interface FileWithPreview extends File {
  preview?: string
}

interface UploadItem {
  file: FileWithPreview
  title: string
  caption: string
  folderId: string
  contributorId: string
  dateTaken: string
  status: 'idle' | 'uploading' | 'done' | 'error'
  errorMsg?: string
}

export default function UploadZone({ folders = [], contributors = [] }: UploadZoneProps) {
  const [items, setItems] = useState<UploadItem[]>([])
  const [globalFolderId, setGlobalFolderId] = useState('')
  const [globalContributorId, setGlobalContributorId] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    (accepted: File[]) => {
      const newItems: UploadItem[] = accepted.map((file) => ({
        file: Object.assign(file, { preview: URL.createObjectURL(file) }),
        title: file.name.replace(/\.[^.]+$/, ''),
        caption: '',
        folderId: globalFolderId,
        contributorId: globalContributorId,
        // split('T')[0] is string | undefined under noUncheckedIndexedAccess
        dateTaken: new Date().toISOString().split('T')[0] ?? '',
        status: 'idle',
      }))
      setItems((prev) => [...prev, ...newItems])
    },
    [globalFolderId, globalContributorId]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxSize: 50 * 1024 * 1024, // 50 MB
  })

  const updateItem = (index: number, patch: Partial<UploadItem>) =>
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index))

  const handleUploadAll = async () => {
    const pending = items.filter((it) => it.status === 'idle')
    if (!pending.length) return
    setIsUploading(true)

    const cosmicBrowser = createBucketClient({
      bucketSlug: process.env.NEXT_PUBLIC_COSMIC_BUCKET_SLUG!,
      readKey: process.env.NEXT_PUBLIC_COSMIC_READ_KEY!,
      writeKey: process.env.NEXT_PUBLIC_COSMIC_WRITE_KEY!,
    })

    for (let i = 0; i < items.length; i++) {
      // Guard: items[i] is UploadItem | undefined under noUncheckedIndexedAccess
      const item = items[i]
      if (!item) continue
      if (item.status !== 'idle') continue

      updateItem(i, { status: 'uploading' })

      try {
        // Step 1: Upload file bytes directly to Cosmic (bypasses Vercel body limit)
        const mediaRes = await cosmicBrowser.media.insertOne({
          media: item.file,
          folder: item.folderId || undefined,
        })

        const mediaName = mediaRes.media?.name
        if (!mediaName) throw new Error('No media name returned from Cosmic')

        // Step 2: Create the media-items CMS object with metadata
        const isVideo = item.file.type.startsWith('video/')
        const metaRes = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaName,
            title: item.title,
            caption: item.caption,
            folderId: item.folderId || undefined,
            contributorId: item.contributorId || undefined,
            mediaType: isVideo ? 'Video' : 'Photo',
            dateTaken: item.dateTaken,
            originalName: item.file.name,
          }),
        })

        if (!metaRes.ok) {
          const errBody = await metaRes.json().catch(() => ({}))
          throw new Error(errBody.error || `HTTP ${metaRes.status}`)
        }

        updateItem(i, { status: 'done' })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        updateItem(i, { status: 'error', errorMsg: msg })
      }
    }

    setIsUploading(false)
  }

  const pendingCount = items.filter((it) => it.status === 'idle').length
  const doneCount = items.filter((it) => it.status === 'done').length

  return (
    <div className="space-y-6">
      {/* Global defaults */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Folder (all files)</label>
          <select
            value={globalFolderId}
            onChange={(e) => setGlobalFolderId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <option value="">— No folder —</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Uploaded by (all files)</label>
          <select
            value={globalContributorId}
            onChange={(e) => setGlobalContributorId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <option value="">— Select contributor —</option>
            {contributors.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-rose-400 bg-rose-50'
            : 'border-gray-300 hover:border-rose-300 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-500 text-sm">
          {isDragActive
            ? 'Drop files here…'
            : 'Drag & drop photos or videos here, or click to select'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Max 50 MB per file</p>
      </div>

      {/* File list */}
      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{item.file.name}</span>
                <div className="flex items-center gap-2">
                  {item.status === 'done' && (
                    <span className="text-xs text-emerald-600 font-medium">✓ Uploaded</span>
                  )}
                  {item.status === 'uploading' && (
                    <span className="text-xs text-rose-500 font-medium">Uploading…</span>
                  )}
                  {item.status === 'error' && (
                    <span className="text-xs text-red-500 font-medium" title={item.errorMsg}>✗ Error</span>
                  )}
                  {item.status === 'idle' && (
                    <button
                      onClick={() => removeItem(i)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {item.status !== 'done' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItem(i, { title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date Taken</label>
                    <input
                      type="date"
                      value={item.dateTaken}
                      onChange={(e) => updateItem(i, { dateTaken: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Folder</label>
                    <select
                      value={item.folderId}
                      onChange={(e) => updateItem(i, { folderId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <option value="">— No folder —</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>{f.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Uploaded by</label>
                    <select
                      value={item.contributorId}
                      onChange={(e) => updateItem(i, { contributorId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <option value="">— Select contributor —</option>
                      {contributors.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Caption</label>
                    <textarea
                      value={item.caption}
                      onChange={(e) => updateItem(i, { caption: e.target.value })}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {pendingCount > 0 && (
        <button
          onClick={handleUploadAll}
          disabled={isUploading}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {isUploading ? 'Uploading…' : `Upload ${pendingCount} file${pendingCount !== 1 ? 's' : ''}`}
        </button>
      )}

      {doneCount > 0 && pendingCount === 0 && !isUploading && (
        <p className="text-center text-sm text-emerald-600 font-medium">
          ✓ {doneCount} file{doneCount !== 1 ? 's' : ''} uploaded successfully
        </p>
      )}
    </div>
  )
}
