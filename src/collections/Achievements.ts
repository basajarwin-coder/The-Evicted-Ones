import type { CollectionConfig } from 'payload'
import { isOwner, publicRead } from '@/lib/access'
import { afterChangeRevalidate, afterDeleteRevalidate } from '@/lib/revalidate'

export const Achievements: CollectionConfig = {
  slug: 'achievements',
  admin: { useAsTitle: 'title', group: 'Competition', defaultColumns: ['title', 'category', 'date'] },
  access: { read: publicRead, create: isOwner, update: isOwner, delete: isOwner },
  hooks: { afterChange: [afterChangeRevalidate], afterDelete: [afterDeleteRevalidate] },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 120 },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'tournament',
      options: [
        { label: 'Tournament placement', value: 'tournament' },
        { label: 'Scrim achievement', value: 'scrim' },
        { label: 'Championship win', value: 'championship' },
        { label: 'Individual achievement', value: 'individual' },
        { label: 'Clan milestone', value: 'milestone' },
      ],
    },
    { name: 'date', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'description', type: 'textarea', maxLength: 800 },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'member', type: 'relationship', relationTo: 'members', admin: { description: 'For individual achievements.' } },
  ],
}
