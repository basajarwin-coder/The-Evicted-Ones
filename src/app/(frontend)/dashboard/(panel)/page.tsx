import Link from 'next/link'
import { PageHead, card } from '@/components/dashboard/server'
import { btnCls } from '@/components/dashboard/classes'
import { requireUser } from '@/lib/app-auth'
import { roleOf, type Role } from '@/lib/access'
import { getPayloadClient } from '@/lib/payload'

const actions: { href: string; label: string; roles: Role[] }[] = [
  { href: '/dashboard/members/new', label: 'ADD MEMBER', roles: ['owner', 'member-manager'] },
  { href: '/dashboard/galleries', label: 'ADD PHOTOS', roles: ['owner', 'member-manager'] },
  { href: '/dashboard/results/new', label: 'ADD RESULT', roles: ['owner', 'results-manager'] },
  { href: '/dashboard/achievements/new', label: 'ADD ACHIEVEMENT', roles: ['owner'] },
  { href: '/dashboard/announcements/new', label: 'ADD NEWS', roles: ['owner'] },
  { href: '/dashboard/users/new', label: 'ADD STAFF', roles: ['owner'] },
]

export default async function DashboardHome() {
  const user = await requireUser()
  const role = roleOf(user) ?? 'member-manager'
  const db = await getPayloadClient()
  const [members, scrims, photos, news, pending] = await Promise.all([
    db.count({ collection: 'members' }),
    db.count({ collection: 'scrims' }),
    db.count({ collection: 'gallery' }),
    db.count({ collection: 'announcements' }),
    db.count({ collection: 'applications', where: { status: { equals: 'pending' } } }),
  ])
  const stats = [
    ['Members', members.totalDocs, '/dashboard/members', ['owner', 'member-manager']],
    ['Photos', photos.totalDocs, '/dashboard/galleries', ['owner', 'member-manager']],
    ['Scrim results', scrims.totalDocs, '/dashboard/results', ['owner', 'results-manager']],
    ['Announcements', news.totalDocs, '/dashboard/announcements', ['owner']],
    ['Pending applications', pending.totalDocs, '/dashboard/applications', ['owner', 'member-manager']],
  ].filter((item) => (item[3] as string[]).includes(role))

  return (
    <>
      <PageHead title="Dashboard" sub={`Signed in as ${user.name}. Use the buttons to add clan records.`} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map(([label, value, href]) => (
          <Link key={String(label)} href={String(href)} className={`${card} p-5 transition hover:border-blue`}>
            <p className="font-display text-[11px] tracking-[0.25em] text-mist">{String(label).toUpperCase()}</p>
            <p className="mt-2 font-display text-4xl font-extrabold">{value}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        {actions.filter((item) => item.roles.includes(role)).map((item) => (
          <Link key={item.href} href={item.href} className={btnCls}>{item.label}</Link>
        ))}
      </div>
    </>
  )
}
