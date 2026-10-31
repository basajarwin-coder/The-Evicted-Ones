'use client'

import { useActionState } from 'react'
import { submitApplication, type ApplyResult } from '@/app/(frontend)/(site)/actions'

const input = 'mt-2 w-full border border-line bg-coal px-4 py-3 text-sm outline-none transition focus:border-blue focus:bg-steel'
const label = 'block font-display text-[11px] font-semibold tracking-[0.25em] text-mist'

export default function ApplyForm() {
  const [state, action, pending] = useActionState<ApplyResult | null, FormData>(submitApplication, null)
  if (state?.ok)
    return (
      <div className="clip-cut border border-win/40 bg-win/5 p-10 text-center">
        <p className="font-display text-xs tracking-[0.4em] text-win">APPLICATION RECEIVED</p>
        <h3 className="mt-3 font-display text-3xl font-extrabold">Welcome to the trial</h3>
        <p className="mt-3 text-mist">Our staff reviews every application privately. We will reach out through your in-game profile or Discord.</p>
      </div>
    )
  return (
    <form action={action} className="clip-cut space-y-5 border border-line bg-coal/80 p-6 sm:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={label}>CODM IGN *<input name="ign" required maxLength={40} className={input} /></label>
        <label className={label}>PLAYER ID *<input name="playerId" required inputMode="numeric" maxLength={20} className={input} /></label>
        <label className={label}>PREFERRED MODE *
          <select name="mode" required defaultValue="" className={input}><option value="" disabled>Select…</option><option value="MP">Multiplayer (MP)</option><option value="BR">Battle Royale (BR)</option><option value="BOTH">Both</option></select>
        </label>
        <label className={label}>CURRENT RANK *<input name="rank" required maxLength={40} placeholder="e.g. Legendary" className={input} /></label>
      </div>
      <label className={label}>PREVIOUS CLAN EXPERIENCE<textarea name="previousClans" rows={2} maxLength={500} className={input} /></label>
      <label className={label}>AVAILABILITY *<textarea name="availability" required rows={2} maxLength={500} placeholder="Days, times and time zone" className={input} /></label>
      <label className={label}>SHORT INTRODUCTION *<textarea name="introduction" required rows={4} maxLength={1500} className={input} /></label>
      {state?.error && <p role="alert" className="border border-loss/40 bg-loss/10 px-4 py-3 text-sm text-loss">{state.error}</p>}
      <button disabled={pending} className="w-full bg-blue px-8 py-4 font-display text-sm font-bold tracking-[0.3em] text-white transition hover:bg-ice hover:text-ink disabled:opacity-60 clip-cut-sm sm:w-auto">
        {pending ? 'SUBMITTING…' : 'SUBMIT APPLICATION'}
      </button>
      <p className="text-xs text-mist">Applications are private and visible only to authorised TEO staff.</p>
    </form>
  )
}
