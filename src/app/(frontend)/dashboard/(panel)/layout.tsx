import Sidebar, { type NavItem } from '@/components/dashboard/Sidebar'
import { requireUser } from '@/lib/app-auth'
import { roleOf, type Role } from '@/lib/access'

const ALL: (NavItem & { roles: Role[] })[] = [
  { href: '/dashboard', label: 'Dashboard Overview', roles: ['owner', 'member-manager', 'results-manager'] },
  { href: '/dashboard/members', label: 'Members', roles: ['owner', 'member-manager'] },
  { href: '/dashboard/galleries', label: 'Member Galleries', roles: ['owner', 'member-manager'] },
  { href: '/dashboard/results', label: 'Scrim Results', roles: ['owner', 'results-manager'] },
  { href: '/dashboard/history', label: 'Match History', roles: ['owner', 'results-manager'] },
  { href: '/dashboard/achievements', label: 'Achievements', roles: ['owner'] },
  { href: '/dashboard/announcements', label: 'Announcements', roles: ['owner'] },
  { href: '/dashboard/applications', label: 'Recruitment Applications', roles: ['owner', 'member-manager'] },
  { href: '/dashboard/users', label: 'User Management', roles: ['owner'] },
  { href: '/dashboard/settings', label: 'Website Settings', roles: ['owner'] },
]
const roleLabel: Record<Role, string> = { owner: 'Owner / Super Admin', 'member-manager': 'Member Manager', 'results-manager': 'Results Manager' }

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  const role = roleOf(user)!
  const items = ALL.filter((i) => i.roles.includes(role))
  return (
    <div className="lg:flex">
      <Sidebar items={items} user={{ name: user.name, roleLabel: roleLabel[role] }} />
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:py-10">{children}</div>
    </div>
  )
}
