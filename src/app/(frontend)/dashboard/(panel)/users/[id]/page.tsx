import { EntityEditPage } from '@/components/dashboard/server'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EntityEditPage entity="users" id={(await params).id} />
}
