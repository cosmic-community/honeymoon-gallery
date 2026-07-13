// Base Cosmic object interface
export interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  content?: string;
  metadata: Record<string, any>;
  type: string;
  created_at: string;
  modified_at: string;
}

// Media file structure
export interface CosmicFile {
  url: string;
  imgix_url: string;
}

// Media types
export type MediaType = 'Photo' | 'Video';

// Contributor
export interface Contributor extends CosmicObject {
  type: 'contributors';
  metadata: {
    name?: string;
    email?: string;
    avatar?: CosmicFile;
    bio?: string;
  };
}

// Folder
export interface Folder extends CosmicObject {
  type: 'folders';
  metadata: {
    name?: string;
    description?: string;
    cover_image?: CosmicFile;
    location?: string;
    date?: string;
  };
}

// Media Item
export interface MediaItem extends CosmicObject {
  type: 'media-items';
  metadata: {
    title?: string;
    media_type?: MediaType;
    media_file?: CosmicFile;
    caption?: string;
    folder?: Folder;
    uploaded_by?: Contributor;
    date_taken?: string;
  };
}

// API response
export interface CosmicResponse<T> {
  objects: T[];
  total: number;
  limit: number;
  skip: number;
}

// Type guards
export function isFolder(obj: CosmicObject): obj is Folder {
  return obj.type === 'folders';
}

export function isMediaItem(obj: CosmicObject): obj is MediaItem {
  return obj.type === 'media-items';
}

export function isContributor(obj: CosmicObject): obj is Contributor {
  return obj.type === 'contributors';
}