import { PageHead, card } from '@/components/dashboard/server'
import { SettingsForm } from '@/components/dashboard/Small'
import { requireUser } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'

export default async function SettingsAdmin() {
  await requireUser(['owner'])
  const s = await (await getPayloadClient()).findGlobal({ slug: 'site-settings', overrideAccess: true })
  return (
    <>
      <PageHead title="Website settings" sub="Homepage text, recruitment toggle and social links." />
      <div className={`${card} p-5 sm:p-8`}><SettingsForm values={s as any} /></div>
    </>
  )
}
