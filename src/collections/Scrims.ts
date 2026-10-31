import type { CollectionConfig } from 'payload'
import { canManageResults, publicRead } from '@/lib/access'
import { afterChangeRevalidate, afterDeleteRevalidate } from '@/lib/revalidate'

export const gameModes = ['Search & Destroy', 'Hardpoint', 'Domination', 'Control', 'Frontline', 'Team Deathmatch', 'Battle Royale', 'Other']

export const Scrims: CollectionConfig = {
  slug: 'scrims',
  labels: { singular: 'Match result', plural: 'Match results' },
  admin: { useAsTitle: 'opponent', group: 'Competition', defaultColumns: ['opponent', 'matchDate', 'mode', 'outcome'] },
  access: { read: publicRead, create: canManageResults, update: canManageResults, delete: canManageResults },
  hooks: { afterChange: [afterChangeRevalidate], afterDelete: [
    afterDeleteRevalidate,
    async ({ doc, req }) => {
      const id = typeof doc.screenshot === 'object' ? doc.screenshot?.id : doc.screenshot
      if (id) await req.payload.delete({ collection: 'media', id, overrideAccess: true }).catch(() => {})
    },
  ] },
  fields: [
    { name: 'opponent', type: 'text', required: true, maxLength: 80, index: true },
    { name: 'matchDate', type: 'date', required: true, index: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'mode', type: 'select', required: true, options: gameModes.map((m) => ({ label: m, value: m })) },
    { name: 'map', type: 'text', required: true, maxLength: 60 },
    { name: 'matchType', type: 'select', required: true, defaultValue: 'scrim', options: [{ label: 'Scrim', value: 'scrim' }, { label: 'Tournament', value: 'tournament' }] },
    { name: 'teoScore', type: 'number', required: true, min: 0, max: 999 },
    { name: 'opponentScore', type: 'number', required: true, min: 0, max: 999 },
    { name: 'outcome', type: 'select', required: true, index: true, options: [{ label: 'Win', value: 'win' }, { label: 'Loss', value: 'loss' }, { label: 'Draw', value: 'draw' }] },
    { name: 'screenshot', type: 'upload', relationTo: 'media' },
    { name: 'description', type: 'textarea', maxLength: 600 },
  ],
}
