'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'

interface Folder {
  id: string
  title: string
  slug: string
  metadata: Record<string, string>
}

interface UploadItem {
  file: File
  id: string
  preview: string
  title: string
  caption: string
  dateTaken: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress: number
  error?: string
}

interface UploadZoneProps {
  folders: Folder[]
  onUploadComplete: () => void
}

interface UploadConfig {
  uploadUrl: string
  writeKey: string
}

export default function UploadZone({ folders, onUploadComplete }: UploadZoneProps) {
  const [items, setItems] = useState<UploadItem[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | File[]) {
    const newItems: UploadItem[] = Array.from(files).map(file => ({
      file,
      id: Math.random().toString(36).slice(2),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      title: file.name.replace(/\.[^.]+$/, ''),
      caption: '',
      dateTaken: new Date().toISOString().split('T')[0] ?? '',
      status: 'pending',
      progress: 0,
    }))
    setItems(prev => [...prev, ...newItems])
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files)
  }

  function updateItem(id: string, patch: Partial<UploadItem>) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  // Upload the raw file bytes DIRECTLY to Cosmic (bypasses the Vercel 4.5MB
  // serverless request limit). Uses XHR so we can report upload progress.
  function uploadToCosmic(
    config: UploadConfig,
    file: File,
    onProgress: (pct: number) => void,
  ): Promise<{ name: string; url: string; imgix_url: string }> {
    return new Promise((resolve, reject) => {
      const fd = new FormData()
      fd.append('media', file)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', config.uploadUrl)
      xhr.setRequestHeader('Authorization', `Bearer ${config.writeKey}`)

      xhr.upload.onprogress = e => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText)
            if (json?.media?.name) {
              resolve(json.media)
            } else {
              reject(new Error('Cosmic upload returned no media name'))
            }
          } catch {
            reject(new Error('Could not parse Cosmic upload response'))
          }
        } else {
          reject(new Error(`Cosmic upload failed (${xhr.status}): ${xhr.responseText}`))
        }
      }

      xhr.onerror = () => reject(new Error('Network error during upload'))
      xhr.send(fd)
    })
  }

  async function uploadAll() {
    const pending = items.filter(i => i.status === 'pending')
    if (!pending.length) return
    setUploading(true)

    // Fetch the auth-gated upload credential once for this batch.
    let config: UploadConfig
    try {
      const cfgRes = await fetch('/api/media/upload-config')
      if (!cfgRes.ok) throw new Error(await cfgRes.text())
      config = await cfgRes.json()
    } catch (err) {
      // Mark everything as errored if we can't get the credential.
      for (const item of pending) {
        updateItem(item.id, { status: 'error', error: `Could not start upload: ${(err as Error).message}` })
      }
      setUploading(false)
      return
    }

    const folder = folders.find(f => f.id === selectedFolder)

    for (const item of pending) {
      updateItem(item.id, { status: 'uploading', progress: 0 })
      try {
        // 1) Send the file bytes straight to Cosmic.
        const media = await uploadToCosmic(config, item.file, pct =>
          updateItem(item.id, { progress: pct }),
        )

        // 2) Create the media-item object via our API (tiny JSON payload).
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaName: media.name,
            originalName: item.file.name,
            mimeType: item.file.type,
            title: item.title,
            caption: item.caption,
            dateTaken: item.dateTaken,
            folderSlug: folder?.slug,
          }),
        })
        if (!res.ok) throw new Error(await res.text())
        updateItem(item.id, { status: 'done', progress: 100 })
      } catch (err) {
        updateItem(item.id, { status: 'error', error: (err as Error).message })
      }
    }
    setUploading(false)
    onUploadComplete()
  }

  const pendingCount = items.filter(i => i.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Folder selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Upload to folder:</label>
        <select
          value={selectedFolder}
          onChange={e => setSelectedFolder(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          <option value="">No folder (ungrouped)</option>
          {folders.map(f => (
            <option key={f.id} value={f.id}>{f.title}</option>
          ))}
        </select>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-rose-400 bg-rose-50'
            : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileInput}
        />
        <div className="text-4xl mb-3">📁</div>
        <p className="text-gray-600 font-medium">Drag & drop photos or videos here</p>
        <p className="text-gray-400 text-sm mt-1">or click to browse files</p>
        <p className="text-gray-300 text-xs mt-3">Supports JPG, PNG, GIF, WEBP, MP4, MOV, and more — large files welcome</p>
      </div>

      {/* File list */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map(item => (
            <div
              key={item.id}
              className={`flex gap-4 items-start bg-gray-50 rounded-xl p-4 border ${
                item.status === 'done' ? 'border-green-200 bg-green-50' :
                item.status === 'error' ? 'border-red-200 bg-red-50' :
                item.status === 'uploading' ? 'border-rose-200 bg-rose-50' :
                'border-gray-100'
              }`}
            >
              {/* Preview */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                {item.preview
                  ? <img src={item.preview} alt="" className="w-full h-full object-cover" />
                  : <span className="text-2xl">🎬</span>
                }
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={item.title}
                  onChange={e => updateItem(item.id, { title: e.target.value })}
                  placeholder="Title"
                  disabled={item.status !== 'pending'}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:opacity-60"
                />
                <input
                  type="text"
                  value={item.caption}
                  onChange={e => updateItem(item.id, { caption: e.target.value })}
                  placeholder="Caption (optional)"
                  disabled={item.status !== 'pending'}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:opacity-60"
                />
                <input
                  type="date"
                  value={item.dateTaken}
                  onChange={e => updateItem(item.id, { dateTaken: e.target.value })}
                  disabled={item.status !== 'pending'}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:opacity-60"
                />
              </div>

              {/* Status / remove */}
              <div className="flex flex-col items-end gap-1 min-w-[70px]">
                {item.status === 'pending' && (
                  <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 text-lg">✕</button>
                )}
                {item.status === 'uploading' && (
                  <span className="text-xs text-rose-500 font-medium">{item.progress}%</span>
                )}
                {item.status === 'done' && <span className="text-xs text-green-600 font-medium">✓ Done</span>}
                {item.status === 'error' && (
                  <span className="text-xs text-red-500 font-medium" title={item.error}>✗ Error</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {pendingCount > 0 && (
        <button
          onClick={uploadAll}
          disabled={uploading}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition-colors"
        >
          {uploading ? 'Uploading…' : `Upload ${pendingCount} file${pendingCount > 1 ? 's' : ''}`}
        </button>
      )}

      {items.every(i => i.status === 'done') && items.length > 0 && (
        <div className="text-center">
          <p className="text-green-600 font-medium mb-3">🎉 All uploads complete!</p>
          <button
            onClick={() => setItems([])}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Clear and upload more
          </button>
        </div>
      )}
    </div>
  )
}
