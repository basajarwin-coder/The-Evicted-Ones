'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { deletePhoto, updatePhoto, uploadPhotos } from '@/app/(frontend)/dashboard/actions'
import { categoryOptions, type Option } from '@/lib/dashboard-config'
import { btnCls, ghostBtn, inputCls, labelCls } from './EntityForm'

export type AdminPhoto = { id: string; url: string; caption: string; category: string; memberId: string; memberName: string; date: string; canEdit: boolean }

export function PhotoUploader({ members, canTeam, defaultMember }: { members: Option[]; canTeam: boolean; defaultMember?: string }) {
  const router = useRouter()
  const ref = useRef<HTMLFormElement>(null)
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [count, setCount] = useState(0)
  const today = new Date().toISOString().slice(0, 10)
  const cats = canTeam ? categoryOptions : categoryOptions.filter((c) => ['member', 'gameplay', 'victory', 'tournament'].includes(c.value))
  return (
    <form ref={ref} onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); setMsg(null); start(async () => { const r = await uploadPhotos(fd); setMsg({ ok: r.ok, text: r.ok ? r.message ?? 'Uploaded.' : r.error ?? 'Failed' }); if (r.ok) { ref.current?.reset(); setCount(0) } router.refresh() }) }} className="grid gap-4 border border-line bg-coal p-5 sm:grid-cols-2 lg:grid-cols-4">
      <label className={`${labelCls} sm:col-span-2 lg:col-span-4`}>IMAGES (SELECT MULTIPLE)
        <input type="file" name="files" multiple required accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setCount(e.target.files?.length ?? 0)} className="mt-1.5 block w-full border border-dashed border-line bg-ink p-4 text-sm text-mist file:mr-3 file:border-0 file:bg-blue file:px-3 file:py-2 file:text-white" />
        {count > 0 && <span className="mt-1 block text-[11px] normal-case tracking-normal text-ice">{count} file{count > 1 ? 's' : ''} selected</span>}
      </label>
      <label className={labelCls}>CATEGORY<select name="category" defaultValue={defaultMember ? 'member' : cats[0].value} className={inputCls}>{cats.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
      <label className={labelCls}>ASSIGN TO MEMBER<select name="member" defaultValue={defaultMember ?? ''} className={inputCls}><option value="">— none (team / clan) —</option>{members.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</select></label>
      <label className={labelCls}>CAPTION<input name="caption" maxLength={160} className={inputCls} /></label>
      <label className={labelCls}>DATE<input type="date" name="takenAt" defaultValue={today} className={inputCls} /></label>
      {msg && <p role="alert" className={`border px-4 py-3 text-sm sm:col-span-2 lg:col-span-4 ${msg.ok ? 'border-win/40 bg-win/10 text-win' : 'border-loss/40 bg-loss/10 text-loss'}`}>{msg.text}</p>}
      <div className="sm:col-span-2 lg:col-span-4"><button disabled={pending} className={btnCls}>{pending ? 'UPLOADING…' : 'UPLOAD PHOTOS'}</button><span className="ml-3 text-[11px] text-mist">JPG, PNG, WebP, GIF · cropped to a square · max 8 MB each · up to 20 at once. Member-category photos must be assigned to a member.</span></div>
    </form>
  )
}

export function PhotoTile({ p, members }: { p: AdminPhoto; members: Option[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [edit, setEdit] = useState(false)
  const [err, setErr] = useState('')
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) => start(async () => { const r = await fn(); if (!r.ok) setErr(r.error ?? 'Failed'); else { setErr(''); after?.(); router.refresh() } })
  return (
    <div className="overflow-hidden border border-line bg-coal">
      <div className="relative aspect-square bg-plate"><Image src={p.url} alt={p.caption || 'photo'} fill sizes="(max-width:768px) 50vw, 20vw" className="object-cover" /></div>
      <div className="space-y-1 p-3 text-xs">
        <p className="truncate font-semibold text-white">{p.caption || 'Untitled'}</p>
        <p className="text-mist">{categoryOptions.find((c) => c.value === p.category)?.label} · {p.memberName || 'No member'} · {p.date}</p>
        {err && <p className="text-loss">{err}</p>}
        {p.canEdit && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button onClick={() => setEdit(!edit)} className="text-ice hover:underline">{edit ? 'Close' : 'Edit / replace'}</button>
            <button disabled={pending} onClick={() => { if (confirm('Delete this photo permanently?')) run(() => deletePhoto(p.id)) }} className="text-loss/80 hover:text-loss">Delete</button>
          </div>
        )}
        {edit && (
          <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); run(() => updatePhoto(p.id, fd), () => setEdit(false)) }} className="space-y-2 border-t border-line pt-3">
            <input name="caption" defaultValue={p.caption} placeholder="Caption" className={inputCls} />
            <select name="category" defaultValue={p.category} className={inputCls}>{categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
            <select name="member" defaultValue={p.memberId} className={inputCls}><option value="">No member</option>{members.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</select>
            <input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif" className="block w-full text-[11px] text-mist file:mr-2 file:border-0 file:bg-plate file:px-2 file:py-1.5 file:text-white" />
            <button disabled={pending} className={btnCls}>{pending ? 'SAVING…' : 'SAVE'}</button>
          </form>
        )}
      </div>
    </div>
  )
}
