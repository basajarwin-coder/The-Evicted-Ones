import Link from 'next/link'
import { PageHead, card } from '@/components/dashboard/server'
import { ApplicationReview } from '@/components/dashboard/Small'
import { requireUser } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { fmtDate } from '@/lib/data'

const tone: Record<string, string> = { pending: 'text-draw border-draw/40', accepted: 'text-win border-win/40', rejected: 'text-loss border-loss/40' }

export default async function ApplicationsAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser(['owner', 'member-manager'])
  const { status } = await searchParams
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'applications', where: ['pending', 'accepted', 'rejected'].includes(status ?? '') ? { status: { equals: status } } : undefined, sort: '-createdAt', limit: 200, user, overrideAccess: false })
  return (
    <>
      <PageHead title="Recruitment applications" sub="Private — visible only to authorised staff." />
      <div className="mb-6 flex flex-wrap gap-2">
        {[['', 'All'], ['pending', 'Pending'], ['accepted', 'Accepted'], ['rejected', 'Rejected']].map(([v, l]) => (
          <Link key={v} href={v ? `?status=${v}` : '?'} className={`border px-4 py-2 font-display text-xs tracking-[0.2em] ${(status ?? '') === v ? 'border-blue bg-blue text-white' : 'border-line text-mist hover:text-white'}`}>{l.toUpperCase()}</Link>
        ))}
      </div>
      {docs.length ? (
        <div className="space-y-4">
          {docs.map((a) => (
            <article key={a.id} className={`${card} p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold">{a.ign} <span className="ml-2 text-sm font-normal text-mist">ID {a.playerId}</span></h2>
                <span className={`border px-3 py-1 font-display text-[11px] font-bold tracking-[0.25em] ${tone[a.status]}`}>{a.status.toUpperCase()}</span>
              </div>
              <p className="mt-1 text-xs text-mist">{a.mode === 'BOTH' ? 'MP + BR' : a.mode} · Rank {a.rank} · Applied {fmtDate(a.createdAt)}</p>
              <dl className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                <div><dt className="font-display text-[10px] tracking-[0.25em] text-mist">INTRODUCTION</dt><dd className="mt-1 whitespace-pre-line">{a.introduction}</dd></div>
                <div><dt className="font-display text-[10px] tracking-[0.25em] text-mist">AVAILABILITY</dt><dd className="mt-1 whitespace-pre-line">{a.availability}</dd></div>
                <div><dt className="font-display text-[10px] tracking-[0.25em] text-mist">PREVIOUS CLANS</dt><dd className="mt-1 whitespace-pre-line">{a.previousClans || '—'}</dd></div>
              </dl>
              <ApplicationReview id={a.id} status={a.status} note={a.reviewNote ?? ''} />
            </article>
          ))}
        </div>
      ) : <p className={`${card} p-8 text-center text-sm text-mist`}>No applications.</p>}
    </>
  )
}
