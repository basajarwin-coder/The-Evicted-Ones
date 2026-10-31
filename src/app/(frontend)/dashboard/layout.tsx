import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Staff Dashboard | TEO', robots: { index: false, follow: false } }

export default function DashboardRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ink">{children}</div>
}
