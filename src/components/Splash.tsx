'use client'

import Image from 'next/image'
import { CLAN_LINE } from '@/lib/clan'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

type Phase = 'welcome' | 'loading' | 'leaving' | 'done'
const DURATION = 3600

export default function Splash() {
  const [phase, setPhase] = useState<Phase>('welcome')
  const [pct, setPct] = useState(0)
  const raf = useRef<number | null>(null)

  useLayoutEffect(() => {
    const hash = window.location.hash
    if (hash !== '' && hash !== '#roster' && hash !== '#members' && hash !== '#home') return
    if (hash) history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (sessionStorage.getItem('teo-entered')) setPhase('done')
  }, [])

  useEffect(() => {
    document.body.style.overflow = phase === 'done' ? '' : 'hidden'
    if ((phase === 'leaving' || phase === 'done') && !window.location.hash) window.scrollTo(0, 0)
    return () => {
      document.body.style.overflow = ''
    }
  }, [phase])

  const enter = useCallback(() => {
    window.dispatchEvent(new Event('teo-unlock'))
    setPhase('loading')
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION)
      // ease with a slight stall in the middle so it feels like real loading
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      setPct(Math.max(1, Math.round(eased * 100)))
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else {
        sessionStorage.setItem('teo-entered', '1')
        setTimeout(() => {
          setPhase('leaving')
          window.dispatchEvent(new Event('teo-start'))
        }, 350)
        setTimeout(() => setPhase('done'), 1150)
      }
    }
    raf.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current) }, [])

  if (phase === 'done') return null

  return (
    <div
      role="dialog"
      aria-label="Welcome to TEO"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ink px-4 text-center transition-all duration-700 sm:px-6 ${phase === 'leaving' ? 'pointer-events-none scale-110 opacity-0' : 'opacity-100'}`}
    >
      <div className="grid-bg absolute inset-0 opacity-70" />
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/25 blur-[140px]" />
      <div className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-violet/20 blur-[130px]" />

      <div className="relative flex flex-col items-center">
        <Image src="/teo-logo.png" alt="TEO – The Evicted Ones" width={207} height={256} priority className="h-36 w-auto animate-float drop-shadow-[0_0_50px_rgba(47,140,255,0.55)] sm:h-52" />
        <p className="mt-8 font-display text-xs font-semibold tracking-[0.28em] text-ice animate-rise sm:text-sm sm:tracking-[0.6em]" style={{ animationDelay: '0.1s' }}>WELCOME TO</p>
        <h1 className="mt-2 font-display text-6xl font-extrabold tracking-[0.08em] text-gradient animate-rise sm:text-8xl sm:tracking-[0.12em] lg:text-9xl" style={{ animationDelay: '0.25s' }}>TEO</h1>
        <p className="mt-2 font-display text-[10px] tracking-[0.22em] text-mist animate-rise sm:text-xs sm:tracking-[0.5em]" style={{ animationDelay: '0.4s' }}>THE EVICTED ONES</p>
        <p className="mt-4 max-w-md font-display text-sm font-medium tracking-normal text-ice animate-rise sm:text-base" style={{ animationDelay: '0.5s' }}>{CLAN_LINE}</p>

        <div className="mt-12 h-24 w-full max-w-sm">
          {phase === 'welcome' ? (
            <button
              onClick={enter}
              className="group relative w-full overflow-hidden bg-blue px-10 py-4 font-display text-sm font-bold tracking-[0.4em] text-white shadow-[0_0_40px_rgba(47,140,255,0.45)] transition hover:bg-ice hover:text-ink clip-cut-sm animate-rise"
              style={{ animationDelay: '0.55s' }}
            >
              <span className="relative z-10">ENTER</span>
              <span className="absolute inset-y-0 w-1/3 -skew-x-12 bg-white/30 animate-sweep" />
            </button>
          ) : (
            <div aria-live="polite">
              <div className="flex items-baseline justify-between font-display">
                <span className="text-xs tracking-[0.35em] text-mist">LOADING</span>
                <span className="text-2xl font-extrabold tabular-nums">
                  {pct}
                  <span className="text-mist">/100</span>
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden bg-plate">
                <div className="h-full bg-gradient-to-r from-blue via-ice to-violet shadow-[0_0_14px] shadow-blue" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
