# Honeymoon Gallery

![App Preview](https://imgix.cosmicjs.com/f40125d0-7e52-11f1-a3cf-2f9ee2d50481-autopilot-photo-1525874684015-58379d421a52-1783903017123.jpeg?w=1200&h=630&fit=crop&auto=format,compress)

A beautiful, modern photo & video gallery website that lets multiple people upload and organize their favorite memories by folder. Perfect for couples sharing honeymoon photos organized by city, or any group collaboration on a shared media collection.

## Features

- 📸 **Organized Folders** — Browse media grouped into folders (e.g. cities you visited)
- 🎥 **Photos & Videos** — Support for both image and video media items
- 👤 **Contributors** — See who uploaded each memory
- 🖼️ **Beautiful Gallery Grid** — Responsive masonry-style layouts with imgix optimization
- 🔍 **Detailed Views** — Dedicated pages for folders, media items, and contributors
- 📱 **Fully Responsive** — Looks stunning on mobile, tablet, and desktop
- ⚡ **Fast & SEO Friendly** — Built on Next.js 16 App Router with Server Components

## Clone this Project

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Project](https://img.shields.io/badge/Clone%20this%20Project-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmicjs.com/projects/new?clone_bucket=6a5432db67f2f6a3f805c776&clone_repository=6a5433e567f2f6a3f805c7a5)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> "Create content models for: Build a photo gallery website that enables multiple people to upload photos / videos and organize by folder. Example: a husband and wife upload photos of their honeymoon to Italy. Organize by city."

### Code Generation Prompt

> Build a Next.js application for a website called "Honeymoon Gallery". Create a beautiful, modern, responsive design with a homepage and pages for each content type. Build a photo gallery website that enables multiple people to upload photos / videos and organize by folder. Example: a husband and wife upload photos of their honeymoon to Italy. Organize by city.

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## Technologies Used

- [Next.js 16](https://nextjs.org) — App Router with React Server Components
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Cosmic](https://www.cosmicjs.com) — Headless CMS
- [Cosmic SDK](https://www.cosmicjs.com/docs)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) or Node.js 18+
- A [Cosmic](https://www.cosmicjs.com) account with a bucket containing `contributors`, `folders`, and `media-items` object types

### Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Set your environment variables (`COSMIC_BUCKET_SLUG`, `COSMIC_READ_KEY`, `COSMIC_WRITE_KEY`)

4. Run the development server:

```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Cosmic SDK Examples

```typescript
import { cosmic } from '@/lib/cosmic'

// Fetch all folders
const { objects: folders } = await cosmic.objects
  .find({ type: 'folders' })
  .props(['id', 'slug', 'title', 'metadata'])
  .depth(1)

// Fetch media items in a folder
const { objects: mediaItems } = await cosmic.objects
  .find({ type: 'media-items', 'metadata.folder': folderId })
  .depth(1)
```

## Cosmic CMS Integration

This app reads three object types from your Cosmic bucket:

- **Contributors** — `name`, `email`, `avatar`, `bio`
- **Folders** — `name`, `description`, `cover_image`, `location`, `date`
- **Media Items** — `title`, `media_type`, `media_file`, `caption`, `folder`, `uploaded_by`, `date_taken`

Learn more in the [Cosmic docs](https://www.cosmicjs.com/docs).

## Deployment Options

### Vercel

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add your environment variables
4. Deploy

### Netlify

1. Push your code to GitHub
2. Import on [Netlify](https://netlify.com)
3. Configure environment variables and build command `bun run build`

<!-- README_END -->