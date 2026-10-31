export const CLAN_FACEBOOK = 'https://www.facebook.com/profile.php?id=61559090758170'
export const CLAN_TIKTOK = 'https://www.tiktok.com/@theevictedones'
export const CLAN_TIKTOK_NAME = 'The Evicted Ones'
export const CLAN_ESTABLISHED = '2020'
export const CLAN_REBORN = '2023'
export const CLAN_LINE = 'Stay grounded in reality, but keep your vision alive.'

const MEMBER_SOCIALS = ['facebook', 'instagram', 'tiktok'] as const

export function memberSocials(socials?: Record<string, string | null | undefined> | null) {
  return MEMBER_SOCIALS.flatMap((name) => {
    const value = socials?.[name]?.trim()
    return value ? [[name, value] as const] : []
  })
}
