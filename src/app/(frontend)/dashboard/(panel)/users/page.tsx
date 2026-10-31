import Link from 'next/link'
import { PageHead, card } from '@/components/dashboard/server'
import { DeleteButton } from '@/components/dashboard/Small'
import { requireUser } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'

const roleName: Record<string, string> = { owner: 'Owner / Super Admin', 'member-manager': 'Member Manager', 'results-manager': 'Results Manager' }

export default async function UsersAdmin() {
  const me = await requireUser(['owner'])
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'users', sort: 'name', limit: 100, depth: 0, user: me, overrideAccess: false })
  return (
    <>
      <PageHead title="User management" sub="Create staff accounts and assign roles. Passwords are hashed by Payload." action={{ href: '/dashboard/users/new', label: 'ADD STAFF' }} />
      <div className={`${card} divide-y divide-line`}>
        {docs.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
            <div className="min-w-0 flex-1"><p className="font-display font-bold">{u.name} {String(u.id) === String(me.id) && <span className="text-xs font-normal text-mist">(you)</span>}</p><p className="text-xs text-mist">{u.email} · {roleName[u.role]} {u.active === false && <span className="text-loss">· disabled</span>}{u.role === 'member-manager' && ` · ${u.assignedMembers?.length ?? 0} assigned`}</p></div>
            <div className="flex gap-4 text-xs"><Link href={`/dashboard/users/${u.id}`} className="text-ice hover:underline">Edit</Link>{String(u.id) !== String(me.id) && <DeleteButton entity="users" id={u.id} />}</div>
          </div>
        ))}
      </div>
    </>
  )
}
