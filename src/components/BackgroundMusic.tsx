'use client'

import { useEffect, useRef, useState } from 'react'

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.loop = true

    const unlock = () => {
      audio.volume = 0
      audio.play().catch(() => {})
    }
    const start = () => {
      audio.loop = true
      audio.currentTime = 0
      audio.volume = 0.55
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
      setVisible(true)
    }

    if (sessionStorage.getItem('teo-entered')) setVisible(true)
    window.addEventListener('teo-unlock', unlock)
    window.addEventListener('teo-start', start)
    return () => {
      window.removeEventListener('teo-unlock', unlock)
      window.removeEventListener('teo-start', start)
    }
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }
    audio.loop = true
    audio.volume = 0.55
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }

  return (
    <>
      <audio ref={audioRef} src="/music/CODM.mp3" preload="auto" loop />
      {visible ? (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing ? 'Mute music' : 'Play music'}
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-[80] grid h-12 w-12 place-items-center rounded-full border-2 border-blue bg-ink/80 text-ice shadow-[0_0_18px_rgba(47,140,255,0.45)] backdrop-blur transition hover:bg-blue hover:text-white"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M4 9v6h3.2L12 19.2V4.8L7.2 9H4zm9.5 1.2a3.2 3.2 0 0 1 0 3.6l1.3 1a5 5 0 0 0 0-5.6l-1.3 1zm2.6-2.4a6.4 6.4 0 0 1 0 8.4l1.3 1a8.2 8.2 0 0 0 0-10.4l-1.3 1z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M4 9v6h3.2L12 19.2V4.8L7.2 9H4zm13.1 3 2.2-2.2-1.1-1.1L16 10.9l-2.2-2.2-1.1 1.1L14.9 12l-2.2 2.2 1.1 1.1L16 13.1l2.2 2.2 1.1-1.1L17.1 12z" />
            </svg>
          )}
        </button>
      ) : null}
    </>
  )
}
