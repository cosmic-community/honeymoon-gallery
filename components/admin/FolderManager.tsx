'use client'

import { useState } from 'react'

interface Folder {
  id: string
  title: string
  slug: string
  metadata: Record<string, string>
}

interface FolderManagerProps {
  folders: Folder[]
  onFoldersChange: () => void
}

interface FolderForm {
  title: string
  description: string
  location: string
  date: string
}

const empty: FolderForm = { title: '', description: '', location: '', date: '' }

export default function FolderManager({ folders, onFoldersChange }: FolderManagerProps) {
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FolderForm>(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function startCreate() {
    setEditingId(null)
    setForm(empty)
    setCreating(true)
    setError('')
  }

  function startEdit(folder: Folder) {
    setCreating(false)
    setEditingId(folder.id)
    setForm({
      title: folder.title,
      description: folder.metadata?.description || '',
      location: folder.metadata?.location || '',
      date: folder.metadata?.date || '',
    })
    setError('')
  }

  function cancel() {
    setCreating(false)
    setEditingId(null)
    setForm(empty)
    setError('')
  }

  async function saveCreate() {
    if (!form.title.trim()) { setError('Title is required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      cancel()
      onFoldersChange()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function saveEdit() {
    if (!form.title.trim()) { setError('Title is required'); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/folders/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      cancel()
      onFoldersChange()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteFolder(id: string, title: string) {
    if (!confirm(`Delete folder "${title}"? This will not delete its media items.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/folders/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())
      onFoldersChange()
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const FolderFormUI = (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Folder name *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Paris Day 1"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="e.g. Paris, France"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Short description"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button
          onClick={editingId ? saveEdit : saveCreate}
          disabled={loading}
          className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-5 py-2 transition-colors"
        >
          {loading ? 'Saving…' : editingId ? 'Save changes' : 'Create folder'}
        </button>
        <button onClick={cancel} className="text-sm text-gray-400 hover:text-gray-600 px-3">Cancel</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{folders.length} folder{folders.length !== 1 ? 's' : ''}</p>
        {!creating && !editingId && (
          <button
            onClick={startCreate}
            className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
          >
            + New folder
          </button>
        )}
      </div>

      {creating && FolderFormUI}

      {folders.length === 0 && !creating && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📁</div>
          <p>No folders yet. Create one to organise your media.</p>
        </div>
      )}

      <div className="space-y-2">
        {folders.map(folder => (
          <div key={folder.id}>
            {editingId === folder.id ? FolderFormUI : (
              <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4 hover:border-gray-200 transition-colors">
                <div>
                  <p className="font-medium text-gray-800">{folder.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {[folder.metadata?.location, folder.metadata?.date].filter(Boolean).join(' · ') || 'No details'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => startEdit(folder)}
                    className="text-sm text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteFolder(folder.id, folder.title)}
                    disabled={loading}
                    className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
