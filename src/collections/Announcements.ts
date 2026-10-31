import type { CollectionConfig } from 'payload'
import { isOwner, publicRead } from '@/lib/access'
import { afterChangeRevalidate, afterDeleteRevalidate } from '@/lib/revalidate'

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  admin: { useAsTitle: 'title', group: 'Content', defaultColumns: ['title', 'category', 'publishedAt'] },
  access: { read: publicRead, create: isOwner, update: isOwner, delete: isOwner },
  hooks: { afterChange: [afterChangeRevalidate], afterDelete: [afterDeleteRevalidate] },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 140 },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'update',
      options: [
        { label: 'Clan announcement', value: 'announcement' },
        { label: 'Scrim schedule', value: 'schedule' },
        { label: 'Tournament', value: 'tournament' },
        { label: 'New member', value: 'new-member' },
        { label: 'Clan update', value: 'update' },
        { label: 'Reminder', value: 'reminder' },
      ],
    },
    { name: 'description', type: 'textarea', required: true, maxLength: 2000 },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'publishedAt', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'pinned', type: 'checkbox', defaultValue: false },
    { name: 'isDemo', type: 'checkbox', defaultValue: false, label: 'Demo data' },
  ],
}
