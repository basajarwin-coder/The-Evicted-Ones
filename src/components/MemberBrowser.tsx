'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Avatar, DemoBadge, Empty } from '@/components/ui'
import { likeMember } from '@/app/(frontend)/(site)/actions'
import { memberSocials } from '@/lib/clan'
import { leadershipLabel } from '@/lib/roster'
import type { Media } from '@/payload-types'

export type MemberItem = {
  id: string; slug: string; ign: string; realName?: string | null; likes?: number; position: string; mode: string; status: 'active' | 'inactive'
  description?: string | null; avatar?: Media | null; isDemo?: boolean | null
  socials?: { discord?: string | null; facebook?: string | null; instagram?: string | null; youtube?: string | null; tiktok?: string | null; likes?: number | null; name?: string | null; team?: string | null; main?: string | null } | null
}
const modes = ['BOTH', 'MP', 'BR'] as const
const teams = [
  { id: 'ALL', label: 'ALL', note: 'Every member, from every team.' },
  { id: 'COMPE', label: 'COMPE', note: 'Competitive roster.' },
  { id: 'CASUAL', label: 'CASUAL', note: 'For fun / chill games.' },
  { id: 'SCRIM', label: 'SCRIM', note: 'Scrim participants.' },
] as const
const mains = ['SG', 'SR', 'AR', 'SMG'] as const

function memberTeam(m: MemberItem) {
  return teams.some((team) => team.id === m.socials?.team) ? m.socials?.team ?? '' : ''
}

function memberMain(m: MemberItem) {
  return mains.some((main) => main === m.socials?.main) ? m.socials?.main ?? '' : ''
}

const pill = (on: boolean) => `h-9 rounded-full border px-4 font-display text-[11px] font-semibold tracking-[0.16em] transition duration-300 ${on ? 'border-blue bg-blue text-white' : 'border-white/15 bg-ink/40 text-mist hover:border-blue hover:text-white'}`

function socialLinks(socials: MemberItem['socials']) {
  return memberSocials(socials)
}

function SocialIcon({ name }: { name: string }) {
  const common = { viewBox: '0 0 24 24', className: 'h-5 w-5', fill: 'currentColor', 'aria-hidden': true as const }
  if (name === 'facebook') {
    return <svg {...common}><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z" /></svg>
  }
  if (name === 'instagram') {
    return <svg {...common}><path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 1.6A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8zM17.4 6.3a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" /></svg>
  }
  return <svg {...common}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
}

type Frame = { top: number; left: number; width: number; height: number }

export function MemberCard({ m }: { m: MemberItem }) {
  const imageRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [origin, setOrigin] = useState<Frame | null>(null)
  const [likes, setLikes] = useState(m.likes ?? Number(m.socials?.likes ?? 0))
  function readFrame(): Frame | null {
    const rect = imageRef.current?.getBoundingClientRect()
    if (!rect || rect.width < 2) return null
    return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
  }
  const title = leadershipLabel(m.position)
  const links = socialLinks(m.socials)
  const frame = 'border-ice shadow-[0_0_40px_-12px_rgba(143,214,255,0.85)]'
  return (
    <>
      <article className={`group flex overflow-hidden border bg-coal transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? '' : 'hover:-translate-y-2 hover:shadow-[0_28px_70px_-24px_rgba(47,140,255,0.65)]'} ${frame}`}>
        <button
          type="button"
          onClick={() => {
            const frame = readFrame()
            if (!frame) return
            setOrigin(frame)
            setOpen(true)
          }}
          className="flex min-w-0 flex-1 flex-col text-left"
        >
          <div ref={imageRef} className="relative aspect-square w-full shrink-0 overflow-hidden bg-plate">
            <Avatar media={m.avatar} name={m.ign} fit="contain" className={`h-full w-full ${open ? 'opacity-0' : ''}`} />
            <div className="pointer-events-none absolute bottom-3 left-3 flex gap-2 transition duration-500 [@media(hover:hover)]:opacity-0 group-hover:opacity-100">
              {links.filter(([, href]) => /^https?:\/\//.test(href)).map(([name, href]) => (
                <span key={name} className="pointer-events-auto">
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={name} className="grid h-8 w-8 place-items-center rounded-md border border-white/20 bg-ink/70 text-white">
                    <SocialIcon name={name} />
                  </a>
                </span>
              ))}
            </div>
            <div className="absolute left-3 top-3 flex items-center gap-1.5">
              <span className="inline-flex h-6 items-center rounded-full border border-white/20 bg-ink/50 px-2.5 font-display text-[10px] font-semibold tracking-[0.16em] text-white backdrop-blur-md">{m.mode === 'BOTH' ? 'MP · BR' : m.mode}</span>
              {m.isDemo && <DemoBadge />}
            </div>
            <div className="absolute right-3 top-3">
              <span className={`inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 font-display text-[10px] font-semibold tracking-[0.14em] backdrop-blur-md ${m.status === 'active' ? 'border-win/40 bg-ink/50 text-win' : 'border-white/15 bg-ink/50 text-mist'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${m.status === 'active' ? 'bg-win shadow-[0_0_8px] shadow-win' : 'bg-mist/70'}`} />
                {m.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 px-4 py-3">
            {title ? <p className="inline-block w-fit bg-blue px-2 py-0.5 font-display text-[10px] font-bold tracking-[0.14em] text-white">{title.toUpperCase()}</p> : null}
            <p className="truncate font-display text-[11px] font-semibold tracking-[0.14em] text-blue">{m.position.toUpperCase()}</p>
            <h3 className="truncate font-display text-xl font-extrabold leading-none">{m.ign}</h3>
            <p className="h-5 truncate text-sm text-white/80">{m.realName}</p>
            {memberTeam(m) || memberMain(m) ? <p className="truncate font-display text-[11px] font-semibold tracking-[0.12em] text-ice">{[memberTeam(m), memberMain(m)].filter(Boolean).join(' · ')}</p> : null}
            <p className="flex items-center gap-1.5 font-display text-xs font-semibold tracking-[0.12em] text-blue">
              <span aria-hidden="true">♥</span>
              {likes} LIKES
            </p>
          </div>
        </button>
        <div className="flex w-8 shrink-0 items-center justify-center border-l border-line bg-ink/50" aria-hidden="true">
          <span className="font-display text-[10px] font-semibold tracking-[0.28em] text-ice" style={{ writingMode: 'vertical-rl' }}>VIEW PROFILE</span>
        </div>
      </article>
      {open && origin ? (
        <MemberProfile
          m={m}
          origin={origin}
          getOrigin={() => readFrame() ?? origin}
          onClose={() => setOpen(false)}
          onLikes={setLikes}
        />
      ) : null}
    </>
  )
}

function MemberProfile({ m, origin, getOrigin, onClose, onLikes }: { m: MemberItem; origin: Frame; getOrigin: () => Frame; onClose: () => void; onLikes: (count: number) => void }) {
  const slotRef = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const finished = useRef(false)
  const returnAt = useRef(0)
  const [blur, setBlur] = useState(false)
  const [panel, setPanel] = useState(false)
  const [photo, setPhoto] = useState(origin)
  const [moving, setMoving] = useState(false)
  const [likes, setLikes] = useState(m.likes ?? Number(m.socials?.likes ?? 0))
  const pending = useRef(0)
  const sending = useRef(false)
  const likeRef = useRef<HTMLButtonElement>(null)
  const burstId = useRef(0)
  const [bursts, setBursts] = useState<{ id: number; x: number; top: number; left: number }[]>([])
  const links = socialLinks(m.socials)
  const chips = [...new Set([leadershipLabel(m.position), m.position, m.mode === 'BOTH' ? 'MP · BR' : m.mode, memberTeam(m), memberMain(m)].filter(Boolean))]

  useLayoutEffect(() => {
    setPhoto(getOrigin())
    let second = 0
    const first = requestAnimationFrame(() => {
      setMoving(true)
      setBlur(true)
      second = requestAnimationFrame(() => {
        const slot = slotRef.current?.getBoundingClientRect()
        if (slot && slot.width > 2) setPhoto({ top: slot.top, left: slot.left, width: slot.width, height: slot.height })
      })
    })
    const reveal = window.setTimeout(() => setPanel(true), 420)
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
      window.clearTimeout(reveal)
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [])

  function finish() {
    if (finished.current) return
    finished.current = true
    setBlur(false)
    window.setTimeout(onClose, 160)
  }

  function close() {
    if (closing.current) return
    closing.current = true
    returnAt.current = performance.now()
    setPanel(false)
    setPhoto(getOrigin())
    window.setTimeout(finish, 700)
  }

  async function like() {
    const id = burstId.current + 1
    burstId.current = id
    const x = Math.round((Math.random() - 0.5) * 36)
    const rect = likeRef.current?.getBoundingClientRect()
    const top = rect ? rect.top + 6 : 0
    const left = rect ? rect.left + rect.width / 2 : 0
    setBursts((current) => [...current.slice(-16), { id, x, top, left }])
    window.setTimeout(() => setBursts((current) => current.filter((item) => item.id !== id)), 700)
    pending.current += 1
    setLikes((count) => {
      const next = count + 1
      onLikes(next)
      return next
    })
    if (sending.current) return
    sending.current = true
    try {
      while (pending.current > 0) {
        const delta = pending.current
        pending.current = 0
        try {
          const saved = await likeMember(m.id, delta)
          const next = saved + pending.current
          setLikes(next)
          onLikes(next)
        } catch {
          pending.current += delta
          setLikes((count) => {
            const next = Math.max(0, count - delta)
            onLikes(next)
            return next
          })
          break
        }
      }
    } finally {
      sending.current = false
    }
  }

  return createPortal(
    <>
    <div className={`fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm transition duration-150 ${blur ? 'opacity-100' : 'opacity-0'}`} onClick={close} />
      <article
        role="dialog"
        aria-label={`${m.ign} profile`}
        onClick={(event) => event.stopPropagation()}
        className={`fixed left-1/2 top-1/2 z-[91] max-h-[calc(100dvh-1.5rem)] w-[min(28rem,calc(100%-1.25rem))] -translate-x-1/2 -translate-y-1/2 overflow-x-hidden overflow-y-auto rounded-2xl border border-white/10 bg-[#111318] shadow-2xl transition duration-300 ${panel ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <p className="px-5 pt-4 font-display text-[10px] tracking-[0.35em] text-mist">TEO MEMBER PROFILE</p>
        <div className="px-4 pt-3">
          <div ref={slotRef} className="aspect-square w-full" />
        </div>
        <div className="flex items-start justify-between gap-4 px-5 pt-4">
          <div>
            <h3 className="break-words font-display text-2xl font-bold uppercase leading-none sm:text-3xl">{m.ign}</h3>
            {m.realName ? <p className="mt-1 text-sm uppercase tracking-[0.14em] text-mist">{m.realName}</p> : null}
          </div>
          <button ref={likeRef} type="button" onClick={like} aria-label={`Likes for ${m.ign}. ${likes}.`} className="relative z-[1] flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-sm transition duration-150 hover:border-blue hover:text-ice active:scale-90">
            <span aria-hidden="true" className="text-blue">♥</span>
            <span className="font-display tracking-[0.14em]">{likes} LIKES</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2 px-5 pt-4">
          {chips.map((chip) => (
            <span key={chip} className="rounded-md bg-blue px-2.5 py-1 font-display text-[10px] font-bold tracking-[0.14em] text-white">{String(chip).toUpperCase()}</span>
          ))}
        </div>
        <div className="flex justify-start gap-2 px-5 py-5">
          {links.filter(([, href]) => /^https?:\/\//.test(href)).map(([name, href]) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name} className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-white transition duration-300 hover:-translate-y-0.5 hover:border-blue">
              <SocialIcon name={name} />
            </a>
          ))}
        </div>
      </article>
      <div
        className="pointer-events-none fixed z-[95] overflow-hidden"
        onTransitionEnd={(event) => {
          if (event.propertyName !== 'width' || event.target !== event.currentTarget) return
          if (!closing.current || performance.now() - returnAt.current < 500) return
          finish()
        }}
        style={{
          top: photo.top,
          left: photo.left,
          width: photo.width,
          height: photo.height,
          transition: moving ? 'top 640ms cubic-bezier(0.22,1,0.36,1), left 640ms cubic-bezier(0.22,1,0.36,1), width 640ms cubic-bezier(0.22,1,0.36,1), height 640ms cubic-bezier(0.22,1,0.36,1)' : 'none',
        }}
      >
        <Avatar media={m.avatar} name={m.ign} fit="contain" className="h-full w-full" />
      </div>
      {bursts.map((burst) => (
        <span key={burst.id} className="contents" aria-hidden="true">
          <span className="like-pop" style={{ top: burst.top, left: burst.left + burst.x }}>♥</span>
          <span className="like-spark" style={{ top: burst.top, left: burst.left + burst.x - 10, ['--dx' as string]: '-14px' }}>✦</span>
          <span className="like-spark" style={{ top: burst.top, left: burst.left + burst.x + 8, ['--dx' as string]: '16px' }}>✦</span>
        </span>
      ))}
    </>,
    document.body,
  )
}

const PAGE_SIZE = 10

export function MemberGrid({ items, total, label = 'MEMBERS' }: { items: { m: MemberItem; caption?: string }[]; total?: number; label?: string }) {
  const [visible, setVisible] = useState(PAGE_SIZE)
  const active = items.filter(({ m }) => m.status === 'active').length
  const shown = items.slice(0, visible)
  const remaining = items.length - shown.length
  const filtered = total !== undefined && total !== items.length
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-end gap-4">
          <span className="font-display text-5xl font-extrabold leading-none text-white sm:text-6xl">{items.length}</span>
          <div className="pb-1">
            <p className="font-display text-xs font-bold tracking-[0.3em] text-blue">{label}</p>
            <p className="mt-1 font-display text-[10px] tracking-[0.2em] text-mist">{filtered ? `IN THIS FILTER · ${total} TOTAL` : 'IN THE ROSTER'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex h-8 items-center gap-2 rounded-full border border-win/40 bg-ink/50 px-3 font-display text-[10px] font-semibold tracking-[0.16em] text-win">
            <span className="h-1.5 w-1.5 rounded-full bg-win shadow-[0_0_8px] shadow-win" />{active} ACTIVE
          </span>
          <span className="inline-flex h-8 items-center gap-2 rounded-full border border-white/15 bg-ink/50 px-3 font-display text-[10px] font-semibold tracking-[0.16em] text-mist">
            <span className="h-1.5 w-1.5 rounded-full bg-mist/70" />{items.length - active} INACTIVE
          </span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {shown.map(({ m, caption }) => (
          <div key={m.id}>
            {caption ? <p className="mb-4 font-display text-xs font-bold tracking-[0.35em] text-ice">{caption}</p> : null}
            <MemberCard m={m} />
          </div>
        ))}
      </div>
      {items.length > PAGE_SIZE ? (
        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="font-display text-[11px] tracking-[0.22em] text-mist">SHOWING {shown.length} OF {items.length}</p>
          <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-blue transition-[width] duration-500" style={{ width: `${(shown.length / items.length) * 100}%` }} />
          </div>
          {remaining > 0 ? (
            <button type="button" onClick={() => setVisible((count) => count + PAGE_SIZE)} className="bg-blue px-8 py-3.5 font-display text-xs font-bold tracking-[0.25em] text-white transition hover:bg-ice hover:text-ink clip-cut-sm">
              LOAD MORE · {Math.min(PAGE_SIZE, remaining)} MORE
            </button>
          ) : (
            <button type="button" onClick={() => setVisible(PAGE_SIZE)} className="border border-white/15 px-8 py-3.5 font-display text-xs font-bold tracking-[0.25em] text-mist transition hover:border-blue hover:text-white clip-cut-sm">
              SHOW LESS
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default function MemberBrowser({ members, filters = 'mode' }: { members: MemberItem[]; filters?: 'mode' | 'teams' }) {
  const [mode, setMode] = useState<(typeof modes)[number]>('BOTH')
  const [team, setTeam] = useState<(typeof teams)[number]['id']>('ALL')
  const [main, setMain] = useState<(typeof mains)[number] | 'ALL'>('ALL')
  const shown = useMemo(() => {
    if (filters === 'teams') {
      return members.filter((m) => (team === 'ALL' || memberTeam(m) === team) && (main === 'ALL' || memberMain(m) === main))
    }
    return members.filter((m) => mode === 'BOTH' || m.mode === mode || m.mode === 'BOTH')
  }, [members, filters, mode, team, main])
  const teamNote = teams.find((item) => item.id === team)?.note
  return (
    <div>
      {filters === 'teams' ? (
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Team">
            {teams.map((item) => (
              <button key={item.id} type="button" aria-pressed={team === item.id} onClick={() => setTeam(item.id)} className={pill(team === item.id)}>{item.label}</button>
            ))}
          </div>
          <p className="font-display text-[11px] tracking-[0.16em] text-mist">{teamNote}</p>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Main weapon">
            <span className="mr-1 font-display text-[10px] font-semibold tracking-[0.22em] text-mist">MAIN</span>
            <button type="button" aria-pressed={main === 'ALL'} onClick={() => setMain('ALL')} className={pill(main === 'ALL')}>ALL</button>
            {mains.map((item) => (
              <button key={item} type="button" aria-pressed={main === item} onClick={() => setMain(item)} className={pill(main === item)}>{item}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Game mode">
          {modes.map((item) => (
            <button key={item} type="button" aria-pressed={mode === item} onClick={() => setMode(item)} className={pill(mode === item)}>{item}</button>
          ))}
        </div>
      )}
      {shown.length ? (
        <MemberGrid key={`${mode}-${team}-${main}`} items={shown.map((m) => ({ m }))} total={members.length} />
      ) : (
        <Empty title={members.length ? 'No members in this filter' : 'Roster coming soon'}>{members.length ? 'Try another team or main. Staff sets these when editing a member.' : 'Members will appear here once they are added by the clan staff.'}</Empty>
      )}
    </div>
  )
}
