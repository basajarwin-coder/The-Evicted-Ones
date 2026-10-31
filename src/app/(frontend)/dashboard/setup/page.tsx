import Image from 'next/image'
import { redirect } from 'next/navigation'
import { SetupForm } from '@/components/dashboard/AuthForms'
import { getPayloadClient } from '@/lib/payload'
import { supabaseConfigured } from '@/lib/supabase-db'

export const dynamic = 'force-dynamic'

export default async function SetupPage() {
  if (!supabaseConfigured()) redirect('/dashboard/login')
  const payload = await getPayloadClient()
  const { totalDocs } = await payload.count({ collection: 'users', overrideAccess: true })
  if (totalDocs > 0) redirect('/dashboard/login')
  return (
    <main className="relative grid min-h-screen place-items-center px-5 grid-bg">
      <div className="relative w-full max-w-md clip-cut border border-line bg-coal/95 p-8 sm:p-10">
        <Image src="/teo-logo.png" alt="TEO" width={64} height={80} className="mx-auto" />
        <h1 className="mt-5 text-center font-display text-2xl font-extrabold uppercase">Create the owner account</h1>
        <p className="mb-8 mt-1 text-center text-sm text-mist">First-time setup. This page locks permanently once an account exists — complete it before sharing the site.</p>
        <SetupForm />
      </div>
    </main>
  )
}
