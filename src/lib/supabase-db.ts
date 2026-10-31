import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { invalidateContent } from '@/lib/revalidate'
import type { SiteSetting } from '@/payload-types'

const TABLES: Record<string, string> = {
  members: 'members',
  scrims: 'scrims',
  gallery: 'gallery',
  achievements: 'achievements',
  announcements: 'announcements',
  applications: 'applications',
  users: 'staff',
  media: 'media',
}

const FIELDS: Record<string, Record<string, string>> = {
  members: {
    ign: 'ign', slug: 'slug', avatar: 'avatar_id', position: 'position', mode: 'mode', status: 'status',
    description: 'description', introduction: 'introduction', highlights: 'highlights', achievements: 'achievements',
    socials: 'socials', featured: 'featured', isDemo: 'is_demo',
  },
  scrims: {
    opponent: 'opponent', matchDate: 'match_date', mode: 'mode', map: 'map', matchType: 'match_type',
    teoScore: 'teo_score', opponentScore: 'opponent_score', outcome: 'outcome', screenshot: 'screenshot_id', description: 'description',
  },
  gallery: { image: 'image_id', caption: 'caption', category: 'category', member: 'member_id', takenAt: 'taken_at' },
  achievements: { title: 'title', category: 'category', date: 'date', description: 'description', image: 'image_id', member: 'member_id' },
  announcements: { title: 'title', category: 'category', description: 'description', image: 'image_id', publishedAt: 'published_at', pinned: 'pinned', isDemo: 'is_demo' },
  applications: {
    ign: 'ign', playerId: 'player_id', mode: 'mode', rank: 'rank', previousClans: 'previous_clans',
    availability: 'availability', introduction: 'introduction', status: 'status', reviewNote: 'review_note',
  },
  users: { name: 'name', email: 'email', role: 'role', active: 'active', assignedMembers: 'assigned_members' },
  media: { alt: 'alt', url: 'url', filename: 'filename', mimeType: 'mime_type', filesize: 'filesize' },
}

const RELATIONS = new Set(['avatar', 'screenshot', 'image', 'member'])
const MEDIA_FIELDS: Record<string, string[]> = {
  members: ['avatar'], scrims: ['screenshot'], gallery: ['image'], achievements: ['image'], announcements: ['image'],
}
const MEMBER_FIELDS: Record<string, string[]> = { gallery: ['member'], achievements: ['member'] }

let client: SupabaseClient | null = null

function supabaseKey() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
}

function supabaseUrl() {
  const raw = process.env.SUPABASE_URL || ''
  try {
    return new URL(raw).origin
  } catch {
    return raw.replace(/\/rest\/v1\/?$/, '')
  }
}

export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && supabaseKey())
}

export function defaultSettings(): SiteSetting {
  return {
    id: '1',
    tagline: 'THE EVICTED ONES',
    intro: 'TEO is a competitive Call of Duty: Mobile clan built on discipline, teamwork and relentless practice.',
    recruitmentOpen: true,
    discord: '',
    youtube: '',
    instagram: '',
    tiktok: '',
    facebook: '',
  }
}

function db() {
  if (!supabaseConfigured()) {
    throw new Error('Supabase is not connected. Set SUPABASE_URL and SUPABASE_SECRET_KEY, then run supabase/schema.sql in the Supabase SQL editor.')
  }
  if (!client) {
    client = createClient(supabaseUrl(), supabaseKey() as string, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  }
  return client
}

/** A fresh client so signing in never replaces the admin connection. */
function authClient() {
  return createClient(supabaseUrl(), supabaseKey() as string, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

function valueOf(value: unknown) {
  if (value && typeof value === 'object' && 'id' in value) return (value as { id: string }).id
  return value ?? null
}

function toRow(collection: string, data: Record<string, unknown>) {
  const map = FIELDS[collection]
  const row: Record<string, unknown> = {}
  for (const [field, column] of Object.entries(map)) {
    if (!Object.prototype.hasOwnProperty.call(data, field)) continue
    const raw = data[field]
    if (field === 'assignedMembers' && Array.isArray(raw)) {
      row[column] = raw.map((item) => (typeof item === 'object' && item ? (item as { id: string }).id : item))
      continue
    }
    row[column] = RELATIONS.has(field) ? valueOf(raw) : raw
  }
  return row
}

function fromRow(collection: string, row: Record<string, unknown>) {
  const map = FIELDS[collection]
  const doc: Record<string, any> = {
    id: String(row.id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
  for (const [field, column] of Object.entries(map)) doc[field] = row[column] ?? null
  if (collection === 'users') doc.collection = 'users'
  if (collection === 'members') doc.socials = row.socials ?? {}
  return doc
}

function readPath(doc: Record<string, any>, field: string) {
  return field.split('.').reduce((current, key) => current?.[key], doc)
}

function matches(doc: Record<string, any>, where?: Record<string, any>): boolean {
  if (!where) return true
  if (Array.isArray(where.and)) return where.and.every((part: Record<string, any>) => matches(doc, part))
  if (Array.isArray(where.or)) return where.or.some((part: Record<string, any>) => matches(doc, part))
  return Object.entries(where).every(([field, op]) => {
    if (!op || typeof op !== 'object') return true
    const value = readPath(doc, field)
    const text = String(value ?? '')
    if ('equals' in op && text !== String(op.equals ?? '')) return false
    if ('not_equals' in op && text === String(op.not_equals ?? '')) return false
    if (Array.isArray(op.in) && !op.in.map(String).includes(text)) return false
    if ('like' in op && !text.toLowerCase().includes(String(op.like).toLowerCase())) return false
    if ('greater_than_equal' in op && text < String(op.greater_than_equal)) return false
    if ('less_than_equal' in op && text > String(op.less_than_equal)) return false
    return true
  })
}

async function rowsOf(collection: string) {
  const { data, error } = await db().from(TABLES[collection]).select('*').limit(2000)
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => fromRow(collection, row))
}

async function byIds(collection: string, ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))]
  if (!unique.length) return new Map<string, Record<string, any>>()
  const { data, error } = await db().from(TABLES[collection]).select('*').in('id', unique)
  if (error) throw new Error(error.message)
  return new Map((data ?? []).map((row) => [String(row.id), fromRow(collection, row)]))
}

async function hydrate(collection: string, docs: Record<string, any>[], depth: number) {
  if (depth < 1 || !docs.length) return docs
  const mediaIds = (MEDIA_FIELDS[collection] ?? []).flatMap((field) => docs.map((doc) => doc[field]).filter((id) => typeof id === 'string'))
  const memberIds = (MEMBER_FIELDS[collection] ?? []).flatMap((field) => docs.map((doc) => doc[field]).filter((id) => typeof id === 'string'))
  const media = await byIds('media', mediaIds)
  const members = await byIds('members', memberIds)
  if (depth >= 2) {
    const avatars = [...members.values()].map((member) => member.avatar).filter((id) => typeof id === 'string')
    const extra = await byIds('media', avatars)
    for (const member of members.values()) {
      if (typeof member.avatar === 'string' && extra.has(member.avatar)) member.avatar = extra.get(member.avatar)
    }
  }
  for (const doc of docs) {
    for (const field of MEDIA_FIELDS[collection] ?? []) {
      if (typeof doc[field] === 'string' && media.has(doc[field])) doc[field] = media.get(doc[field])
    }
    for (const field of MEMBER_FIELDS[collection] ?? []) {
      if (typeof doc[field] === 'string' && members.has(doc[field])) doc[field] = members.get(doc[field])
    }
  }
  return docs
}

async function removeMedia(id?: string | null) {
  if (!id) return
  const { data } = await db().from('media').select('filename').eq('id', id).maybeSingle()
  if (data?.filename) await db().storage.from('media').remove([data.filename])
  await db().from('media').delete().eq('id', id)
}

export function getDb() {
  return {
    auth,
    async find(args: { collection: string; where?: Record<string, any>; sort?: string; limit?: number; depth?: number }) {
      const all = (await rowsOf(args.collection)).filter((doc) => matches(doc, args.where))
      if (args.sort) {
        const desc = args.sort.startsWith('-')
        const field = desc ? args.sort.slice(1) : args.sort
        all.sort((a, b) => String(a[field] ?? '').localeCompare(String(b[field] ?? ''), undefined, { numeric: true }))
        if (desc) all.reverse()
      }
      const docs = all.slice(0, args.limit ?? all.length)
      await hydrate(args.collection, docs, args.depth ?? 0)
      return { docs, totalDocs: all.length }
    },
    async findByID(args: { collection: string; id: string; depth?: number }) {
      const { data, error } = await db().from(TABLES[args.collection]).select('*').eq('id', args.id).maybeSingle()
      if (error) throw new Error(error.message)
      if (!data) throw new Error('Not found')
      const doc = fromRow(args.collection, data)
      await hydrate(args.collection, [doc], args.depth ?? 0)
      return doc
    },
    async count(args: { collection: string; where?: Record<string, any> }) {
      const all = (await rowsOf(args.collection)).filter((doc) => matches(doc, args.where))
      return { totalDocs: all.length }
    },
    async create(args: { collection: string; data: Record<string, any>; file?: { data: Buffer; mimetype: string; name: string; size: number }; user?: Record<string, any> }) {
      if (args.collection === 'media' && args.file) return createMedia(args.data, args.file)
      if (args.collection === 'users') return createStaff(args.data)
      const { data, error } = await db().from(TABLES[args.collection]).insert(toRow(args.collection, args.data)).select('*').single()
      if (error) throw new Error(error.message)
      const doc = fromRow(args.collection, data)
      if (args.collection === 'members' && args.user?.role === 'member-manager' && args.user.id) {
        const current = Array.isArray(args.user.assignedMembers) ? args.user.assignedMembers.map(String) : []
        await db().from('staff').update({ assigned_members: [...new Set([...current, doc.id])] }).eq('id', args.user.id)
      }
      invalidateContent()
      return doc
    },
    async update(args: { collection: string; id: string; data: Record<string, any> }) {
      if (args.collection === 'users') return updateStaff(args.id, args.data)
      const data = { ...args.data }
      if (args.collection === 'members' && data.socials && typeof data.socials === 'object') {
        const { data: row } = await db().from('members').select('socials').eq('id', args.id).maybeSingle()
        const previous = row?.socials && typeof row.socials === 'object' ? row.socials : {}
        data.socials = { ...previous, ...data.socials }
      }
      const { data: saved, error } = await db().from(TABLES[args.collection]).update({ ...toRow(args.collection, data), updated_at: new Date().toISOString() }).eq('id', args.id).select('*').single()
      if (error) throw new Error(error.message)
      invalidateContent()
      return fromRow(args.collection, saved)
    },
    async delete(args: { collection: string; id: string }) {
      if (args.collection === 'media') {
        await removeMedia(args.id)
        return { id: args.id }
      }
      const existing = await this.findByID({ collection: args.collection, id: args.id, depth: 0 }).catch(() => null)
      const { error } = await db().from(TABLES[args.collection]).delete().eq('id', args.id)
      if (error) throw new Error(error.message)
      if (existing) {
        for (const field of ['avatar', 'screenshot', 'image']) {
          if (typeof existing[field] === 'string') await removeMedia(existing[field])
        }
      }
      invalidateContent()
      return { id: args.id }
    },
    async findGlobal() {
      const { data, error } = await db().from('site_settings').select('*').eq('id', 1).maybeSingle()
      if (error) throw new Error(error.message)
      if (!data) return defaultSettings()
      return {
        ...defaultSettings(),
        id: '1',
        tagline: data.tagline,
        intro: data.intro,
        recruitmentOpen: data.recruitment_open,
        discord: data.discord,
        youtube: data.youtube,
        instagram: data.instagram,
        tiktok: data.tiktok,
        facebook: data.facebook,
        updatedAt: data.updated_at,
      } satisfies SiteSetting
    },
    async updateGlobal(args: { data: Record<string, any> }) {
      const row = {
        tagline: args.data.tagline,
        intro: args.data.intro,
        recruitment_open: args.data.recruitmentOpen,
        discord: args.data.discord,
        youtube: args.data.youtube,
        instagram: args.data.instagram,
        tiktok: args.data.tiktok,
        facebook: args.data.facebook,
        updated_at: new Date().toISOString(),
      }
      const { error } = await db().from('site_settings').upsert({ id: 1, ...row })
      if (error) throw new Error(error.message)
      invalidateContent()
      return this.findGlobal()
    },
  }
}

const auth = {
  async getUser(token: string) {
    return authClient().auth.getUser(token)
  },
  async signIn(email: string, password: string) {
    const signingIn = authClient()
    const { data, error } = await signingIn.auth.signInWithPassword({ email, password })
    if (error || !data.session?.access_token) throw new Error(error?.message || 'Invalid credentials')
    return data.session.access_token
  },
}

async function createMedia(data: Record<string, any>, file: { data: Buffer; mimetype: string; name: string; size: number }) {
  const path = `${Date.now()}-${file.name}`
  const { error: uploadError } = await db().storage.from('media').upload(path, file.data, { contentType: file.mimetype, upsert: false })
  if (uploadError) throw new Error(uploadError.message)
  const { data: pub } = db().storage.from('media').getPublicUrl(path)
  const { data: row, error } = await db().from('media').insert({ alt: data.alt || 'TEO upload', url: pub.publicUrl, filename: path, mime_type: file.mimetype, filesize: file.size }).select('*').single()
  if (error) throw new Error(error.message)
  return fromRow('media', row)
}

async function createStaff(data: Record<string, any>) {
  const password = typeof data.password === 'string' ? data.password : ''
  if (password.length < 10) throw new Error('Password must be at least 10 characters.')
  const { data: created, error } = await db().auth.admin.createUser({ email: data.email, password, email_confirm: true })
  if (error || !created.user) throw new Error(error?.message || 'Could not create the staff account.')
  const { data: row, error: insertError } = await db().from('staff').insert({
    id: created.user.id,
    name: data.name,
    email: data.email,
    role: data.role || 'owner',
    active: data.active !== false,
    assigned_members: Array.isArray(data.assignedMembers) ? data.assignedMembers : [],
  }).select('*').single()
  if (insertError) throw new Error(insertError.message)
  return fromRow('users', row)
}

async function updateStaff(id: string, data: Record<string, any>) {
  if (typeof data.password === 'string' && data.password) {
    if (data.password.length < 10) throw new Error('Password must be at least 10 characters.')
    const { error } = await db().auth.admin.updateUserById(id, { password: data.password, email: data.email })
    if (error) throw new Error(error.message)
  } else if (data.email) {
    const { error } = await db().auth.admin.updateUserById(id, { email: data.email })
    if (error) throw new Error(error.message)
  }
  const { data: row, error } = await db().from('staff').update({ ...toRow('users', data), updated_at: new Date().toISOString() }).eq('id', id).select('*').single()
  if (error) throw new Error(error.message)
  return fromRow('users', row)
}
