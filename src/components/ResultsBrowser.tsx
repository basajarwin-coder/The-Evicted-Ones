'use client'

import { useMemo, useState } from 'react'
import ScrimCard, { type ScrimItem } from '@/components/ScrimCard'
import { Empty } from '@/components/ui'

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
const input = 'w-full border border-line bg-coal px-3 py-2.5 text-sm outline-none transition focus:border-blue'

export default function ResultsBrowser({ items }: { items: ScrimItem[] }) {
  const [q, setQ] = useState('')
  const [outcome, setOutcome] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const shown = useMemo(
    () =>
      items.filter((s) => {
        const day = s.date.slice(0, 10)
        return (
          (!q || s.opponent.toLowerCase().includes(q.toLowerCase())) &&
          (outcome === 'all' || s.outcome === outcome) &&
          (!from || day >= from) &&
          (!to || day <= to)
        )
      }),
    [items, q, outcome, from, to],
  )

  return (
    <div>
      <div className="mb-8 grid gap-3 border border-line bg-coal/70 p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <input aria-label="Opponent" className={input} placeholder="Search opponent clan" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Outcome" className={input} value={outcome} onChange={(e) => setOutcome(e.target.value)}>
          <option value="all">All outcomes</option>
          <option value="win">Wins</option>
          <option value="loss">Losses</option>
          <option value="draw">Draws</option>
        </select>
        <input aria-label="From date" type="date" className={input} value={from} onChange={(e) => setFrom(e.target.value)} />
        <input aria-label="To date" type="date" className={input} value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={() => { setQ(''); setOutcome('all'); setFrom(''); setTo('') }} className="border border-line px-4 py-2.5 font-display text-xs tracking-[0.25em] text-mist hover:border-blue hover:text-white">RESET</button>
      </div>
      {shown.length ? (
        <div className="space-y-5">
          {shown.map((s) => <ScrimCard key={s.id} s={{ ...s, date: fmt(s.date) }} />)}
        </div>
      ) : (
        <Empty title={items.length ? 'No matches found' : 'No results uploaded yet'}>
          {items.length ? 'Try adjusting your filters.' : 'Match records appear here as soon as our results team uploads them.'}
        </Empty>
      )}
    </div>
  )
}
