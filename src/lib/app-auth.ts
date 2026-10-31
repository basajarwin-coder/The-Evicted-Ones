import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { roleOf, type Role } from '@/lib/access'
import type { User } from '@/payload-types'

const COOKIE = 'app-session'
const MAX_AGE = 60 * 60 * 12
const secure = process.env.NODE_ENV === 'production'

// SameSite=None + Partitioned so the session round-trips inside the cross-site Make preview iframe.
const cookieOptions = {
  httpOnly: true,
  secure,
  sameSite: (secure ? 'none' : 'lax') as 'none' | 'lax',
  partitioned: secure,
  path: '/',
  maxAge: MAX_AGE,
}

/** Resolve the dashboard staff user from only the `app-session` cookie. */
export async function getCurrentUser(): Promise<(User & { collection: 'users' }) | null> {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  const db = await getPayloadClient()
  try {
    const { data, error } = await db.auth.getUser(token)
    if (error || !data.user) return null
    const user = await db.findByID({ collection: 'users', id: data.user.id, depth: 0 })
    if (!user || user.active === false) return null
    return user as User & { collection: 'users' }
  } catch {
    return null
  }
}

export async function loginUser(email: string, password: string) {
  const db = await getPayloadClient()
  const token = await db.auth.signIn(email, password)
  const { data, error } = await db.auth.getUser(token)
  if (error || !data.user) throw new Error('inactive')
  const user = await db.findByID({ collection: 'users', id: data.user.id, depth: 0 })
  if (!user || user.active === false) throw new Error('inactive')
  ;(await cookies()).set(COOKIE, token, cookieOptions)
}

export async function logoutUser() {
  ;(await cookies()).set(COOKIE, '', { ...cookieOptions, maxAge: 0 })
}

/** Redirect to login unless a user (optionally with one of `roles`) is signed in. */
export async function requireUser(roles?: Role[]) {
  const user = await getCurrentUser()
  if (!user) redirect('/dashboard/login')
  const role = roleOf(user)
  if (roles && (!role || !roles.includes(role))) redirect('/dashboard?denied=1')
  return user
}
