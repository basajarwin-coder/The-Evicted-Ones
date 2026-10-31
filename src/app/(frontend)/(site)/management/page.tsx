import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { MemberCard, type MemberItem } from '@/components/MemberBrowser'
import { Empty, PageHero } from '@/components/ui'
import { getMembers } from '@/lib/data'
import { leadershipRank } from '@/lib/roster'

export const metadata: Metadata = { title: 'Management | TEO – The Evicted Ones' }

const office: Record<number, string> = {
  0: 'President / CEO',
  1: 'Vice President',
}

export async function ManagementSection() {
  const leaders = (await getMembers()).filter((member) => member.status === 'active' && leadershipRank(member.position) < 2)

  return (
    <>
      <PageHero eyebrow="CLAN OFFICE" title="Management">The President and Vice President of TEO. These are the people who lead the clan.</PageHero>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        {leaders.length ? (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {leaders.map((member) => (
              <div key={member.id}>
                <p className="mb-4 font-display text-xs font-bold tracking-[0.35em] text-ice">{office[leadershipRank(member.position)]}</p>
                <MemberCard m={{ ...(member as unknown as MemberItem), realName: member.socials?.name, likes: Number(member.socials?.likes ?? 0), socials: member.socials, avatar: typeof member.avatar === 'object' ? member.avatar : null }} />
              </div>
            ))}
          </div>
        ) : (
          <Empty title="Management has not been posted">When staff set a member’s title to Owner / Clan Master or Vice Clan Master, that person appears here as President or Vice President.</Empty>
        )}
      </section>
    </>
  )
}

export default function ManagementPage() {
  redirect('/#management')
}
