/** Lower numbers appear first. Vice is checked before Clan Master so it does not match both. */
export function leadershipRank(position?: string | null) {
  const value = (position ?? '').toLowerCase()
  if (value.includes('vice') && (value.includes('master') || value.includes('owner'))) return 1
  if (value.includes('clan master') || value.includes('owner')) return 0
  if (value.includes('web developer')) return 2
  return 3
}

export function leadershipLabel(position?: string | null) {
  const rank = leadershipRank(position)
  if (rank === 0) return 'Owner / Clan Master'
  if (rank === 1) return 'Vice Clan Master'
  if (rank === 2) return 'Web Developer'
  return null
}

export function sortMembers<T extends { position?: string | null; ign?: string | null }>(members: T[]) {
  return [...members].sort((a, b) => {
    const rank = leadershipRank(a.position) - leadershipRank(b.position)
    if (rank !== 0) return rank
    return String(a.ign ?? '').localeCompare(String(b.ign ?? ''))
  })
}
