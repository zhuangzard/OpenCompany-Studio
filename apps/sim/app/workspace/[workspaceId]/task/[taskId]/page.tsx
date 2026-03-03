import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { verifyWorkspaceMembership } from '@/app/api/workflows/utils'
import { Home } from '@/app/workspace/[workspaceId]/home/home'

interface TaskPageProps {
  params: Promise<{
    workspaceId: string
    taskId: string
  }>
  searchParams: Promise<{
    sid?: string
    m?: string
  }>
}

export default async function TaskPage({ params, searchParams }: TaskPageProps) {
  const { workspaceId, taskId } = await params
  const session = await getSession()

  if (!session?.user?.id) {
    redirect('/')
  }

  const hasPermission = await verifyWorkspaceMembership(session.user.id, workspaceId)
  if (!hasPermission) {
    redirect('/')
  }

  if (taskId === 'new') {
    const { sid } = await searchParams
    return <Home streamId={sid} />
  }

  return <Home chatId={taskId} />
}
