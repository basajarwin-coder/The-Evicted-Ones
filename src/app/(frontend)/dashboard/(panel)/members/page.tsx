import Link from 'next/link'
import { PageHead, card } from '@/components/dashboard/server'
import { Avatar } from '@/components/ui'
import { btnCls, filterCls, ghostBtn } from '@/components/dashboard/classes'
import { DeleteButton } from '@/components/dashboard/Small'
import { requireUser } from '@/lib/app-auth'
import { assignedIds, roleOf } from '@/lib/access'
import { getPayloadClient } from '@/lib/payload'
import { sortMembers } from '@/lib/roster'

type SP = { q?: string; status?: string; mode?: string }

export default async function MembersAdmin({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser(['owner', 'member-manager'])
  const role = roleOf(user)
  const sp = await searchParams
  const payload = await getPayloadClient()
  const and: any[] = []
  if (sp.q) and.push({ or: [{ ign: { like: sp.q } }, { position: { like: sp.q } }] })
  if (sp.status === 'active' || sp.status === 'inactive') and.push({ status: { equals: sp.status } })
  if (sp.mode === 'MP' || sp.mode === 'BR' || sp.mode === 'BOTH') and.push({ mode: { equals: sp.mode } })
  if (role === 'member-manager') and.push({ id: { in: assignedIds(user) } })
  const { docs: listed } = await payload.find({ collection: 'members', where: and.length ? { and } : undefined, sort: 'ign', limit: 300, depth: 1, overrideAccess: true })
  const docs = sortMembers(listed)

  return (
    <>
      <PageHead title="Members" sub={role === 'member-manager' ? 'Profiles assigned to you.' : `${docs.length} shown`} action={{ href: '/dashboard/members/new', label: 'ADD MEMBER' }} />
      <form className="mb-6 grid gap-3 sm:grid-cols-[1.5fr_1fr_1fr_auto_auto]">
        <input name="q" defaultValue={sp.q} placeholder="Search IGN or role" className={filterCls} />
        <select name="status" defaultValue={sp.status ?? ''} className={filterCls}><option value="">Any status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
        <select name="mode" defaultValue={sp.mode ?? ''} className={filterCls}><option value="">Any mode</option><option value="MP">MP</option><option value="BR">BR</option><option value="BOTH">MP + BR</option></select>
        <button className={btnCls}>FILTER</button>
        <Link href="/dashboard/members" className={`${ghostBtn} text-center`}>RESET</Link>
      </form>
      {docs.length ? (
        <div className={`${card} divide-y divide-line`}>
          {docs.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
              <Avatar media={typeof m.avatar === 'object' ? m.avatar : null} name={m.ign} className="h-14 w-14 shrink-0 border border-line" sizes="56px" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold">{m.ign} {m.isDemo && <span className="ml-1 text-[10px] tracking-widest text-draw">DEMO</span>}</p>
                {m.socials?.name ? <p className="text-sm text-white/80">{m.socials.name}</p> : null}
                <p className="text-xs text-mist">{m.position} · {m.mode === 'BOTH' ? 'MP + BR' : m.mode} · <span className={m.status === 'active' ? 'text-win' : ''}>{m.status}</span></p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <Link href={`/members/${m.slug}`} target="_blank" className="text-mist hover:text-white">View</Link>
                <Link href={`/dashboard/members/${m.id}`} className="text-ice hover:underline">Edit</Link>
                {role === 'owner' && <DeleteButton entity="members" id={m.id} />}
              </div>
            </div>
          ))}
        </div>
      ) : <p className={`${card} p-8 text-center text-sm text-mist`}>{role === 'member-manager' ? 'No profiles are assigned to you yet. Add one or ask the owner to assign members.' : 'No members match.'}</p>}
    </>
  )
}
