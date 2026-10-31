import Image from 'next/image'
import Link from 'next/link'
import { PageHead, card } from '@/components/dashboard/server'
import { DeleteButton } from '@/components/dashboard/Small'
import { requireUser } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { fmtDate } from '@/lib/data'

export default async function Page() {
  await requireUser(['owner'])
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'achievements', sort: '-date', limit: 200, depth: 1, overrideAccess: true })
  return (
    <>
      <PageHead title="Achievements" sub={`${docs.length} total`} action={{ href: '/dashboard/achievements/new', label: 'ADD NEW' }} />
      {docs.length ? (
        <div className={`${card} divide-y divide-line`}>
          {docs.map((d: any) => (
            <div key={d.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
              <div className="relative h-14 w-24 shrink-0 overflow-hidden border border-line bg-plate">{typeof d.image === 'object' && d.image?.url && <Image src={d.image.url} alt="" fill sizes="96px" className="object-cover" />}</div>
              <div className="min-w-0 flex-1"><p className="font-display font-bold">{d.title}</p><p className="text-xs text-mist">{d.category} · {fmtDate(d.date)}</p></div>
              <div className="flex gap-4 text-xs"><Link href={`/dashboard/achievements/${d.id}`} className="text-ice hover:underline">Edit</Link><DeleteButton entity="achievements" id={d.id} /></div>
            </div>
          ))}
        </div>
      ) : <p className={`${card} p-8 text-center text-sm text-mist`}>Nothing here yet.</p>}
    </>
  )
}
