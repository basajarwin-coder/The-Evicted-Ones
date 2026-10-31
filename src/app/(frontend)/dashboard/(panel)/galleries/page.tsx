import Link from 'next/link'
import { PageHead } from '@/components/dashboard/server'
import { memberOptions } from '@/components/dashboard/server'
import { PhotoTile, PhotoUploader, type AdminPhoto } from '@/components/dashboard/PhotoManager'
import { btnCls, filterCls, ghostBtn } from '@/components/dashboard/classes'
import { requireUser } from '@/lib/app-auth'
import { assignedIds, roleOf } from '@/lib/access'
import { getPayloadClient } from '@/lib/payload'
import { categoryOptions } from '@/lib/dashboard-config'
import { fmtDate } from '@/lib/data'

type SP = { member?: string; category?: string }

export default async function GalleriesAdmin({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser(['owner', 'member-manager'])
  const role = roleOf(user)
  const sp = await searchParams
  const payload = await getPayloadClient()
  const members = await memberOptions(user)
  const and: any[] = []
  if (sp.member) and.push({ member: { equals: sp.member } })
  if (sp.category) and.push({ category: { equals: sp.category } })
  if (role === 'member-manager') and.push({ member: { in: assignedIds(user) } })
  const { docs } = await payload.find({ collection: 'gallery', where: and.length ? { and } : undefined, sort: '-takenAt', limit: 200, depth: 2, overrideAccess: true })
  const assigned = assignedIds(user).map(String)
  const photos: AdminPhoto[] = docs.flatMap((p) => {
    const img = typeof p.image === 'object' ? p.image : null
    if (!img?.url) return []
    const m = typeof p.member === 'object' && p.member ? p.member : null
    return [{ id: p.id, url: img.url, caption: p.caption ?? '', category: p.category, memberId: m ? m.id : '', memberName: m?.ign ?? '', date: fmtDate(p.takenAt), canEdit: role === 'owner' || (!!m && assigned.includes(String(m.id))) }]
  })
  const sel = filterCls
  return (
    <>
      <PageHead title="Member galleries" sub="Upload, categorise, assign, replace and delete photos. Each photo belongs to the member it is assigned to." />
      <PhotoUploader members={members} canTeam={role === 'owner'} defaultMember={sp.member} />
      <form className="my-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
        <select name="member" defaultValue={sp.member ?? ''} className={sel}><option value="">All members</option>{members.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</select>
        <select name="category" defaultValue={sp.category ?? ''} className={sel}><option value="">All categories</option>{categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
        <button className={btnCls}>FILTER</button><Link href="/dashboard/galleries" className={`${ghostBtn} text-center`}>RESET</Link>
      </form>
      {photos.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">{photos.map((p) => <PhotoTile key={p.id} p={p} members={members} />)}</div>
        : <p className="border border-line bg-coal p-8 text-center text-sm text-mist">No photos found.</p>}
    </>
  )
}
