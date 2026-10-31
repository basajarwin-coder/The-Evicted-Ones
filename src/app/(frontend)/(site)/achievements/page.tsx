import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Empty, MediaImage, PageHero } from '@/components/ui'
import { fmtDate, getAchievements } from '@/lib/data'

export const metadata: Metadata = { title: 'Achievements | TEO – The Evicted Ones' }
const labels: Record<string, string> = { tournament: 'Tournament placement', scrim: 'Scrim achievement', championship: 'Championship', individual: 'Individual', milestone: 'Clan milestone' }

export async function AchievementsSection() {
  const list = await getAchievements()
  return (
    <>
      <PageHero eyebrow="HALL OF FAME" title="Achievements">Placements, titles and milestones earned by TEO and its players.</PageHero>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        {list.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <article key={a.id} className="overflow-hidden border border-line bg-coal clip-cut transition hover:border-blue/50">
                <div className="relative aspect-[16/9] bg-plate">
                  {typeof a.image === 'object' && a.image?.url ? <MediaImage media={a.image} alt={a.title} /> : <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-plate to-coal"><Image src="/teo-logo.png" alt="" width={64} height={80} className="opacity-30" /></div>}
                </div>
                <div className="p-6">
                  <p className="font-display text-[10px] font-bold tracking-[0.3em] text-ice">{(labels[a.category] ?? a.category).toUpperCase()} <span className="text-mist">· {fmtDate(a.date)}</span></p>
                  <h3 className="mt-3 font-display text-xl font-bold">{a.title}</h3>
                  {typeof a.member === 'object' && a.member && <p className="mt-1 text-sm text-blue">{a.member.ign}</p>}
                  {a.description && <p className="mt-2 text-sm text-mist">{a.description}</p>}
                </div>
              </article>
            ))}
          </div>
        ) : <Empty title="Trophy case is empty — for now">Achievements will be listed here as the clan earns them.</Empty>}
      </section>
    </>
  )
}

export default function AchievementsPage() {
  redirect('/#gallery')
}
