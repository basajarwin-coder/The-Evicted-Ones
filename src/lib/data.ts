import { unstable_cache } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { CONTENT_TAG } from '@/lib/revalidate'
import { defaultSettings, supabaseConfigured } from '@/lib/supabase-db'
import { sortMembers } from '@/lib/roster'
import type { Member, Gallery, Scrim, Achievement, Announcement, SiteSetting, Media } from '@/payload-types'

const cached = <A extends unknown[], R>(fn: (...a: A) => Promise<R>, key: string) =>
  unstable_cache(fn, ['teo', key], { tags: [CONTENT_TAG], revalidate: 3600 })

export const getSettings = cached(async (): Promise<SiteSetting> => {
  if (!supabaseConfigured()) return defaultSettings()
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', overrideAccess: false })
}, 'settings')

export const getMembers = cached(async (): Promise<Member[]> => {
  if (!supabaseConfigured()) return []
  const payload = await getPayloadClient()
  const r = await payload.find({ collection: 'members', overrideAccess: false, depth: 1, limit: 200, sort: 'ign' })
  return sortMembers(r.docs)
}, 'members')

export const getMemberBySlug = cached(async (slug: string): Promise<Member | null> => {
  if (!supabaseConfigured()) return null
  const payload = await getPayloadClient()
  const r = await payload.find({ collection: 'members', overrideAccess: false, depth: 1, limit: 1, where: { slug: { equals: slug } } })
  return r.docs[0] ?? null
}, 'member')

export const getPhotos = cached(async (): Promise<Gallery[]> => {
  if (!supabaseConfigured()) return []
  const payload = await getPayloadClient()
  const r = await payload.find({ collection: 'gallery', overrideAccess: false, depth: 2, limit: 500, sort: '-takenAt' })
  return r.docs
}, 'photos')

export const getScrims = cached(async (): Promise<Scrim[]> => {
  if (!supabaseConfigured()) return []
  const payload = await getPayloadClient()
  const r = await payload.find({ collection: 'scrims', overrideAccess: false, depth: 1, limit: 1000, sort: '-matchDate' })
  return r.docs
}, 'scrims')

export const getAchievements = cached(async (): Promise<Achievement[]> => {
  if (!supabaseConfigured()) return []
  const payload = await getPayloadClient()
  const r = await payload.find({ collection: 'achievements', overrideAccess: false, depth: 2, limit: 200, sort: '-date' })
  return r.docs
}, 'achievements')

export const getAnnouncements = cached(async (): Promise<Announcement[]> => {
  if (!supabaseConfigured()) return []
  const payload = await getPayloadClient()
  const r = await payload.find({ collection: 'announcements', overrideAccess: false, depth: 1, limit: 100, sort: '-publishedAt' })
  return r.docs
}, 'announcements')

export const mediaOf = (m: unknown): Media | null => (m && typeof m === 'object' ? (m as Media) : null)

export function scrimStats(scrims: Scrim[]) {
  const wins = scrims.filter((s) => s.outcome === 'win').length
  const losses = scrims.filter((s) => s.outcome === 'loss').length
  const draws = scrims.filter((s) => s.outcome === 'draw').length
  const total = scrims.length
  return { total, wins, losses, draws, winRate: total ? Math.round((wins / total) * 100) : 0 }
}

export const modeLabel = (m?: string | null) => (m === 'BOTH' ? 'MP + BR' : m ?? '')
export const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) : ''
