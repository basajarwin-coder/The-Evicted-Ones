import type { GlobalConfig } from 'payload'
import { isOwner, publicRead } from '@/lib/access'
import { globalAfterChangeRevalidate } from '@/lib/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Website settings',
  access: { read: publicRead, update: isOwner },
  hooks: { afterChange: [globalAfterChangeRevalidate] },
  fields: [
    { name: 'tagline', type: 'text', defaultValue: 'THE EVICTED ONES', maxLength: 80 },
    { name: 'intro', type: 'textarea', maxLength: 600, defaultValue: 'TEO is a competitive Call of Duty: Mobile clan built on discipline, teamwork and relentless practice.' },
    { name: 'recruitmentOpen', type: 'checkbox', defaultValue: true },
    { name: 'discord', type: 'text', maxLength: 200 },
    { name: 'youtube', type: 'text', maxLength: 200 },
    { name: 'instagram', type: 'text', maxLength: 200 },
    { name: 'tiktok', type: 'text', maxLength: 200 },
    { name: 'facebook', type: 'text', maxLength: 200 },
  ],
}
