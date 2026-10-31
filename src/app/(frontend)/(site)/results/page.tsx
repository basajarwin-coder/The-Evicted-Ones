import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import ResultsBrowser from '@/components/ResultsBrowser'
import { PageHero } from '@/components/ui'
import { getScrims, scrimStats } from '@/lib/data'
import { toScrimItem } from '@/lib/mappers'

export const metadata: Metadata = { title: 'Scrim Results | TEO – The Evicted Ones' }

export async function ResultsSection() {
  const scrims = await getScrims()
  const st = scrimStats(scrims)
  return (
    <>
      <PageHero eyebrow="MATCH HISTORY" title="Scrim results">Every record on this page is uploaded by TEO&apos;s results team, with the original result screenshot where available.</PageHero>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <dl className="mb-10 grid grid-cols-2 gap-px bg-line sm:grid-cols-5">
          {[['MATCHES', st.total, ''], ['WINS', st.wins, 'text-win'], ['LOSSES', st.losses, 'text-loss'], ['DRAWS', st.draws, 'text-draw'], ['WIN RATE', st.total ? `${st.winRate}%` : '—', 'text-ice']].map(([l, v, c]) => (
            <div key={String(l)} className="bg-coal p-4 sm:p-6"><dt className="font-display text-[10px] tracking-[0.16em] text-mist sm:tracking-[0.3em]">{l}</dt><dd className={`mt-2 font-display text-2xl font-extrabold sm:text-4xl ${c}`}>{v}</dd></div>
          ))}
        </dl>
        <ResultsBrowser items={scrims.map(toScrimItem)} />
      </section>
    </>
  )
}

export default function ResultsPage() {
  redirect('/#results')
}
