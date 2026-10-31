import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PhotoGrid from '@/components/PhotoGrid'
import { Avatar, DemoBadge, Empty, StatusPill } from '@/components/ui'
import { getMemberBySlug, getMembers, getPhotos, modeLabel } from '@/lib/data'
import { memberSocials } from '@/lib/clan'
import { leadershipLabel } from '@/lib/roster'
import { toPhotoItems } from '@/lib/mappers'

export async function generateStaticParams() {
  const members = await getMembers().catch(() => [])
  return members.map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const m = await getMemberBySlug((await params).slug)
  return { title: m ? `${m.ign} | TEO – The Evicted Ones` : 'Member | TEO' }
}

export default async function MemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const m = await getMemberBySlug(slug)
  if (!m) notFound()
  const all = await getPhotos()
  const mine = all.filter((p) => (typeof p.member === 'object' && p.member ? p.member.id : p.member) === m.id)
  const items = toPhotoItems(mine)
  const gameplay = items.filter((i) => ['gameplay', 'victory', 'tournament'].includes(i.category))
  const socials = memberSocials(m.socials)

  return (
    <>
      <section className="relative overflow-hidden border-b border-line pt-28 pb-16 grid-bg">
        <div className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-blue/20 blur-[130px]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[360px_1fr]">
          <Avatar media={typeof m.avatar === 'object' ? m.avatar : null} name={m.ign} fit="contain" className="aspect-square w-full max-w-sm border border-line" sizes="400px" />
          <div className="self-center">
            <Link href="/#roster" className="font-display text-xs tracking-[0.3em] text-mist transition hover:text-white">← ALL MEMBERS</Link>
            {leadershipLabel(m.position) ? <p className="mt-6 inline-block bg-blue px-3 py-1 font-display text-[11px] font-bold tracking-[0.28em] text-white">{leadershipLabel(m.position)?.toUpperCase()}</p> : null}
            <p className={`${leadershipLabel(m.position) ? 'mt-4' : 'mt-6'} font-display text-xs font-semibold tracking-[0.4em] text-blue`}>{m.position.toUpperCase()}</p>
            <h1 className="mt-2 flex flex-wrap items-center gap-4 break-words font-display text-4xl font-extrabold sm:text-6xl lg:text-7xl">{m.ign}{m.isDemo && <DemoBadge />}</h1>
            {m.socials?.name ? <p className="mt-3 text-xl text-white/85">{m.socials.name}</p> : null}
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-3 sm:gap-6">
              <div><dt className="font-display text-[10px] tracking-[0.3em] text-mist">MAIN MODE</dt><dd className="mt-1 font-display text-xl font-bold">{modeLabel(m.mode)}</dd></div>
              <div><dt className="font-display text-[10px] tracking-[0.3em] text-mist">STATUS</dt><dd className="mt-2"><StatusPill status={m.status} /></dd></div>
              <div><dt className="font-display text-[10px] tracking-[0.3em] text-mist">PHOTOS</dt><dd className="mt-1 font-display text-xl font-bold">{items.length}</dd></div>
            </dl>
            {m.description && <p className="mt-8 max-w-xl text-lg text-mist">{m.description}</p>}
            <div className="mt-8">
              <p className="font-display text-[10px] tracking-[0.35em] text-mist">SOCIALS</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {(['facebook', 'instagram', 'tiktok'] as const).map((name) => {
                  const href = socials.find(([key]) => key === name)?.[1]
                  return href && /^https?:\/\//.test(href) ? (
                    <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="border border-line bg-coal px-4 py-3 font-display text-xs uppercase tracking-[0.25em] text-white transition duration-300 hover:-translate-y-0.5 hover:border-blue hover:text-ice">{name}</a>
                  ) : (
                    <span key={name} className="border border-line/60 px-4 py-3 font-display text-xs uppercase tracking-[0.25em] text-mist">{name} · not posted</span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-5 py-16 sm:px-8">
        {m.introduction && (
          <section><h2 className="font-display text-xs font-semibold tracking-[0.4em] text-blue">PERSONAL INTRODUCTION</h2><p className="mt-4 max-w-3xl whitespace-pre-line text-lg leading-relaxed text-white/85">{m.introduction}</p></section>
        )}
        <section className="grid gap-10 md:grid-cols-2">
          {[['TOURNAMENT & SCRIM HIGHLIGHTS', m.highlights], ['INDIVIDUAL ACHIEVEMENTS', m.achievements]].map(([t, list]) => (
            <div key={t as string}>
              <h2 className="font-display text-xs font-semibold tracking-[0.4em] text-blue">{t as string}</h2>
              {(list as { text: string; id?: string | null }[] | null | undefined)?.length ? (
                <ul className="mt-5 space-y-3">{(list as { text: string; id?: string | null }[]).map((h, i) => <li key={h.id ?? i} className="flex gap-3 border border-line bg-coal px-4 py-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 bg-blue" />{h.text}</li>)}</ul>
              ) : <div className="mt-5"><Empty title="Nothing recorded yet" /></div>}
            </div>
          ))}
        </section>
        <section>
          <h2 className="mb-6 font-display text-xs font-semibold tracking-[0.4em] text-blue">PHOTO GALLERY</h2>
          {items.length ? <PhotoGrid items={items} filterable /> : <Empty title="No photos yet">{m.ign}&apos;s personal gallery is empty. Photos uploaded by clan staff will show up here.</Empty>}
        </section>
        {gameplay.length > 0 && (
          <section><h2 className="mb-6 font-display text-xs font-semibold tracking-[0.4em] text-blue">GAMEPLAY SCREENSHOTS</h2><PhotoGrid items={gameplay} /></section>
        )}
      </div>
    </>
  )
}
