import Image from 'next/image'
import Splash from '@/components/Splash'
import { getSettings } from '@/lib/data'
import { CLAN_ESTABLISHED, CLAN_LINE, CLAN_REBORN, CLAN_TIKTOK_NAME } from '@/lib/clan'
import { MembersSection, TeamsSection } from './members/page'
import { ManagementSection } from './management/page'
import { ResultsSection } from './results/page'
import { GallerySection } from './gallery/page'
import { NewsSection } from './news/page'
import { SocialsSection } from './socials/page'
import { JoinSection } from './join/page'

export default async function HomePage() {
  const settings = await getSettings()

  return (
    <>
      <Splash />

      {/* HERO */}
      <section id="members" className="sheet">
      <div className="relative isolate overflow-hidden pt-20 lg:flex lg:min-h-screen lg:items-center">
        <div className="absolute inset-0 -z-10 grid-bg" />
        <div className="absolute -left-40 top-10 -z-10 h-[560px] w-[560px] rounded-full bg-blue/20 blur-[150px]" />
        <div className="absolute -right-32 bottom-0 -z-10 h-[480px] w-[480px] rounded-full bg-violet/20 blur-[150px]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />
        <div className="absolute right-[-8%] top-1/2 -z-10 hidden h-[140%] w-[34%] -translate-y-1/2 -skew-x-12 border-l border-blue/20 bg-gradient-to-b from-blue/10 to-transparent lg:block" />
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_5.25rem] items-center gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1.2fr)_10rem] sm:gap-8 sm:px-8 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <div>
            <p className="font-display text-[10px] font-semibold tracking-[0.14em] text-blue animate-rise sm:text-xs sm:tracking-[0.45em]">CALL OF DUTY: MOBILE · ESPORTS CLAN</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.95] animate-rise sm:mt-5 sm:text-7xl lg:text-8xl" style={{ animationDelay: '0.1s' }}>
              <span className="text-gradient">TEO</span>
              <span className="mt-2 block text-base font-bold tracking-[0.06em] text-white sm:text-4xl sm:tracking-[0.12em]">The Evicted Ones</span>
            </h1>
            <p className="mt-4 max-w-xl font-display text-sm font-medium tracking-normal text-ice animate-rise sm:mt-6 sm:text-xl" style={{ animationDelay: '0.2s' }}>{CLAN_LINE}</p>
            <p className="mt-3 max-w-xl text-sm text-mist animate-rise sm:mt-6 sm:text-lg" style={{ animationDelay: '0.3s' }}>{settings.intro || 'TEO is a competitive Call of Duty: Mobile clan built on discipline, teamwork and relentless practice.'}</p>
            <div className="mt-6 flex flex-col gap-3 animate-rise sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-4" style={{ animationDelay: '0.4s' }}>
              <a href="#roster" className="bg-blue px-5 py-4 text-center font-display text-xs font-bold tracking-[0.18em] text-white transition hover:bg-ice hover:text-ink clip-cut-sm sm:px-8 sm:text-sm sm:tracking-[0.25em]">MEET ALL MEMBERS</a>
              <a href="#management" className="border border-line bg-coal/60 px-5 py-4 text-center font-display text-xs font-bold tracking-[0.18em] transition hover:border-blue clip-cut-sm sm:px-8 sm:text-sm sm:tracking-[0.25em]">MANAGEMENT</a>
            </div>
          </div>
          <div className="relative flex w-full justify-end lg:max-w-md lg:justify-center">
            <div className="absolute inset-8 rounded-full bg-blue/30 blur-[90px]" />
            <Image src="/teo-logo.png" alt="TEO – The Evicted Ones crest" width={420} height={520} priority className="relative h-auto w-full max-w-full animate-float drop-shadow-[0_0_60px_rgba(47,140,255,0.45)]" />
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <section className="border-y border-line bg-ink">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
            <div className="flex flex-col justify-between border-b border-line px-5 py-8 sm:px-10 sm:py-14 xl:sticky xl:top-0 xl:min-h-screen xl:border-r xl:border-b-0 xl:py-24">
            <p className="font-display text-xs font-semibold tracking-[0.28em] text-blue sm:tracking-[0.35em]">00 / ABOUT US</p>
            <div>
              <h2 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.9] sm:mt-10 sm:text-6xl xl:mt-0 xl:text-7xl">A clan with its feet down.</h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-white/80">We are TEO. The Evicted Ones. Established in {CLAN_ESTABLISHED}. Reborn in {CLAN_REBORN}. A Call of Duty: Mobile clan that stays grounded, scrims honestly, and keeps the longer vision alive.</p>
              <p className="mt-4 font-display text-sm tracking-[0.18em] text-ice">Est. {CLAN_ESTABLISHED} · Reborn {CLAN_REBORN}</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="#roster" className="inline-block bg-blue px-5 py-4 text-center font-display text-xs font-bold tracking-[0.16em] text-white transition hover:bg-ice hover:text-ink sm:px-8 sm:text-sm sm:tracking-[0.22em]">MEET ALL MEMBERS</a>
                <a href="#socials" className="inline-block border border-line px-5 py-4 text-center font-display text-xs font-bold tracking-[0.16em] transition hover:border-blue sm:px-8 sm:text-sm sm:tracking-[0.22em]">SOCIALS</a>
              </div>
            </div>
          </div>
          <div className="space-y-8 px-5 py-8 sm:space-y-12 sm:px-10 sm:py-14 lg:py-24">
            <div>
              <h3 className="font-display text-lg font-bold tracking-[0.12em]">OUR BEGINNINGS</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-mist">Established in {CLAN_ESTABLISHED}. Reborn in {CLAN_REBORN}. TEO started as players who wanted a clan with a clear standard. Show up. Scrim for real. Get better in public. The name stayed: {CLAN_TIKTOK_NAME}.</p>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold tracking-[0.12em]">WHAT WE BUILD</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-mist">A roster with a place for every role. Scrim results that match what happened. Photos, announcements, and a management line you can actually see. Members are added by staff, not by a form.</p>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold tracking-[0.12em]">OUR IDENTITY</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-mist">The clan runs on discipline and a shared name. Every player keeps their own voice. The standard is the same: feet on the ground, eyes still up.</p>
            </div>
            <p className="font-display text-sm font-semibold tracking-[0.08em] text-blue">{CLAN_LINE}</p>
          </div>
        </div>
      </section>
      <div id="roster" className="sheet">
        <MembersSection />
      </div>
      </section>
      <section id="teams" className="sheet"><TeamsSection /></section>
      <section id="management" className="sheet"><ManagementSection /></section>
      <section id="results" className="sheet"><ResultsSection /></section>
      <section id="gallery" className="sheet"><GallerySection /></section>
      <section id="news" className="sheet"><NewsSection /></section>
      <section id="socials" className="sheet"><SocialsSection /></section>
      <section id="join" className="sheet"><JoinSection /></section>
    </>
  )
}
