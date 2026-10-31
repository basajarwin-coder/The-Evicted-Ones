'use client'

import { useActionState } from 'react'
import { loginAction, setupOwnerAction, type ActionResult } from '@/app/(frontend)/dashboard/actions'
import { btnCls, inputCls, labelCls } from './EntityForm'

export function LoginForm() {
  const [s, action, pending] = useActionState<ActionResult | null, FormData>(loginAction, null)
  return (
    <form action={action} className="space-y-5">
      <label className={labelCls}>EMAIL<input name="email" type="email" required autoComplete="username" className={inputCls} /></label>
      <label className={labelCls}>PASSWORD<input name="password" type="password" required autoComplete="current-password" className={inputCls} /></label>
      {s?.error && <p role="alert" className="border border-loss/40 bg-loss/10 px-4 py-3 text-sm text-loss">{s.error}</p>}
      <button disabled={pending} className={`${btnCls} w-full py-3.5`}>{pending ? 'SIGNING IN…' : 'SIGN IN'}</button>
    </form>
  )
}

export function SetupForm() {
  const [s, action, pending] = useActionState<ActionResult | null, FormData>(setupOwnerAction, null)
  return (
    <form action={action} className="space-y-5">
      <label className={labelCls}>YOUR NAME<input name="name" required className={inputCls} /></label>
      <label className={labelCls}>EMAIL<input name="email" type="email" required autoComplete="username" className={inputCls} /></label>
      <label className={labelCls}>PASSWORD (MIN 10 CHARACTERS)<input name="password" type="password" required minLength={10} autoComplete="new-password" className={inputCls} /></label>
      <label className={labelCls}>CONFIRM PASSWORD<input name="confirm" type="password" required minLength={10} autoComplete="new-password" className={inputCls} /></label>
      {s?.error && <p role="alert" className="border border-loss/40 bg-loss/10 px-4 py-3 text-sm text-loss">{s.error}</p>}
      <button disabled={pending} className={`${btnCls} w-full py-3.5`}>{pending ? 'CREATING…' : 'CREATE OWNER ACCOUNT'}</button>
    </form>
  )
}
