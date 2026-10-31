import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHero } from '@/components/ui'
import { CLAN_FACEBOOK } from '@/lib/clan'

export const metadata: Metadata = { title: 'Join TEO | TEO – The Evicted Ones' }

const steps = [
  ['01', 'Message the clan page', 'Send a PM on the TEO Facebook page. Include your CODM IGN and say you want to join.'],
  ['02', 'Wait for the announcement', 'Recruitment is posted on that Facebook page when the clan needs members. A message does not add you to the roster.'],
  ['03', 'Staff adds you later', 'Only TEO staff can put a player on the site after you are accepted. This page never creates a member.'],
]

export function JoinSection() {
  return (
    <>
      <PageHero eyebrow="RECRUITMENT" title="Join TEO">There is no application form. Talk to the clan on Facebook, then wait for a recruitment post.</PageHero>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="clip-cut border border-line bg-coal p-5 sm:p-12">
          <p className="font-display text-xs font-semibold tracking-[0.4em] text-blue">HOW TO JOIN</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold uppercase">PM the clan page</h2>
          <ol className="mt-8 space-y-6">
            {steps.map(([n, title, copy]) => (
              <li key={n} className="grid grid-cols-[auto_1fr] gap-4">
                <span className="font-display text-2xl font-extrabold text-ice">{n}</span>
                <div>
                  <p className="font-display text-lg font-bold uppercase">{title}</p>
                  <p className="mt-1 text-mist">{copy}</p>
                </div>
              </li>
            ))}
          </ol>
          <a href={CLAN_FACEBOOK} target="_blank" rel="noopener noreferrer" className="mt-10 inline-block w-full bg-blue px-5 py-4 text-center font-display text-xs font-bold tracking-[0.16em] text-white transition hover:bg-ice hover:text-ink clip-cut-sm sm:w-auto sm:px-8 sm:text-sm sm:tracking-[0.25em]">
            MESSAGE THE FB PAGE
          </a>
        </div>
        <aside className="self-start border border-line bg-ink p-8">
          <p className="font-display text-xs font-semibold tracking-[0.35em] text-blue">CLAN FACEBOOK</p>
          <p className="mt-4 font-display text-2xl font-extrabold uppercase">The Evicted Ones</p>
          <p className="mt-3 text-sm text-mist">Watch this page for recruitment announcements. Do not expect an automatic add.</p>
          <a href={CLAN_FACEBOOK} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block font-display text-xs tracking-[0.22em] text-ice hover:text-white">
            facebook.com/TEO →
          </a>
        </aside>
      </section>
    </>
  )
}

export default function JoinPage() {
  redirect('/#join')
}
