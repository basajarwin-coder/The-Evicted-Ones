import type { Gallery, Member, Scrim } from '@/payload-types'
import type { PhotoItem } from '@/components/PhotoGrid'
import type { ScrimItem } from '@/components/ScrimCard'
import { fmtDate } from '@/lib/data'

const catLabels: Record<string, string> = {
  member: 'Member photo', team: 'Team photo', gameplay: 'Gameplay', activity: 'Clan activity', tournament: 'Tournament', victory: 'Victory',
}

export function toPhotoItems(photos: Gallery[]): PhotoItem[] {
  return photos.flatMap((p) => {
    const img = typeof p.image === 'object' ? p.image : null
    if (!img?.url) return []
    const m = typeof p.member === 'object' && p.member ? p.member : null
    return [{
      id: p.id, url: img.url, alt: p.caption || img.alt || 'TEO photo', caption: p.caption, category: p.category,
      categoryLabel: catLabels[p.category] ?? p.category, date: fmtDate(p.takenAt),
      member: m ? { ign: (m as Member).ign, slug: (m as Member).slug } : null,
    }]
  })
}

export function toScrimItem(s: Scrim): ScrimItem {
  const shot = typeof s.screenshot === 'object' && s.screenshot?.url ? { url: s.screenshot.url, alt: s.screenshot.alt || `${s.opponent} result` } : null
  return {
    id: s.id, opponent: s.opponent, date: s.matchDate, mode: s.mode, map: s.map, matchType: s.matchType,
    teoScore: s.teoScore, opponentScore: s.opponentScore, outcome: s.outcome, description: s.description, screenshot: shot,
  }
}
