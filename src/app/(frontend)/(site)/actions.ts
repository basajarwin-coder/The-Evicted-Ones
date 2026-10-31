'use server'

import { getPayloadClient } from '@/lib/payload'

export type ApplyResult = { ok: boolean; error?: string }

export async function likeMember(id: string, delta = 1) {
  const db = await getPayloadClient()
  const add = Math.min(40, Math.max(1, Math.floor(delta)))
  const member = await db.findByID({ collection: 'members', id, depth: 0 })
  const likes = Number(member.socials?.likes ?? 0) + add
  await db.update({
    collection: 'members',
    id,
    data: { socials: { ...(member.socials ?? {}), likes } },
  })
  return likes
}

export async function submitApplication(_prev: ApplyResult | null, _fd: FormData): Promise<ApplyResult> {
  return { ok: false, error: 'TEO does not take applications on the site. Message the clan Facebook page and wait for a recruitment announcement.' }
}
