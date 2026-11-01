import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { MemberGrid, type MemberItem } from '@/components/MemberBrowser'
import { Empty, PageHero } from '@/components/ui'
import { getMembers } from '@/lib/data'
import { leadershipRank } from '@/lib/roster'

export const metadata: Metadata = { title: 'Management | TEO – The Evicted Ones' }

const office: Record<number, string> = {
  0: 'President / CEO',
  1: 'Vice President',
  2: 'Web Developer',
}

export async function ManagementSection() {
  const leaders = (await getMembers()).filter((member) => member.status === 'active' && leadershipRank(member.position) < 3)

  return (
    <>
      <PageHero eyebrow="CLAN OFFICE" title="Management">The President, Vice President, and Web Developer of TEO. These are the people who lead and build the clan.</PageHero>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        {leaders.length ? (
          <MemberGrid
            label="MANAGEMENT"
            items={leaders.map((member) => ({
              caption: office[leadershipRank(member.position)],
              m: { ...(member as unknown as MemberItem), realName: member.socials?.name, likes: Number(member.socials?.likes ?? 0), socials: member.socials, avatar: typeof member.avatar === 'object' ? member.avatar : null },
            }))}
          />
        ) : (
          <Empty title="Management has not been posted">When staff set a member’s title to Owner / Clan Master, Vice Clan Master, or Web Developer, that person appears here.</Empty>
        )}
      </section>
    </>
  )
}

export default function ManagementPage() {
  redirect('/#management')
}
