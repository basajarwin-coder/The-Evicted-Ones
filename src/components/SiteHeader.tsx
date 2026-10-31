'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const links = [
  { href: '/#roster', id: 'roster', label: 'Members' },
  { href: '/#teams', id: 'teams', label: 'Teams' },
  { href: '/#management', id: 'management', label: 'Management' },
  { href: '/#results', id: 'results', label: 'Results' },
  { href: '/#gallery', id: 'gallery', label: 'Gallery' },
  { href: '/#news', id: 'news', label: 'News' },
  { href: '/#socials', id: 'socials', label: 'Socials' },
  { href: '/#join', id: 'join', label: 'Join' },
]

export default function SiteHeader() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const [activeId, setActiveId] = useState('')

  useEffect(() => setOpen(false), [path])
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    if (path !== '/') return
    let frame = 0
    const update = () => {
      const line = 110
      let current = ''
      for (const link of links) {
        const section = document.getElementById(link.id)
        if (section && section.getBoundingClientRect().top <= line) current = link.id
      }
      setActiveId(current)
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [path])

  const active = (id: string) => path === '/' && activeId === id

  function go(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id)
    if (path !== '/' || !target) return
    event.preventDefault()
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.pushState(null, '', `/#${id}`)
    setActiveId(id)
    setOpen(false)
  }

  return (
    <header className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-500 ${solid || open ? 'border-b border-line bg-ink/90 backdrop-blur-xl' : 'bg-transparent'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-8">
        <Link href="/#members" onClick={(event) => go(event, 'members')} className="flex min-w-0 shrink items-center gap-3 transition duration-300 hover:opacity-80">
          <Image src="/teo-logo.png" alt="TEO" width={34} height={42} priority className="h-9 w-auto shrink-0 sm:h-10" />
          <span className="min-w-0 leading-none">
            <span className="block font-display text-lg font-extrabold tracking-[0.12em] sm:text-xl sm:tracking-[0.15em]">TEO</span>
            <span className="hidden truncate font-display text-[9px] tracking-[0.28em] text-mist min-[380px]:block">THE EVICTED ONES</span>
          </span>
        </Link>
        <nav className="hidden min-w-0 items-center lg:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.id} href={l.href} onClick={(event) => go(event, l.id)} className={`relative px-2 py-2 font-display text-[10px] font-semibold uppercase tracking-[0.12em] transition duration-300 xl:px-3 xl:text-[11px] xl:tracking-[0.16em] ${active(l.id) ? 'text-white' : 'text-mist hover:text-white'}`}>
              {l.label}
              <span className={`absolute inset-x-3 -bottom-0.5 h-0.5 origin-left bg-blue transition-transform duration-300 ${active(l.id) ? 'scale-x-100' : 'scale-x-0'}`} />
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 lg:hidden">
          <button aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center border border-line transition duration-300 hover:border-blue">
            <span className="flex w-5 flex-col items-center gap-[5px]">
              <span className={`block h-0.5 w-full bg-white transition duration-300 ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
              <span className={`block h-0.5 w-full bg-white transition duration-300 ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-full bg-white transition duration-300 ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </div>
      <nav className={`overflow-hidden border-line bg-ink transition-all duration-500 lg:hidden ${open ? 'max-h-[70dvh] overflow-y-auto border-t' : 'max-h-0'}`} aria-label="Mobile">
        <div className="px-4 pb-6 pt-3 sm:px-5">
          {links.map((l) => (
            <Link key={l.id} href={l.href} onClick={(event) => go(event, l.id)} className={`block border-b border-line/60 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.2em] transition duration-300 ${active(l.id) ? 'text-ice' : 'text-white'}`}>
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
