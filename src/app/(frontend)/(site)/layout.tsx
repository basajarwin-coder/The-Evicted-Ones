import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import PageEnter from '@/components/PageEnter'
import BackgroundMusic from '@/components/BackgroundMusic'
import { supabaseConfigured } from '@/lib/supabase-db'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {supabaseConfigured() ? null : (
        <p className="bg-blue/15 px-5 py-3 text-center text-sm text-ice">
          Supabase is not connected yet. Add SUPABASE_URL and SUPABASE_SECRET_KEY, then run supabase/schema.sql in the Supabase SQL editor.
        </p>
      )}
      <main>
        <PageEnter>{children}</PageEnter>
      </main>
      <SiteFooter />
      <BackgroundMusic />
    </>
  )
}
