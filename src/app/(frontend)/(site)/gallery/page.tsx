import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import PhotoGrid from '@/components/PhotoGrid'
import { Empty, MediaImage, PageHero } from '@/components/ui'
import { fmtDate, getAchievements, getMembers, getPhotos } from '@/lib/data'
import { toPhotoItems } from '@/lib/mappers'
import { leadershipRank } from '@/lib/roster'

const labels: Record<string, string> = { tournament: 'Tournament placement', scrim: 'Scrim achievement', championship: 'Championship', individual: 'Individual', milestone: 'Clan milestone' }

export const metadata: Metadata = { title: 'Gallery | TEO – The Evicted Ones' }

export async function GallerySection() {
  const members = await getMembers()
  const rankOf = new Map(members.map((member) => [member.slug, leadershipRank(member.position)]))
  const items = toPhotoItems(await getPhotos()).sort((a, b) => {
    const left = a.member ? rankOf.get(a.member.slug) ?? 2 : 3
    const right = b.member ? rankOf.get(b.member.slug) ?? 2 : 3
    return left - right
  })
  const trophies = await getAchievements()
  return (
    <>
      <PageHero eyebrow="MEDIA" title="Gallery">Team pictures, gameplay screenshots, tournament moments, victories, and clan achievements.</PageHero>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        {items.length ? <PhotoGrid items={items} filterable /> : <Empty title="No pictures uploaded yet">Photos uploaded by clan staff will appear here.</Empty>}
        <h2 className="mb-6 mt-16 font-display text-3xl font-bold uppercase">Achievements</h2>
        {trophies.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {trophies.map((a) => (
              <article key={a.id} className="overflow-hidden border border-line bg-coal clip-cut transition hover:border-blue/50">
                <div className="relative aspect-square bg-plate">
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
        ) : <Empty title="Trophy case is empty — for now">Achievements will be listed here with the gallery as the clan earns them.</Empty>}
      </section>
    </>
  )
}

export default function GalleryPage() {
  redirect('/#gallery')
}
