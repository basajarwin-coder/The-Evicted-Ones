import Link from 'next/link'
import { notFound } from 'next/navigation'
import EntityForm from './EntityForm'
import { requireUser } from '@/lib/app-auth'
import { assignedIds, roleOf } from '@/lib/access'
import { getPayloadClient } from '@/lib/payload'
import { entities, type EntityKey, type Option } from '@/lib/dashboard-config'

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold uppercase">{title}</h1>
        {sub && <p className="mt-1 text-sm text-mist">{sub}</p>}
      </div>
      {action && <Link href={action.href} className="bg-blue px-5 py-2.5 font-display text-xs font-bold tracking-[0.2em] text-white transition hover:bg-ice hover:text-ink">{action.label}</Link>}
    </div>
  )
}

export const card = 'border border-line bg-coal'

export async function memberOptions(onlyAssignedFor?: any): Promise<Option[]> {
  const payload = await getPayloadClient()
  const r = await payload.find({ collection: 'members', limit: 500, depth: 0, sort: 'ign', overrideAccess: true })
  const ids = onlyAssignedFor && roleOf(onlyAssignedFor) === 'member-manager' ? assignedIds(onlyAssignedFor).map(String) : null
  return r.docs.filter((m) => !ids || ids.includes(String(m.id))).map((m) => ({ label: m.ign, value: String(m.id) }))
}

const dateIn = (v?: string | null) => (v ? new Date(v).toISOString().slice(0, 10) : '')

export async function EntityEditPage({ entity, id }: { entity: EntityKey; id?: string }) {
  const def = entities[entity]
  const user = await requireUser(def.roles)
  const payload = await getPayloadClient()
  let doc: any = null
  if (id) {
    try {
      doc = await payload.findByID({ collection: entity, id, depth: 1, user, overrideAccess: false })
    } catch {
      notFound()
    }
    if (entity === 'members' && roleOf(user) === 'member-manager' && !assignedIds(user).map(String).includes(id)) notFound()
  }

  const values: Record<string, any> = {}
  for (const f of def.fields) {
    const raw = f.name.split('.').reduce((o: any, k) => o?.[k], doc ?? {})
    if (f.type === 'image') values[f.name] = raw && typeof raw === 'object' ? raw.url : ''
    else if (f.type === 'date') values[f.name] = dateIn(raw)
    else if (f.type === 'lines') values[f.name] = Array.isArray(raw) ? raw.map((r: any) => r.text).join('\n') : ''
    else if (f.type === 'relation') values[f.name] = raw && typeof raw === 'object' ? raw.id : raw ?? ''
    else if (f.type === 'multirelation') values[f.name] = Array.isArray(raw) ? raw.map((r: any) => (typeof r === 'object' ? r.id : r)) : []
    else if (f.type === 'checkbox') values[f.name] = id ? !!raw : f.name === 'active'
    else if (f.type === 'password') values[f.name] = ''
    else values[f.name] = raw ?? ''
  }
  if (!id && entity === 'announcements') values.publishedAt = dateIn(new Date().toISOString())
  if (!id && entity === 'scrims') values.matchDate = dateIn(new Date().toISOString())

  const needsRelations = entity === 'achievements' || entity === 'users'
  const relations = needsRelations ? await memberOptions() : []
  const canDelete = entity === 'members' ? roleOf(user) === 'owner' : true
  const base = entity === 'scrims' ? 'results' : entity

  return (
    <>
      <PageHead title={`${id ? 'Edit' : 'New'} ${def.singular.toLowerCase()}`} sub={[doc?.ign, doc?.socials?.name].filter(Boolean).join(' · ') || doc?.title || doc?.opponent || doc?.name} />
      <div className={`${card} max-w-4xl p-5 sm:p-8`}>
        <EntityForm entity={entity} id={id} fields={def.fields} values={values} relations={relations} canDelete={canDelete} />
      </div>
      <Link href={`/dashboard/${base}`} className="mt-6 inline-block text-xs text-mist hover:text-white">← Back to {def.plural.toLowerCase()}</Link>
    </>
  )
}
