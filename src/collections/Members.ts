import type { CollectionConfig } from 'payload'
import { assignedIds, canManageMembers, isOwner, publicRead, roleOf } from '@/lib/access'
import { afterChangeRevalidate, afterDeleteRevalidate } from '@/lib/revalidate'

export const Members: CollectionConfig = {
  slug: 'members',
  admin: { useAsTitle: 'ign', group: 'Roster', defaultColumns: ['ign', 'position', 'mode', 'status'] },
  access: {
    read: publicRead,
    create: canManageMembers,
    update: ({ req }) => {
      const r = roleOf(req.user)
      if (r === 'owner') return true
      if (r === 'member-manager') return { id: { in: assignedIds(req.user) } }
      return false
    },
    delete: isOwner,
  },
  hooks: {
    afterChange: [
      afterChangeRevalidate,
      // Member Managers automatically own the profiles they create.
      async ({ doc, operation, req }) => {
        if (operation === 'create' && roleOf(req.user) === 'member-manager' && req.user?.collection === 'users') {
          const ids = [...assignedIds(req.user), doc.id]
          await req.payload.update({
            collection: 'users',
            id: req.user.id,
            data: { assignedMembers: ids },
            overrideAccess: true,
          })
        }
        return doc
      },
    ],
    afterDelete: [afterDeleteRevalidate],
  },
  fields: [
    { name: 'ign', type: 'text', required: true, maxLength: 40, label: 'CODM IGN' },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, maxLength: 60 },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'position', type: 'text', required: true, maxLength: 60, defaultValue: 'Player', label: 'Clan role / position' },
    {
      name: 'mode',
      type: 'select',
      required: true,
      defaultValue: 'MP',
      options: [
        { label: 'Multiplayer (MP)', value: 'MP' },
        { label: 'Battle Royale (BR)', value: 'BR' },
        { label: 'MP + BR', value: 'BOTH' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    { name: 'description', type: 'textarea', maxLength: 220, label: 'Short description' },
    { name: 'introduction', type: 'textarea', maxLength: 2000, label: 'Personal introduction' },
    { name: 'highlights', type: 'array', label: 'Tournament / scrim highlights', fields: [{ name: 'text', type: 'text', required: true, maxLength: 200 }] },
    { name: 'achievements', type: 'array', label: 'Individual achievements', fields: [{ name: 'text', type: 'text', required: true, maxLength: 200 }] },
    {
      name: 'socials',
      type: 'group',
      fields: [
        { name: 'discord', type: 'text', maxLength: 120 },
        { name: 'instagram', type: 'text', maxLength: 200 },
        { name: 'youtube', type: 'text', maxLength: 200 },
        { name: 'tiktok', type: 'text', maxLength: 200 },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, label: 'Feature on homepage' },
    { name: 'isDemo', type: 'checkbox', defaultValue: false, label: 'Demo data', admin: { description: 'Shown with a DEMO badge. Delete once real members are added.' } },
  ],
}
