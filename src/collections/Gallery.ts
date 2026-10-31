import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { assignedIds, canManageMembers, publicRead, roleOf } from '@/lib/access'
import { afterChangeRevalidate, afterDeleteRevalidate } from '@/lib/revalidate'

export const photoCategories = [
  { label: 'Member photo', value: 'member' },
  { label: 'Team photo', value: 'team' },
  { label: 'Gameplay screenshot', value: 'gameplay' },
  { label: 'Clan activity', value: 'activity' },
  { label: 'Tournament', value: 'tournament' },
  { label: 'Victory screenshot', value: 'victory' },
]

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  labels: { singular: 'Photo', plural: 'Photos' },
  admin: { useAsTitle: 'caption', group: 'Roster', defaultColumns: ['caption', 'category', 'member', 'takenAt'] },
  access: {
    read: publicRead,
    create: canManageMembers,
    update: ({ req }) => {
      const r = roleOf(req.user)
      if (r === 'owner') return true
      if (r === 'member-manager') return { member: { in: assignedIds(req.user) } }
      return false
    },
    delete: ({ req }) => {
      const r = roleOf(req.user)
      if (r === 'owner') return true
      if (r === 'member-manager') return { member: { in: assignedIds(req.user) } }
      return false
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (!data) return data
        const r = roleOf(req.user)
        if (data.category === 'member' && !data.member) {
          throw new APIError('Member photos must be assigned to a member.', 400, undefined, true)
        }
        if (r === 'member-manager') {
          const mid = typeof data.member === 'object' ? data.member?.id : data.member
          if (!mid || !assignedIds(req.user).map(String).includes(String(mid))) {
            throw new APIError('You can only manage photos for members assigned to you.', 403, undefined, true)
          }
        }
        return data
      },
    ],
    afterChange: [afterChangeRevalidate],
    afterDelete: [
      afterDeleteRevalidate,
      async ({ doc, req }) => {
        const id = typeof doc.image === 'object' ? doc.image?.id : doc.image
        if (id) await req.payload.delete({ collection: 'media', id, overrideAccess: true }).catch(() => {})
      },
    ],
  },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text', maxLength: 160 },
    { name: 'category', type: 'select', required: true, defaultValue: 'team', options: photoCategories },
    { name: 'member', type: 'relationship', relationTo: 'members', index: true },
    { name: 'takenAt', type: 'date', label: 'Date', admin: { date: { pickerAppearance: 'dayOnly' } } },
  ],
}
