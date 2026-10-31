'use client'

import { usePathname } from 'next/navigation'

export default function PageEnter({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return (
    <div key={path} className="page-enter">
      {children}
    </div>
  )
}
