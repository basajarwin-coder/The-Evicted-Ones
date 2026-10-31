'use client'

import Image from 'next/image'
import { useState } from 'react'
import { OutcomeBadge } from '@/components/ui'
import { Lightbox } from '@/components/PhotoGrid'

export type ScrimItem = {
  id: string
  opponent: string
  date: string
  mode: string
  map: string
  matchType: string
  teoScore: number
  opponentScore: number
  outcome: 'win' | 'loss' | 'draw'
  description?: string | null
  screenshot?: { url: string; alt: string } | null
}

const edge = { win: 'from-win', loss: 'from-loss', draw: 'from-draw' }

export default function ScrimCard({ s }: { s: ScrimItem }) {
  const [view, setView] = useState(false)
  return (
    <article className="group relative overflow-hidden border border-line bg-coal clip-cut transition hover:border-blue/50">
      <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${edge[s.outcome]} to-transparent`} />
      <div className="grid gap-0 md:grid-cols-[1fr_260px]">
        <div className="p-6 pl-8">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-display font-bold tracking-[0.25em] text-ice">{s.matchType.toUpperCase()}</span>
            <span className="text-mist">{s.date}</span>
          </div>
          <h3 className="mt-3 break-words font-display text-xl font-extrabold uppercase sm:text-3xl">
            TEO <span className="text-mist">vs</span> {s.opponent}
          </h3>
          <dl className="mt-5 grid grid-cols-3 gap-2 text-sm sm:gap-4">
            <div><dt className="font-display text-[10px] tracking-[0.12em] text-mist sm:tracking-[0.3em]">MODE</dt><dd className="mt-1 break-words font-semibold">{s.mode}</dd></div>
            <div><dt className="font-display text-[10px] tracking-[0.12em] text-mist sm:tracking-[0.3em]">MAP</dt><dd className="mt-1 break-words font-semibold">{s.map}</dd></div>
            <div><dt className="font-display text-[10px] tracking-[0.12em] text-mist sm:tracking-[0.3em]">RESULT</dt><dd className="mt-1 font-display text-lg font-extrabold tabular-nums sm:text-xl">{s.teoScore} - {s.opponentScore}</dd></div>
          </dl>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <OutcomeBadge outcome={s.outcome} />
            {s.description && <p className="text-sm text-mist">{s.description}</p>}
          </div>
        </div>
        {s.screenshot ? (
          <button onClick={() => setView(true)} className="relative min-h-44 border-t border-line md:border-l md:border-t-0" aria-label={`View ${s.opponent} result screenshot`}>
            <Image src={s.screenshot.url} alt={s.screenshot.alt} fill sizes="260px" className="object-cover transition duration-700 group-hover:scale-105" />
            <span className="absolute bottom-2 right-2 bg-ink/80 px-2 py-1 font-display text-[10px] tracking-[0.25em]">VIEW SCREENSHOT</span>
          </button>
        ) : (
          <div className="hidden place-items-center border-l border-line bg-steel/50 text-xs tracking-[0.25em] text-mist md:grid">NO SCREENSHOT</div>
        )}
      </div>
      {view && s.screenshot && (
        <Lightbox items={[{ id: s.id, url: s.screenshot.url, alt: s.screenshot.alt, caption: `TEO vs ${s.opponent} · ${s.teoScore}-${s.opponentScore}`, category: 'result', categoryLabel: 'Result screenshot', date: s.date }]} index={0} onClose={() => setView(false)} onIndex={() => {}} />
      )}
    </article>
  )
}
