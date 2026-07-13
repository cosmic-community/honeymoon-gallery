'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
  metadata: {
    avatar?: { imgix_url?: string }
  }
}

interface UploadFile {
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

export default function UploadZone() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [selectedContributor, setSelectedContributor] = useState<string>('')
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load folders and contributors on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [foldersRes, contributorsRes] = await Promise.all([
          fetch('/api/cms/folders'),
          fetch('/api/cms/contributors'),
        ])
        if (foldersRes.ok) {
          const data = await foldersRes.json()
          setFolders(data.folders || [])
        }
        if (contributorsRes.ok) {
          const data = await contributorsRes.json()
          setContributors(data.contributors || [])
        }
      } catch (e) {
        console.error('Failed to load folders/contributors', e)
      }
    }
    loadData()
  }, [])

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return
    const newFiles: UploadFile[] = Array.from(incoming).map((file) => ({
      file,
      preview: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : '',
      status: 'pending',
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      addFiles(e.dataTransfer.files)
    },
    [addFiles]
  )

  async function uploadAll() {
    if (files.length === 0) return

    // Fetch upload config (bucket slug + write key) from auth-gated endpoint
    const configRes = await fetch('/api/media/upload-config')
    if (!configRes.ok) {
      alert('Could not fetch upload credentials. Are you logged in?')
      return
    }
    const { bucketSlug, writeKey, readKey } = await configRes.json()

    const cosmic = createBucketClient({
      bucketSlug,
      writeKey,
      readKey: readKey ?? '',
    })

    for (let i = 0; i < files.length; i++) {
      const entry = files[i]
      if (!entry) continue
      if (entry.status === 'done') continue

      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: 'uploading' } : f))
      )

      try {
        // 1. Upload bytes directly to Cosmic media library
        const arrayBuffer = await entry.file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const mediaRes = await cosmic.media.insertOne({
          media: {
            originalname: entry.file.name,
            buffer,
          },
        })

        const uploadedMedia = (mediaRes as any).media
        const mediaName: string = uploadedMedia?.name || entry.file.name
        const imgixUrl: string = uploadedMedia?.imgix_url || ''

        // 2. Determine media type
        const isVideo = entry.file.type.startsWith('video/')
        const mediaType = isVideo ? 'Video' : 'Image'

        // 3. Build thumbnail: for images use imgix_url with resize params,
        //    for videos use the imgix_url of the uploaded media (Cosmic
        //    generates a poster frame for videos via imgix)
        const thumbnail = imgixUrl
          ? `${imgixUrl}?w=400&h=400&fit=crop&auto=format,compress`
          : ''

        // 4. Post metadata to server — creates the media-items object
        const body: Record<string, string> = {
          mediaName,
          mediaType,
          thumbnail,
          title: entry.file.name.replace(/\.[^.]+$/, ''),
        }
        if (selectedFolder) body.folderId = selectedFolder
        if (selectedContributor) body.contributorSlug = selectedContributor

        const metaRes = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!metaRes.ok) {
          throw new Error(`Metadata save failed: ${metaRes.status}`)
        }

        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'done' } : f))
        )
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: 'error', error: err?.message || 'Upload failed' }
              : f
          )
        )
      }
    }

    // 5. Revalidate home page + gallery so new media appears immediately
    await fetch('/api/revalidate', { method: 'POST' })
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i))
  }

  const allDone = files.length > 0 && files.every((f) => f.status === 'done')
  const anyUploading = files.some((f) => f.status === 'uploading')

  return (
    <div className="space-y-6">
      {/* Folder selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Folder
          </label>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="">No folder</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </div>

        {/* Contributor selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Uploaded by
          </label>
          <select
            value={selectedContributor}
            onChange={(e) => setSelectedContributor(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="">Select contributor…</option>
            {contributors.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-colors ${
          dragging
            ? 'border-rose-400 bg-rose-50'
            : 'border-gray-200 bg-gray-50 hover:border-rose-300 hover:bg-rose-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="text-4xl">📁</div>
        <p className="text-sm font-medium text-gray-600">
          Drop photos & videos here, or click to browse
        </p>
        <p className="text-xs text-gray-400">Images and videos of any size</p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((entry, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3"
            >
              {entry.preview ? (
                <img
                  src={entry.preview}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-lg">
                  🎬
                </div>
              )}
              <span className="flex-1 text-sm text-gray-700 truncate">
                {entry.file.name}
              </span>
              <span className="text-xs text-gray-400">
                {(entry.file.size / 1024 / 1024).toFixed(1)} MB
              </span>
              {entry.status === 'pending' && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                  className="text-gray-300 hover:text-red-400 text-lg leading-none"
                >
                  ×
                </button>
              )}
              {entry.status === 'uploading' && (
                <span className="text-xs text-rose-500 animate-pulse">Uploading…</span>
              )}
              {entry.status === 'done' && (
                <span className="text-xs text-green-500">✓ Done</span>
              )}
              {entry.status === 'error' && (
                <span className="text-xs text-red-500" title={entry.error}>✗ Error</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Upload button */}
      {files.length > 0 && !allDone && (
        <button
          onClick={uploadAll}
          disabled={anyUploading}
          className="w-full rounded-full bg-rose-500 py-3 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
        >
          {anyUploading ? 'Uploading…' : `Upload ${files.filter(f => f.status !== 'done').length} file(s)`}
        </button>
      )}

      {allDone && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 text-center font-medium">
          All files uploaded successfully!
        </div>
      )}
    </div>
  )
}
