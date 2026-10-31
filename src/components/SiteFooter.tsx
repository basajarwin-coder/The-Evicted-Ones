import Image from 'next/image'
import Link from 'next/link'
import { getSettings } from '@/lib/data'
import { CLAN_FACEBOOK, CLAN_TIKTOK } from '@/lib/clan'

export default async function SiteFooter() {
  const s = await getSettings().catch(() => null)
  const socials = [
    ['Facebook', CLAN_FACEBOOK],
    ['TikTok', CLAN_TIKTOK],
    ['Instagram', s?.instagram],
  ].filter((x): x is [string, string] => !!x[1])
  return (
    <footer className="border-t border-line bg-coal">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-4">
            <Image src="/teo-logo.png" alt="TEO" width={52} height={64} />
            <div>
              <p className="font-display text-2xl font-extrabold tracking-[0.15em]">TEO</p>
              <p className="font-display text-[10px] tracking-[0.4em] text-mist">THE EVICTED ONES</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm text-mist">A competitive Call of Duty: Mobile clan. Discipline. Teamwork. Domination.</p>
        </div>
        <div>
          <p className="font-display text-xs font-semibold tracking-[0.3em] text-blue">EXPLORE</p>
          <ul className="mt-4 space-y-2 text-sm text-mist">
            {[['/#roster', 'Members'], ['/#teams', 'Teams'], ['/#management', 'Management'], ['/#socials', 'Socials'], ['/#results', 'Scrim Results'], ['/#gallery', 'Gallery'], ['/#news', 'News'], ['/#join', 'Join TEO']].map(([h, l]) => (
              <li key={h}><Link href={h} className="transition hover:text-white">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-display text-xs font-semibold tracking-[0.3em] text-blue">FOLLOW</p>
          {socials.length ? (
            <ul className="mt-4 space-y-2 text-sm text-mist">
              {socials.map(([l, h]) => (
                <li key={l}><a href={h} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">{l}</a></li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-mist">Social links are coming soon.</p>
          )}
        </div>
      </div>
      <div className="border-t border-line px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-xs text-mist">
        © {new Date().getFullYear()} TEO – The Evicted Ones. Not affiliated with Activision or Call of Duty: Mobile.
        <Link href="/dashboard" className="ml-3 opacity-40 hover:opacity-100">Staff</Link>
      </div>
    </footer>
  )
}
