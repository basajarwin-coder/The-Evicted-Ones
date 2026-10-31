import { EntityEditPage } from '@/components/dashboard/server'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EntityEditPage entity="achievements" id={(await params).id} />
}
