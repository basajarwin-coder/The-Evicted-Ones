import Image from 'next/image'
import Link from 'next/link'
import type { Media } from '@/payload-types'

export function Logo({ size = 48, className = '' }: { size?: number; className?: string }) {
  return <Image src="/teo-logo.png" alt="TEO logo" width={Math.round(size * 0.808)} height={size} priority className={className} />
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="flex items-center gap-3 font-display text-xs font-semibold tracking-[0.35em] text-blue">
          <span className="h-px w-8 bg-blue" /> {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold uppercase sm:text-4xl">{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className="font-display text-xs font-semibold tracking-[0.25em] text-ice transition hover:text-white">
          {action.label} →
        </Link>
      )}
    </div>
  )
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line pt-32 pb-14 grid-bg">
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-blue/20 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <p className="font-display text-[10px] font-semibold tracking-[0.22em] text-blue sm:text-xs sm:tracking-[0.4em]">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold uppercase sm:text-5xl lg:text-6xl">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-lg text-mist">{children}</div>}
      </div>
    </section>
  )
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="clip-cut border border-dashed border-line bg-coal/60 px-6 py-14 text-center">
      <Image src="/teo-logo.png" alt="" width={44} height={54} className="mx-auto opacity-40 grayscale" />
      <p className="mt-4 font-display text-lg font-bold uppercase">{title}</p>
      {children && <p className="mx-auto mt-2 max-w-md text-sm text-mist">{children}</p>}
    </div>
  )
}

export function DemoBadge() {
  return <span className="rounded-sm border border-draw/40 bg-draw/10 px-1.5 py-0.5 font-display text-[10px] font-bold tracking-widest text-draw">DEMO</span>
}

export function StatusPill({ status }: { status: 'active' | 'inactive' }) {
  const on = status === 'active'
  return (
    <span className={`inline-flex items-center gap-1.5 font-display text-[11px] font-bold tracking-widest ${on ? 'text-win' : 'text-mist'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-win shadow-[0_0_8px] shadow-win' : 'bg-mist/60'}`} />
      {on ? 'ACTIVE' : 'INACTIVE'}
    </span>
  )
}

export function MediaImage({ media, alt, sizes = '(max-width:768px) 100vw, 33vw', className = '', priority = false, fit = 'cover' }: { media?: Media | string | null; alt: string; sizes?: string; className?: string; priority?: boolean; fit?: 'cover' | 'contain' }) {
  if (!media || typeof media === 'string' || !media.url) return null
  return <Image src={media.url} alt={media.alt || alt} fill sizes={sizes} className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`} priority={priority} />
}

export function Avatar({ media, name, className = '', sizes = '320px', fit = 'cover' }: { media?: Media | string | null; name: string; className?: string; sizes?: string; fit?: 'cover' | 'contain' }) {
  const has = media && typeof media !== 'string' && media.url
  return (
    <div className={`relative overflow-hidden bg-plate ${className}`}>
      {has ? (
        <MediaImage media={media} alt={name} sizes={sizes} fit={fit} />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-plate to-coal">
          <Image src="/teo-logo.png" alt="" width={90} height={111} className="opacity-25" />
          <span className="absolute bottom-3 left-4 font-display text-4xl font-extrabold text-white/15">{name.slice(0, 2).toUpperCase()}</span>
        </div>
      )}
    </div>
  )
}

export function OutcomeBadge({ outcome }: { outcome: 'win' | 'loss' | 'draw' }) {
  const m = { win: 'border-win/50 bg-win/10 text-win', loss: 'border-loss/50 bg-loss/10 text-loss', draw: 'border-draw/50 bg-draw/10 text-draw' }[outcome]
  return <span className={`inline-block border px-3 py-1 font-display text-xs font-extrabold tracking-[0.25em] ${m}`}>{outcome.toUpperCase()}</span>
}
