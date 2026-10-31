import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import MemberBrowser, { type MemberItem } from '@/components/MemberBrowser'
import { getMembers } from '@/lib/data'

export const metadata: Metadata = { title: 'Members | TEO – The Evicted Ones' }

export async function MembersSection() {
  const members = await getMembers()
  const items: MemberItem[] = members.map((m) => ({
    id: m.id, slug: m.slug, ign: m.ign, realName: m.socials?.name, likes: Number(m.socials?.likes ?? 0), position: m.position, mode: m.mode, status: m.status, description: m.description,
    avatar: typeof m.avatar === 'object' ? m.avatar : null, isDemo: m.isDemo, socials: m.socials,
  }))
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <p className="font-display text-xs font-semibold tracking-[0.4em] text-blue">THE ROSTER</p>
      <h2 className="mt-3 font-display text-4xl font-extrabold uppercase sm:text-6xl">TEO members</h2>
      <p className="mt-4 max-w-2xl text-lg text-mist">Meet the players who carry the TEO name. Select a card to open a full profile and personal gallery.</p>
      <div className="mt-10"><MemberBrowser members={items} /></div>
    </section>
  )
}

export async function TeamsSection() {
  const members = await getMembers()
  const items: MemberItem[] = members.map((m) => ({
    id: m.id, slug: m.slug, ign: m.ign, realName: m.socials?.name, likes: Number(m.socials?.likes ?? 0), position: m.position, mode: m.mode, status: m.status, description: m.description,
    avatar: typeof m.avatar === 'object' ? m.avatar : null, isDemo: m.isDemo, socials: m.socials,
  }))
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <p className="font-display text-xs font-semibold tracking-[0.4em] text-blue">THE TEAMS</p>
      <h2 className="mt-3 font-display text-4xl font-extrabold uppercase sm:text-6xl">Member teams</h2>
      <p className="mt-4 max-w-2xl text-lg text-mist">Competitive roster, casual games, and scrim players. Filter by the main they use.</p>
      <div className="mt-10"><MemberBrowser members={items} filters="teams" /></div>
    </section>
  )
}

export default function MembersPage() {
  redirect('/#roster')
}
