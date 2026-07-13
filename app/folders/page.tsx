import { getFolders } from '@/lib/cosmic'
import FolderCard from '@/components/FolderCard'

export const metadata = {
  title: 'Folders | Honeymoon Gallery',
  description: 'Browse all photo and video folders.',
}

export default async function FoldersPage() {
  const folders = await getFolders()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-gray-900">Folders</h1>
        <p className="mt-2 text-gray-500">
          Every collection organized by place and moment.
        </p>
      </div>
      {folders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No folders have been created yet.</p>
      )}
    </div>
  )
}