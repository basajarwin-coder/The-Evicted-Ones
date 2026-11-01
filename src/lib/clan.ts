export const CLAN_FACEBOOK = 'https://www.facebook.com/profile.php?id=61559090758170'
export const CLAN_TIKTOK = 'https://www.tiktok.com/@theevictedones'
export const CLAN_TIKTOK_NAME = 'The Evicted Ones'
export const CLAN_ESTABLISHED = '2020'
export const CLAN_REBORN = '2023'
export const CLAN_LINE = 'Stay grounded in reality, but keep your vision alive.'

const MEMBER_SOCIALS = ['facebook', 'instagram', 'tiktok'] as const

const SOCIAL_BASE: Record<(typeof MEMBER_SOCIALS)[number], { domain: RegExp; profile: (handle: string) => string }> = {
  facebook: { domain: /^(www\.|m\.|web\.)?(facebook\.com|fb\.com|fb\.me)\//i, profile: (h) => `https://www.facebook.com/${h}` },
  instagram: { domain: /^(www\.)?(instagram\.com|instagr\.am)\//i, profile: (h) => `https://www.instagram.com/${h}` },
  tiktok: { domain: /^(www\.|vm\.|vt\.|m\.)?tiktok\.com\//i, profile: (h) => `https://www.tiktok.com/@${h}` },
}

/** Staff type socials freely (full link, bare domain, or @handle); turn each into a full https link. */
function socialUrl(name: (typeof MEMBER_SOCIALS)[number], raw: string) {
  const value = raw.trim()
  if (/^https?:\/\//i.test(value)) return value
  if (SOCIAL_BASE[name].domain.test(value)) return `https://${value}`
  const handle = value.replace(/^@+/, '').replace(/\s+/g, '')
  return handle && !handle.includes('/') ? SOCIAL_BASE[name].profile(handle) : ''
}

export function memberSocials(socials?: Record<string, string | null | undefined> | null) {
  return MEMBER_SOCIALS.flatMap((name) => {
    const value = socials?.[name]?.trim()
    const url = value ? socialUrl(name, value) : ''
    return url ? [[name, url] as const] : []
  })
}
