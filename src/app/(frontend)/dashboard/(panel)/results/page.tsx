import Image from 'next/image'
import Link from 'next/link'
import { PageHead, card } from '@/components/dashboard/server'
import { btnCls, filterCls, ghostBtn } from '@/components/dashboard/classes'
import { DeleteButton } from '@/components/dashboard/Small'
import { OutcomeBadge } from '@/components/ui'
import { requireUser } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { fmtDate } from '@/lib/data'

type SP = { q?: string; outcome?: string; from?: string; to?: string }

export default async function ResultsAdmin({ searchParams }: { searchParams: Promise<SP> }) {
  await requireUser(['owner', 'results-manager'])
  const sp = await searchParams
  const and: any[] = []
  if (sp.q) and.push({ opponent: { like: sp.q } })
  if (['win', 'loss', 'draw'].includes(sp.outcome ?? '')) and.push({ outcome: { equals: sp.outcome } })
  if (/^\d{4}-\d{2}-\d{2}$/.test(sp.from ?? '')) and.push({ matchDate: { greater_than_equal: `${sp.from}T00:00:00.000Z` } })
  if (/^\d{4}-\d{2}-\d{2}$/.test(sp.to ?? '')) and.push({ matchDate: { less_than_equal: `${sp.to}T23:59:59.999Z` } })
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'scrims', where: and.length ? { and } : undefined, sort: '-matchDate', limit: 300, depth: 1, overrideAccess: true })
  const sel = filterCls
  return (
    <>
      <PageHead title="Scrim results" sub={`${docs.length} record${docs.length === 1 ? '' : 's'} shown. Only real results should be added.`} action={{ href: '/dashboard/results/new', label: 'ADD RESULT' }} />
      <form className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto_auto]">
        <input name="q" defaultValue={sp.q} placeholder="Opponent" className={sel} />
        <select name="outcome" defaultValue={sp.outcome ?? ''} className={sel}><option value="">All outcomes</option><option value="win">Win</option><option value="loss">Loss</option><option value="draw">Draw</option></select>
        <input type="date" name="from" defaultValue={sp.from} aria-label="From" className={sel} />
        <input type="date" name="to" defaultValue={sp.to} aria-label="To" className={sel} />
        <button className={btnCls}>FILTER</button><Link href="/dashboard/results" className={`${ghostBtn} text-center`}>RESET</Link>
      </form>
      {docs.length ? (
        <div className={`${card} divide-y divide-line`}>
          {docs.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
              <div className="relative h-14 w-24 shrink-0 overflow-hidden border border-line bg-plate">{typeof s.screenshot === 'object' && s.screenshot?.url && <Image src={s.screenshot.url} alt="" fill sizes="96px" className="object-cover" />}</div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold">TEO vs {s.opponent} <span className="ml-2 tabular-nums">{s.teoScore}-{s.opponentScore}</span></p>
                <p className="text-xs text-mist">{fmtDate(s.matchDate)} · {s.mode} · {s.map} · {s.matchType}</p>
              </div>
              <OutcomeBadge outcome={s.outcome} />
              <div className="flex gap-4 text-xs"><Link href={`/dashboard/results/${s.id}`} className="text-ice hover:underline">Edit</Link><DeleteButton entity="scrims" id={s.id} /></div>
            </div>
          ))}
        </div>
      ) : <p className={`${card} p-8 text-center text-sm text-mist`}>No results yet. Add your first real scrim result with its screenshot.</p>}
    </>
  )
}
