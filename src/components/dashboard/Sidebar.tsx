'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { logoutAction } from '@/app/(frontend)/dashboard/actions'

export type NavItem = { href: string; label: string }

export default function Sidebar({ items, user }: { items: NavItem[]; user: { name: string; roleLabel: string } }) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const active = (h: string) => (h === '/dashboard' ? path === h : path.startsWith(h))
  const nav = (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {items.map((i) => (
        <Link key={i.href} href={i.href} onClick={() => setOpen(false)} className={`block border-l-2 px-4 py-2.5 text-sm font-medium transition ${active(i.href) ? 'border-blue bg-blue/10 text-white' : 'border-transparent text-mist hover:bg-plate hover:text-white'}`}>
          {i.label}
        </Link>
      ))}
      <form action={logoutAction} className="pt-3">
        <button className="block w-full border-l-2 border-transparent px-4 py-2.5 text-left text-sm font-medium text-loss/90 transition hover:bg-loss/10">Logout</button>
      </form>
    </nav>
  )
  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-coal px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-display font-extrabold tracking-[0.2em]"><Image src="/teo-logo.png" alt="" width={24} height={30} />TEO ADMIN</Link>
        <button onClick={() => setOpen(!open)} className="border border-line px-3 py-1.5 font-display text-xs tracking-[0.2em]">{open ? 'CLOSE' : 'MENU'}</button>
      </div>
      <aside className={`${open ? 'flex' : 'hidden'} fixed inset-x-0 top-[53px] bottom-0 z-30 flex-col bg-coal lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-line`}>
        <Link href="/dashboard" className="hidden items-center gap-3 border-b border-line px-5 py-5 lg:flex">
          <Image src="/teo-logo.png" alt="" width={34} height={42} />
          <span><span className="block font-display text-lg font-extrabold tracking-[0.2em]">TEO</span><span className="block font-display text-[9px] tracking-[0.35em] text-mist">STAFF DASHBOARD</span></span>
        </Link>
        {nav}
        <div className="border-t border-line px-5 py-4 text-xs"><p className="font-semibold text-white">{user.name}</p><p className="mt-0.5 text-mist">{user.roleLabel}</p></div>
      </aside>
    </>
  )
}
