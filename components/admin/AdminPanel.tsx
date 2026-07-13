'use client'

import { useState, useEffect } from 'react'
import UploadZone from './UploadZone'

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

export default function AdminPanel() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [contributors, setContributors] = useState<Contributor[]>([])

  useEffect(() => {
    fetch('/api/folders')
      .then((r) => r.json())
      .then((data) => setFolders(data.folders ?? []))
      .catch(console.error)

    fetch('/api/contributors')
      .then((r) => r.json())
      .then((data) => setContributors(data.contributors ?? []))
      .catch(console.error)
  }, [])

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-serif font-semibold text-gray-900 mb-2">Upload Media</h1>
      <p className="text-gray-500 mb-8">Add photos and videos to your honeymoon gallery.</p>
      <UploadZone folders={folders} contributors={contributors} />
    </div>
  )
}
