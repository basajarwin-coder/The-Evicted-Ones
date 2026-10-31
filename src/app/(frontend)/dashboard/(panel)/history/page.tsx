import { PageHead, card } from '@/components/dashboard/server'
import { OutcomeBadge } from '@/components/ui'
import { requireUser } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { fmtDate, scrimStats } from '@/lib/data'

export default async function HistoryAdmin() {
  await requireUser(['owner', 'results-manager'])
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'scrims', sort: '-matchDate', limit: 1000, depth: 0, overrideAccess: true })
  const st = scrimStats(docs)
  const group = (key: (s: (typeof docs)[number]) => string) => {
    const m = new Map<string, { w: number; l: number; d: number }>()
    docs.forEach((s) => { const k = key(s); const v = m.get(k) ?? { w: 0, l: 0, d: 0 }; if (s.outcome === 'win') v.w++; else if (s.outcome === 'loss') v.l++; else v.d++; m.set(k, v) })
    return [...m.entries()].sort((a, b) => b[1].w + b[1].l + b[1].d - (a[1].w + a[1].l + a[1].d))
  }
  const table = (title: string, rows: [string, { w: number; l: number; d: number }][]) => (
    <section>
      <h2 className="mb-3 font-display text-xs font-semibold tracking-[0.3em] text-blue">{title}</h2>
      <div className={`${card} divide-y divide-line text-sm`}>
        {rows.length ? rows.map(([k, v]) => <div key={k} className="flex items-center justify-between px-4 py-2.5"><span>{k}</span><span className="tabular-nums text-mist"><span className="text-win">{v.w}W</span> · <span className="text-loss">{v.l}L</span> · <span className="text-draw">{v.d}D</span></span></div>) : <p className="p-4 text-mist">No data yet.</p>}
      </div>
    </section>
  )
  // current streak
  let streak = 0
  const first = docs[0]?.outcome
  for (const s of docs) { if (s.outcome === first) streak++; else break }
  return (
    <>
      <PageHead title="Match history" sub="Win/loss statistics calculated from uploaded records." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[['Total played', st.total, ''], ['Wins', st.wins, 'text-win'], ['Losses', st.losses, 'text-loss'], ['Draws', st.draws, 'text-draw'], ['Win rate', st.total ? `${st.winRate}%` : '—', 'text-ice']].map(([l, v, c]) => (
          <div key={String(l)} className={`${card} p-5`}><p className="font-display text-[11px] tracking-[0.25em] text-mist">{String(l).toUpperCase()}</p><p className={`mt-2 font-display text-4xl font-extrabold ${c}`}>{v}</p></div>
        ))}
      </div>
      {first && <p className="mt-4 text-sm text-mist">Current streak: <strong className="text-white">{streak} {first.toUpperCase()}{streak > 1 ? (first === 'loss' ? 'ES' : 'S') : ''}</strong></p>}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {table('BY GAME MODE', group((s) => s.mode))}
        {table('BY OPPONENT', group((s) => s.opponent))}
      </div>
      <h2 className="mb-3 mt-10 font-display text-xs font-semibold tracking-[0.3em] text-blue">TIMELINE</h2>
      {docs.length ? <div className={`${card} divide-y divide-line text-sm`}>{docs.map((s) => <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"><span>{fmtDate(s.matchDate)} · vs {s.opponent} · {s.mode}</span><span className="flex items-center gap-3 tabular-nums">{s.teoScore}-{s.opponentScore}<OutcomeBadge outcome={s.outcome} /></span></div>)}</div> : <p className={`${card} p-6 text-sm text-mist`}>No matches recorded.</p>}
    </>
  )
}
