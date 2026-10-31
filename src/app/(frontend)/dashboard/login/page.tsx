import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/dashboard/AuthForms'
import { getCurrentUser } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { supabaseConfigured } from '@/lib/supabase-db'

export default async function LoginPage() {
  if (!supabaseConfigured()) {
    return (
      <main className="grid min-h-screen place-items-center px-5 text-center">
        <p className="max-w-md text-mist">Connect Supabase before signing in. Add SUPABASE_URL and SUPABASE_SECRET_KEY, run supabase/schema.sql, then restart the site.</p>
      </main>
    )
  }
  if (await getCurrentUser()) redirect('/dashboard')
  const payload = await getPayloadClient()
  const { totalDocs } = await payload.count({ collection: 'users', overrideAccess: true })
  if (totalDocs === 0) redirect('/dashboard/setup')
  return (
    <main className="relative grid min-h-screen place-items-center px-5 grid-bg">
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/20 blur-[120px]" />
      <div className="relative w-full max-w-md clip-cut border border-line bg-coal/95 p-8 sm:p-10">
        <Image src="/teo-logo.png" alt="TEO" width={64} height={80} className="mx-auto" />
        <h1 className="mt-5 text-center font-display text-2xl font-extrabold uppercase">Staff sign in</h1>
        <p className="mb-8 mt-1 text-center text-sm text-mist">Authorised TEO staff only.</p>
        <LoginForm />
        <Link href="/" className="mt-6 block text-center font-display text-[11px] tracking-[0.3em] text-mist hover:text-white">← BACK TO WEBSITE</Link>
      </div>
    </main>
  )
}
