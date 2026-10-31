import type { CollectionConfig } from 'payload'
import { isOwner, roleOf } from '@/lib/access'

/** Private dashboard staff accounts (separate from Payload Admin / Figma SSO users). */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Staff account', plural: 'Staff accounts' },
  auth: { tokenExpiration: 60 * 60 * 12, maxLoginAttempts: 8, lockTime: 10 * 60 * 1000, depth: 0 },
  admin: { useAsTitle: 'email', group: 'Access', defaultColumns: ['email', 'name', 'role', 'active'] },
  access: {
    create: isOwner,
    delete: isOwner,
    read: ({ req }) => {
      if (roleOf(req.user) === 'owner') return true
      if (req.user?.collection === 'users') return { id: { equals: req.user.id } }
      return false
    },
    update: isOwner,
    admin: ({ req }) => req.user?.collection === 'admins',
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 80 },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'member-manager',
      saveToJWT: true,
      options: [
        { label: 'Owner / Super Admin', value: 'owner' },
        { label: 'Member Manager', value: 'member-manager' },
        { label: 'Results Manager', value: 'results-manager' },
      ],
    },
    {
      name: 'assignedMembers',
      type: 'relationship',
      relationTo: 'members',
      hasMany: true,
      admin: { description: 'Member Managers can edit only these profiles (plus any they create).' },
    },
    { name: 'active', type: 'checkbox', defaultValue: true, saveToJWT: true },
  ],
}
