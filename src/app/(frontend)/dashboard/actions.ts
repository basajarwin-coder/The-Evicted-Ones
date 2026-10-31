'use server'

import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser, loginUser, logoutUser } from '@/lib/app-auth'
import { roleOf } from '@/lib/access'
import { entities, type EntityKey, type FieldDef } from '@/lib/dashboard-config'
import { deleteMedia, isUploadedFile, uploadImage } from '@/lib/uploads'

export type ActionResult = { ok: boolean; error?: string; id?: string; message?: string }

function describe(err: unknown): string {
  const e = err as any
  const fieldErrors = e?.data?.errors as { path?: string; message?: string }[] | undefined
  if (fieldErrors?.length) return fieldErrors.map((f) => `${f.path ?? 'field'}: ${f.message}`).join('; ')
  return e?.message || 'Something went wrong. Please try again.'
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'member'

const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '')

function readField(f: FieldDef, fd: FormData): unknown {
  switch (f.type) {
    case 'checkbox':
      return fd.get(f.name) === 'on'
    case 'number': {
      const v = str(fd.get(f.name))
      if (v === '') return undefined
      const n = Number(v)
      if (!Number.isFinite(n) || (f.min !== undefined && n < f.min)) throw new Error(`${f.label} must be a valid number.`)
      return n
    }
    case 'date': {
      const v = str(fd.get(f.name))
      if (!v) return undefined
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new Error(`${f.label} is not a valid date.`)
      return new Date(`${v}T12:00:00.000Z`).toISOString()
    }
    case 'select': {
      const v = str(fd.get(f.name))
      if (v && !f.options?.some((o) => o.value === v)) throw new Error(`Invalid value for ${f.label}.`)
      return v || undefined
    }
    case 'lines':
      return str(fd.get(f.name))
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 30)
        .map((text) => ({ text: text.slice(0, 200) }))
    case 'multirelation':
      return fd.getAll(f.name).filter((x): x is string => typeof x === 'string' && !!x)
    case 'relation':
      return str(fd.get(f.name)) || null
    default:
      return str(fd.get(f.name))
  }
}

function setPath(obj: Record<string, any>, path: string, value: unknown) {
  const parts = path.split('.')
  let cur = obj
  parts.slice(0, -1).forEach((p) => (cur = cur[p] ??= {}))
  cur[parts[parts.length - 1]] = value
}

export async function saveEntity(entity: EntityKey, id: string | null, fd: FormData): Promise<ActionResult> {
  const user = await getCurrentUser()
  const def = entities[entity]
  const role = roleOf(user)
  if (!user || !role || !def || !def.roles.includes(role)) return { ok: false, error: 'You do not have permission to do that.' }
  const payload = await getPayloadClient()
  const newMedia: string[] = []
  const oldMedia: any[] = []

  try {
    const existing = id ? await payload.findByID({ collection: entity, id, depth: 0, user, overrideAccess: false }) : null
    const data: Record<string, any> = {}

    for (const f of def.fields) {
      if (f.type === 'image') {
        const file = fd.get(f.name)
        if (isUploadedFile(file)) {
          const alt = str(fd.get('ign')) || str(fd.get('title')) || str(fd.get('opponent')) || f.label
          const mid = await uploadImage(payload, user, file, alt)
          newMedia.push(mid)
          oldMedia.push((existing as any)?.[f.name])
          data[f.name] = mid
        } else if (fd.get(`${f.name}__remove`) === 'on' && existing) {
          oldMedia.push((existing as any)[f.name])
          data[f.name] = null
        }
        continue
      }
      if (entity === 'users' && f.name === 'password') {
        const pw = str(fd.get('password'))
        if (!id && pw.length < 10) throw new Error('Password must be at least 10 characters.')
        if (pw) {
          if (pw.length < 10) throw new Error('Password must be at least 10 characters.')
          data.password = pw
        }
        continue
      }
      const v = readField(f, fd)
      if (f.required && (v === undefined || v === '' || v === null)) throw new Error(`${f.label} is required.`)
      if (v === undefined && !f.required) continue
      setPath(data, f.name, v)
    }

    if (entity === 'scrims' && data.outcome && data.teoScore !== undefined) {
      const d = data.teoScore - data.opponentScore
      const implied = d > 0 ? 'win' : d < 0 ? 'loss' : 'draw'
      if (data.mode !== 'Battle Royale' && implied !== data.outcome) {
        throw new Error(`The score ${data.teoScore}-${data.opponentScore} does not match the outcome ${String(data.outcome).toUpperCase()}.`)
      }
    }

    if (entity === 'members' && !id) {
      const base = slugify(data.ign ?? '')
      let slug = base
      for (let i = 2; i < 50; i++) {
        const dup = await payload.count({ collection: 'members', where: { slug: { equals: slug } }, overrideAccess: true })
        if (!dup.totalDocs) break
        slug = `${base}-${i}`
      }
      data.slug = slug
    }

    if (entity === 'users') {
      const wasOwner = (existing as any)?.role === 'owner' && (existing as any)?.active !== false
      const staysOwner = data.role === 'owner' && data.active !== false
      if (wasOwner && !staysOwner) {
        const owners = await payload.count({ collection: 'users', where: { role: { equals: 'owner' }, active: { not_equals: false } }, overrideAccess: true })
        if (owners.totalDocs <= 1) throw new Error('At least one active owner account must remain.')
      }
      if (data.role === 'owner') data.assignedMembers = []
    }

    const doc: any = id
      ? await payload.update({ collection: entity, id, data, user, overrideAccess: false })
      : await payload.create({ collection: entity, data: data as any, user, overrideAccess: false })

    for (const o of oldMedia) await deleteMedia(payload, o)
    return { ok: true, id: String(doc.id) }
  } catch (err) {
    for (const m of newMedia) await deleteMedia(payload, m)
    return { ok: false, error: describe(err) }
  }
}

export async function deleteEntity(entity: EntityKey, id: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  const def = entities[entity]
  const role = roleOf(user)
  if (!user || !role || !def?.roles.includes(role)) return { ok: false, error: 'You do not have permission to do that.' }
  const payload = await getPayloadClient()
  try {
    const doc: any = await payload.findByID({ collection: entity, id, depth: 0, user, overrideAccess: false })
    if (entity === 'users') {
      if (String(user.id) === id) throw new Error('You cannot delete your own account.')
      if (doc.role === 'owner' && doc.active !== false) {
        const owners = await payload.count({ collection: 'users', where: { role: { equals: 'owner' }, active: { not_equals: false } }, overrideAccess: true })
        if (owners.totalDocs <= 1) throw new Error('At least one active owner account must remain.')
      }
    }
    if (entity === 'members') {
      // Member-category photos belong to the member; other photos just lose the association.
      const photos = await payload.find({ collection: 'gallery', where: { member: { equals: id } }, limit: 500, depth: 0, overrideAccess: true })
      for (const p of photos.docs) {
        if (p.category === 'member') await payload.delete({ collection: 'gallery', id: p.id, overrideAccess: true })
        else await payload.update({ collection: 'gallery', id: p.id, data: { member: null }, overrideAccess: true })
      }
    }
    await payload.delete({ collection: entity, id, user, overrideAccess: false })
    for (const f of ['avatar', 'screenshot', 'image']) if (doc[f]) await deleteMedia(payload, doc[f])
    return { ok: true }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}

/* ---------- Gallery ---------- */

export async function uploadPhotos(fd: FormData): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user || !['owner', 'member-manager'].includes(roleOf(user) ?? '')) return { ok: false, error: 'You do not have permission to upload photos.' }
  const payload = await getPayloadClient()
  const files = fd.getAll('files').filter(isUploadedFile)
  if (!files.length) return { ok: false, error: 'Choose at least one image.' }
  if (files.length > 20) return { ok: false, error: 'Upload at most 20 images at a time.' }
  const category = str(fd.get('category')) || 'team'
  const member = str(fd.get('member')) || null
  const caption = str(fd.get('caption')).slice(0, 160)
  const d = str(fd.get('takenAt'))
  const takenAt = /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T12:00:00.000Z`).toISOString() : new Date().toISOString()
  let done = 0
  for (const file of files) {
    let mid: string | null = null
    try {
      mid = await uploadImage(payload, user, file, caption || file.name)
      await payload.create({
        collection: 'gallery',
        data: { image: mid, caption: caption || undefined, category: category as any, member, takenAt },
        user,
        overrideAccess: false,
      })
      done++
    } catch (err) {
      if (mid) await deleteMedia(payload, mid)
      return { ok: false, error: `${done} uploaded. ${describe(err)}` }
    }
  }
  return { ok: true, message: `${done} photo${done === 1 ? '' : 's'} uploaded.` }
}

export async function updatePhoto(id: string, fd: FormData): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Not signed in.' }
  const payload = await getPayloadClient()
  let newId: string | null = null
  try {
    const existing: any = await payload.findByID({ collection: 'gallery', id, depth: 0, user, overrideAccess: false })
    const data: Record<string, any> = {}
    if (fd.has('caption')) data.caption = str(fd.get('caption')).slice(0, 160)
    if (fd.has('category')) data.category = str(fd.get('category'))
    if (fd.has('member')) data.member = str(fd.get('member')) || null
    const file = fd.get('file')
    if (isUploadedFile(file)) {
      newId = await uploadImage(payload, user, file, data.caption || existing.caption || file.name)
      data.image = newId
    }
    await payload.update({ collection: 'gallery', id, data, user, overrideAccess: false })
    if (newId) await deleteMedia(payload, existing.image)
    return { ok: true }
  } catch (err) {
    if (newId) await deleteMedia(payload, newId)
    return { ok: false, error: describe(err) }
  }
}

export async function deletePhoto(id: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Not signed in.' }
  const payload = await getPayloadClient()
  try {
    await payload.delete({ collection: 'gallery', id, user, overrideAccess: false }) // hook removes the media file
    return { ok: true }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}

/* ---------- Applications / settings ---------- */

export async function setApplicationStatus(id: string, status: string, note: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Not signed in.' }
  if (!['pending', 'accepted', 'rejected'].includes(status)) return { ok: false, error: 'Invalid status.' }
  const payload = await getPayloadClient()
  try {
    await payload.update({ collection: 'applications', id, data: { status: status as any, reviewNote: note.slice(0, 500) }, user, overrideAccess: false })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Not signed in.' }
  try {
    await (await getPayloadClient()).delete({ collection: 'applications', id, user, overrideAccess: false })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}

export async function saveSettings(fd: FormData): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user || roleOf(user) !== 'owner') return { ok: false, error: 'Only the owner can change website settings.' }
  const data: Record<string, any> = {
    tagline: str(fd.get('tagline')).slice(0, 80),
    intro: str(fd.get('intro')).slice(0, 600),
    recruitmentOpen: fd.get('recruitmentOpen') === 'on',
  }
  for (const k of ['discord', 'youtube', 'instagram', 'tiktok', 'facebook']) {
    const v = str(fd.get(k)).slice(0, 200)
    if (v && !/^https?:\/\//i.test(v)) return { ok: false, error: `${k} must be a full link starting with https://` }
    data[k] = v
  }
  try {
    await (await getPayloadClient()).updateGlobal({ slug: 'site-settings', data, user, overrideAccess: false })
    return { ok: true, message: 'Settings saved.' }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}

/* ---------- Auth ---------- */

export async function loginAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const email = str(fd.get('email')).toLowerCase()
  const password = typeof fd.get('password') === 'string' ? (fd.get('password') as string) : ''
  if (!email || !password) return { ok: false, error: 'Enter your email and password.' }
  try {
    await loginUser(email, password)
  } catch {
    return { ok: false, error: 'Invalid credentials, or the account is disabled.' }
  }
  redirect('/dashboard')
}

export async function logoutAction() {
  await logoutUser()
  redirect('/dashboard/login')
}

/** One-time bootstrap: only works while no staff account exists. */
export async function setupOwnerAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const payload = await getPayloadClient()
  const count = await payload.count({ collection: 'users', overrideAccess: true })
  if (count.totalDocs > 0) return { ok: false, error: 'Setup is already complete.' }
  const name = str(fd.get('name'))
  const email = str(fd.get('email')).toLowerCase()
  const password = typeof fd.get('password') === 'string' ? (fd.get('password') as string) : ''
  if (!name || !email) return { ok: false, error: 'Name and email are required.' }
  if (password.length < 10) return { ok: false, error: 'Password must be at least 10 characters.' }
  if (password !== fd.get('confirm')) return { ok: false, error: 'Passwords do not match.' }
  try {
    await payload.create({ collection: 'users', data: { name, email, password, role: 'owner', active: true }, overrideAccess: true })
    await loginUser(email, password)
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
  redirect('/dashboard')
}
