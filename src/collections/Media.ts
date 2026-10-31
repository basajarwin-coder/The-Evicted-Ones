import type { CollectionConfig } from 'payload'

import { createFolderField, createTagField } from 'payload'
import { isStaff, publicRead } from '@/lib/access'
import { afterChangeRevalidate, afterDeleteRevalidate } from '@/lib/revalidate'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: publicRead,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: { afterChange: [afterChangeRevalidate], afterDelete: [afterDeleteRevalidate] },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    createFolderField({ relationTo: 'folders' }),
    createTagField({ relationTo: 'tags' }),
  ],
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'public, max-age=300, s-maxage=300')
      return headers
    },
  },
}
