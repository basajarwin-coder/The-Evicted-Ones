'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { deleteEntity, deleteApplication, setApplicationStatus, saveSettings } from '@/app/(frontend)/dashboard/actions'
import type { EntityKey } from '@/lib/dashboard-config'
import { btnCls, ghostBtn, inputCls, labelCls } from './EntityForm'

export function DeleteButton({ entity, id, label = 'Delete' }: { entity: EntityKey | 'applications'; id: string; label?: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [err, setErr] = useState('')
  return (
    <>
      <button disabled={pending} onClick={() => { if (!confirm('Delete permanently?')) return; start(async () => { const r = entity === 'applications' ? await deleteApplication(id) : await deleteEntity(entity, id); if (!r.ok) setErr(r.error ?? 'Failed'); else router.refresh() }) }} className="text-xs text-loss/80 hover:text-loss disabled:opacity-50">{pending ? '…' : label}</button>
      {err && <span className="ml-2 text-xs text-loss">{err}</span>}
    </>
  )
}

export function ApplicationReview({ id, status, note }: { id: string; status: string; note: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [text, setText] = useState(note)
  const [err, setErr] = useState('')
  const set = (s: string) => start(async () => { const r = await setApplicationStatus(id, s, text); if (!r.ok) setErr(r.error ?? 'Failed'); else { setErr(''); router.refresh() } })
  return (
    <div className="mt-4 space-y-3 border-t border-line pt-4">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Internal review note (optional)" maxLength={500} className={inputCls} />
      <div className="flex flex-wrap items-center gap-2">
        {(['pending', 'accepted', 'rejected'] as const).map((s) => (
          <button key={s} disabled={pending || s === status} onClick={() => set(s)} className={s === status ? `${btnCls} opacity-60` : ghostBtn}>{s.toUpperCase()}</button>
        ))}
        <span className="ml-auto"><DeleteButton entity="applications" id={id} /></span>
      </div>
      {err && <p className="text-xs text-loss">{err}</p>}
    </div>
  )
}

export function SettingsForm({ values }: { values: Record<string, any> }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const f = (n: string, l: string) => (
    <label className={labelCls}>{l.toUpperCase()}<input name={n} defaultValue={values[n] ?? ''} placeholder="https://" className={inputCls} /></label>
  )
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); start(async () => { const r = await saveSettings(fd); setMsg({ ok: r.ok, text: r.ok ? r.message ?? 'Saved.' : r.error ?? 'Failed' }); if (r.ok) router.refresh() }) }} className="grid max-w-3xl gap-5 sm:grid-cols-2">
      <label className={`${labelCls} sm:col-span-2`}>HOMEPAGE TAGLINE<input name="tagline" defaultValue={values.tagline ?? ''} className={inputCls} /></label>
      <label className={`${labelCls} sm:col-span-2`}>CLAN INTRODUCTION<textarea name="intro" rows={3} defaultValue={values.intro ?? ''} className={inputCls} /></label>
      <label className="flex items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" name="recruitmentOpen" defaultChecked={values.recruitmentOpen !== false} className="h-4 w-4 accent-blue" /> Recruitment open (shows the application form)</label>
      {f('discord', 'Discord link')}{f('youtube', 'YouTube link')}{f('instagram', 'Instagram link')}{f('tiktok', 'TikTok link')}{f('facebook', 'Facebook link')}
      {msg && <p role="alert" className={`border px-4 py-3 text-sm sm:col-span-2 ${msg.ok ? 'border-win/40 bg-win/10 text-win' : 'border-loss/40 bg-loss/10 text-loss'}`}>{msg.text}</p>}
      <div className="sm:col-span-2"><button disabled={pending} className={btnCls}>{pending ? 'SAVING…' : 'SAVE SETTINGS'}</button></div>
    </form>
  )
}
