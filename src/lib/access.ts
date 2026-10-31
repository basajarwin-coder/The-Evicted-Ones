import type { Access, PayloadRequest } from 'payload'

export type Role = 'owner' | 'member-manager' | 'results-manager'

type AnyUser = (Record<string, any> & { collection?: string }) | null | undefined

/** Resolve the effective staff role. Figma-SSO CMS admins are treated as owners. */
export function roleOf(user: AnyUser): Role | null {
  if (!user) return null
  if (user.collection === 'admins') return 'owner'
  if (user.collection === 'users' && user.active !== false) return (user.role as Role) ?? null
  return null
}

export const assignedIds = (user: AnyUser): (string | number)[] =>
  ((user?.assignedMembers as any[]) ?? []).map((m) => (typeof m === 'object' && m ? m.id : m))

const has =
  (...roles: Role[]): Access =>
  ({ req }: { req: PayloadRequest }) => {
    const r = roleOf(req.user as AnyUser)
    return !!r && roles.includes(r)
  }

export const isOwner = has('owner')
export const isStaff = has('owner', 'member-manager', 'results-manager')
export const canManageMembers = has('owner', 'member-manager')
export const canManageResults = has('owner', 'results-manager')
export const publicRead: Access = () => true
