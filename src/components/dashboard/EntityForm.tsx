'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { saveEntity, deleteEntity } from '@/app/(frontend)/dashboard/actions'
import type { EntityKey, FieldDef, Option } from '@/lib/dashboard-config'
import { btnCls, ghostBtn, inputCls, labelCls } from './classes'

export { btnCls, ghostBtn, inputCls, labelCls }

type Values = Record<string, any>

export default function EntityForm({ entity, id, fields, values, relations, canDelete }: {
  entity: EntityKey; id?: string; fields: FieldDef[]; values: Values; relations: Option[]; canDelete?: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [previews, setPreviews] = useState<Record<string, string>>({})

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    start(async () => {
      const r = await saveEntity(entity, id ?? null, fd)
      if (!r.ok) return setError(r.error ?? 'Could not save.')
      router.push(`/dashboard/${entity === 'scrims' ? 'results' : entity}`)
      router.refresh()
    })
  }

  function remove() {
    if (!id || !confirm('Delete this record permanently? This cannot be undone.')) return
    start(async () => {
      const r = await deleteEntity(entity, id)
      if (!r.ok) return setError(r.error ?? 'Could not delete.')
      router.push(`/dashboard/${entity === 'scrims' ? 'results' : entity}`)
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      {fields.map((f) => {
        const v = values[f.name]
        const span = f.half ? '' : 'sm:col-span-2'
        const req = f.required ? ' *' : ''
        if (f.type === 'checkbox')
          return (
            <label key={f.name} className={`flex items-center gap-3 text-sm ${span}`}>
              <input type="checkbox" name={f.name} defaultChecked={!!v} className="h-4 w-4 accent-blue" /> {f.label}
            </label>
          )
        if (f.type === 'image')
          return (
            <div key={f.name} className={span}>
              <span className={labelCls}>{f.label.toUpperCase()}</span>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {(previews[f.name] || v) && (
                  <div className="relative h-24 w-36 overflow-hidden border border-line bg-plate">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previews[f.name] || v} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="space-y-2">
                  <input type="file" name={f.name} accept="image/jpeg,image/png,image/webp,image/gif" className="block text-xs text-mist file:mr-3 file:border-0 file:bg-plate file:px-3 file:py-2 file:text-white"
                    onChange={(e) => { const file = e.target.files?.[0]; setPreviews((p) => ({ ...p, [f.name]: file ? URL.createObjectURL(file) : '' })) }} />
                  {v && <label className="flex items-center gap-2 text-xs text-mist"><input type="checkbox" name={`${f.name}__remove`} className="accent-blue" /> Remove current image</label>}
                  <p className="text-[11px] text-mist">JPG, PNG, WebP or GIF · cropped to a square · max 8 MB. {v ? 'Choosing a file replaces the current image.' : ''}</p>
                </div>
              </div>
            </div>
          )
        return (
          <label key={f.name} className={`${labelCls} ${span}`}>
            {f.label.toUpperCase()}{req}
            {f.type === 'textarea' || f.type === 'lines' ? (
              <textarea name={f.name} defaultValue={v ?? ''} rows={f.type === 'lines' ? 4 : 3} required={f.required} className={inputCls} />
            ) : f.type === 'select' ? (
              <select name={f.name} defaultValue={v ?? ''} required={f.required} className={inputCls}>
                <option value="">Select…</option>
                {v && !f.options?.some((o) => o.value === v) ? <option value={v}>{v}</option> : null}
                {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === 'relation' ? (
              <select name={f.name} defaultValue={v ?? ''} className={inputCls}>
                <option value="">None</option>
                {relations.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === 'multirelation' ? (
              <select name={f.name} multiple defaultValue={v ?? []} className={`${inputCls} h-40`}>
                {relations.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input type={f.type} name={f.name} defaultValue={v ?? ''} required={f.required && !(f.type === 'password' && id)} min={f.min} step={f.type === 'number' ? 1 : undefined} minLength={f.type === 'password' ? 10 : undefined} autoComplete={f.type === 'password' ? 'new-password' : undefined} className={inputCls} />
            )}
            {f.hint && <span className="mt-1 block font-sans text-[11px] font-normal normal-case tracking-normal text-mist">{f.hint}</span>}
          </label>
        )
      })}
      {error && <p role="alert" className="border border-loss/40 bg-loss/10 px-4 py-3 text-sm text-loss sm:col-span-2">{error}</p>}
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <button disabled={pending} className={btnCls}>{pending ? 'SAVING…' : id ? 'SAVE CHANGES' : 'CREATE'}</button>
        <button type="button" onClick={() => router.back()} className={ghostBtn}>CANCEL</button>
        {id && canDelete && <button type="button" onClick={remove} disabled={pending} className="ml-auto border border-loss/40 px-4 py-2.5 font-display text-xs font-semibold tracking-[0.2em] text-loss hover:bg-loss/10">DELETE</button>}
      </div>
    </form>
  )
}
