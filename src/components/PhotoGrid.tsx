'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

export type PhotoItem = { id: string; url: string; alt: string; caption?: string | null; category: string; categoryLabel: string; date?: string | null; member?: { ign: string; slug: string } | null }

export function Lightbox({ items, index, onClose, onIndex }: { items: PhotoItem[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const item = items[index]
  const prev = useCallback(() => onIndex((index - 1 + items.length) % items.length), [index, items.length, onIndex])
  const next = useCallback(() => onIndex((index + 1) % items.length), [index, items.length, onIndex])
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', k)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])
  if (!item) return null
  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-ink/95 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={onClose}>
      <div className="flex items-center justify-between px-5 py-4" onClick={(e) => e.stopPropagation()}>
        <span className="font-display text-xs tracking-[0.3em] text-mist">{index + 1} / {items.length}</span>
        <button onClick={onClose} className="border border-line px-4 py-2 font-display text-xs tracking-[0.3em] hover:border-blue">CLOSE</button>
      </div>
      <div className="relative mx-auto w-full max-w-6xl flex-1 px-4" onClick={(e) => e.stopPropagation()}>
        <Image src={item.url} alt={item.alt} fill sizes="100vw" className="object-contain" priority />
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
        {items.length > 1 ? <button onClick={prev} aria-label="Previous" className="h-11 w-11 border border-line font-display hover:border-blue">←</button> : <span />}
        <div className="text-center">
          {item.caption && <p className="break-words font-display text-base font-bold sm:text-lg">{item.caption}</p>}
          <p className="mt-1 text-xs text-mist">
            {item.categoryLabel}
            {item.date ? ` · ${item.date}` : ''}
            {item.member && <> · <Link href={`/members/${item.member.slug}`} className="text-ice hover:underline">{item.member.ign}</Link></>}
          </p>
        </div>
        {items.length > 1 ? <button onClick={next} aria-label="Next" className="h-11 w-11 border border-line font-display hover:border-blue">→</button> : <span />}
      </div>
    </div>
  )
}

export default function PhotoGrid({ items, filterable = false, columns = 'md:grid-cols-3 lg:grid-cols-4' }: { items: PhotoItem[]; filterable?: boolean; columns?: string }) {
  const [cat, setCat] = useState('all')
  const [open, setOpen] = useState<number | null>(null)
  const cats = Array.from(new Map(items.map((i) => [i.category, i.categoryLabel])).entries())
  const shown = cat === 'all' ? items : items.filter((i) => i.category === cat)
  const close = useCallback(() => setOpen(null), [])
  return (
    <div>
      {filterable && cats.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {[['all', 'All'], ...cats].map(([v, l]) => (
            <button key={v} onClick={() => setCat(v)} className={`border px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.2em] transition ${cat === v ? 'border-blue bg-blue text-white' : 'border-line text-mist hover:border-blue/60 hover:text-white'}`}>
              {l}
            </button>
          ))}
        </div>
      )}
      <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${columns}`}>
        {shown.map((p, i) => (
          <button key={p.id} onClick={() => setOpen(i)} className="group relative aspect-square overflow-hidden border border-line bg-plate text-left clip-cut-sm">
            <Image src={p.url} alt={p.alt} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-110" />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent opacity-80 transition group-hover:opacity-100" />
            <span className="absolute inset-x-0 bottom-0 p-3">
              <span className="block font-display text-[10px] tracking-[0.25em] text-ice">{p.categoryLabel.toUpperCase()}</span>
              {p.caption && <span className="mt-0.5 line-clamp-1 block text-sm font-medium">{p.caption}</span>}
            </span>
          </button>
        ))}
      </div>
      {open !== null && <Lightbox items={shown} index={open} onClose={close} onIndex={setOpen} />}
    </div>
  )
}
