import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHero } from '@/components/ui'
import { CLAN_ESTABLISHED, CLAN_FACEBOOK, CLAN_LINE, CLAN_REBORN, CLAN_TIKTOK, CLAN_TIKTOK_NAME } from '@/lib/clan'

export const metadata: Metadata = { title: 'Socials | TEO – The Evicted Ones' }

const accounts = [
  ['Facebook', 'Clan page', CLAN_FACEBOOK],
  ['TikTok', CLAN_TIKTOK_NAME, CLAN_TIKTOK],
] as const

export function SocialsSection() {
  return (
    <>
      <PageHero eyebrow="THE CLAN" title="Socials">Official TEO accounts. Established {CLAN_ESTABLISHED}. Reborn {CLAN_REBORN}.</PageHero>
      <section className="mx-auto grid max-w-5xl gap-5 px-5 py-14 sm:px-8 md:grid-cols-2">
        {accounts.map(([name, handle, href]) => (
          <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="border border-line bg-coal p-8 transition hover:border-blue">
            <p className="font-display text-xs font-semibold tracking-[0.35em] text-blue">{name}</p>
            <p className="mt-3 font-display text-3xl font-bold uppercase">{handle}</p>
            <p className="mt-6 font-display text-xs tracking-[0.22em] text-ice">OPEN {name.toUpperCase()} →</p>
          </a>
        ))}
        <p className="md:col-span-2 mt-4 font-display text-sm tracking-[0.08em] text-ice">{CLAN_LINE}</p>
      </section>
    </>
  )
}

export default function SocialsPage() {
  redirect('/#socials')
}
