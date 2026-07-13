'use client'

import { useState, useEffect } from 'react'
import UploadZone from './UploadZone'
import FolderManager from './FolderManager'

type Tab = 'upload' | 'folders'

interface Contributor {
  id: string
  title: string
  slug: string
  metadata: Record<string, string>
}

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('upload')
  const [folders, setFolders] = useState<Array<{ id: string; title: string; slug: string; metadata: Record<string, string> }>>([])
  const [contributors, setContributors] = useState<Contributor[]>([])

  async function loadFolders() {
    const res = await fetch('/api/folders')
    const data = await res.json()
    setFolders(data.folders || [])
  }

  async function loadContributors() {
    const res = await fetch('/api/contributors')
    const data = await res.json()
    setContributors(data.contributors || [])
  }

  useEffect(() => {
    loadFolders()
    loadContributors()
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Upload media and manage folders</p>
        </div>
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            window.location.href = '/login'
          }}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-100">
        {(['upload', 'folders'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t === 'upload' ? '⬆️ Upload Media' : '📁 Folders'}
          </button>
        ))}
      </div>

      {tab === 'upload' && (
        <UploadZone
          folders={folders}
          contributors={contributors}
          onUploadComplete={loadFolders}
        />
      )}
      {tab === 'folders' && (
        <FolderManager folders={folders} onFoldersChange={loadFolders} />
      )}
    </div>
  )
}
