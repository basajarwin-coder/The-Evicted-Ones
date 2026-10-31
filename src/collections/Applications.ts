import type { CollectionConfig } from 'payload'
import { canManageMembers, roleOf } from '@/lib/access'

export const Applications: CollectionConfig = {
  slug: 'applications',
  labels: { singular: 'Application', plural: 'Applications' },
  admin: { useAsTitle: 'ign', group: 'Roster', defaultColumns: ['ign', 'playerId', 'mode', 'status', 'createdAt'] },
  // Private: anyone may submit, only authorised staff may read or review.
  access: { create: () => true, read: canManageMembers, update: canManageMembers, delete: canManageMembers },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && data && !roleOf(req.user)) {
          data.status = 'pending'
          delete data.reviewNote
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'ign', type: 'text', required: true, maxLength: 40, label: 'CODM IGN' },
    { name: 'playerId', type: 'text', required: true, maxLength: 30 },
    { name: 'mode', type: 'select', required: true, options: [{ label: 'MP', value: 'MP' }, { label: 'BR', value: 'BR' }, { label: 'MP + BR', value: 'BOTH' }] },
    { name: 'rank', type: 'text', required: true, maxLength: 40 },
    { name: 'previousClans', type: 'textarea', maxLength: 500 },
    { name: 'availability', type: 'textarea', required: true, maxLength: 500 },
    { name: 'introduction', type: 'textarea', required: true, maxLength: 1500 },
    { name: 'status', type: 'select', required: true, defaultValue: 'pending', index: true, options: [{ label: 'Pending', value: 'pending' }, { label: 'Accepted', value: 'accepted' }, { label: 'Rejected', value: 'rejected' }] },
    { name: 'reviewNote', type: 'textarea', maxLength: 500 },
  ],
}
