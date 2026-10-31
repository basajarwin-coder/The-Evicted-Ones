import { EntityEditPage } from '@/components/dashboard/server'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EntityEditPage entity="scrims" id={(await params).id} />
}
