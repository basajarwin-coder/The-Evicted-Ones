import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { DemoBadge, Empty, MediaImage, PageHero } from '@/components/ui'
import { fmtDate, getAnnouncements } from '@/lib/data'

export const metadata: Metadata = { title: 'News | TEO – The Evicted Ones' }
const labels: Record<string, string> = { announcement: 'Announcement', schedule: 'Scrim schedule', tournament: 'Tournament', 'new-member': 'New member', update: 'Clan update', reminder: 'Reminder' }

export async function NewsSection() {
  const list = [...(await getAnnouncements())].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
  return (
    <>
      <PageHero eyebrow="INTEL" title="Announcements & news">Schedules, tournament entries, new recruits and clan updates.</PageHero>
      <section className="mx-auto max-w-5xl space-y-6 px-5 py-14 sm:px-8">
        {list.length ? list.map((n) => (
          <article key={n.id} className="grid overflow-hidden border border-line bg-coal clip-cut md:grid-cols-[300px_1fr]">
            {typeof n.image === 'object' && n.image?.url && <div className="relative min-h-48"><MediaImage media={n.image} alt={n.title} sizes="300px" /></div>}
            <div className={`p-5 sm:p-7 ${typeof n.image === 'object' && n.image?.url ? '' : 'md:col-span-2'}`}>
              <p className="flex flex-wrap items-center gap-2 font-display text-[10px] font-bold tracking-[0.3em] text-ice">{n.pinned && <span className="bg-blue px-1.5 py-0.5 text-white">PINNED</span>}{(labels[n.category] ?? n.category).toUpperCase()}<span className="text-mist">· {fmtDate(n.publishedAt)}</span>{n.isDemo && <DemoBadge />}</p>
              <h2 className="mt-3 font-display text-2xl font-bold">{n.title}</h2>
              <p className="mt-3 whitespace-pre-line text-mist">{n.description}</p>
            </div>
          </article>
        )) : <Empty title="No announcements yet">Clan news will be posted here.</Empty>}
      </section>
    </>
  )
}

export default function NewsPage() {
  redirect('/#news')
}
