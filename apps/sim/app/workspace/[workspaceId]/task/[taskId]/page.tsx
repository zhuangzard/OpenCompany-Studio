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
  const { taskId } = await params

  if (taskId === 'new') {
    const { sid, m } = await searchParams
    return <Home streamId={sid} initialMessage={m} />
  }

  return <Home chatId={taskId} />
}
