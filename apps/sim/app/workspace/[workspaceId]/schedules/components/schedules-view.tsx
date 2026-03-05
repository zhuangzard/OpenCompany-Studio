'use client'

import { useMemo, useState } from 'react'
import { Clock, Search } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
} from '@/components/emcn'
import { Input, Skeleton } from '@/components/ui'
import { formatAbsoluteDate, formatRelativeTime } from '@/lib/core/utils/formatting'
import { parseCronToHumanReadable } from '@/lib/workflows/schedules/utils'
import type { WorkspaceScheduleData } from '@/hooks/queries/schedules'
import { useWorkspaceSchedules } from '@/hooks/queries/schedules'
import { useDebounce } from '@/hooks/use-debounce'

function getHumanReadable(s: WorkspaceScheduleData) {
  if (s.cronExpression) return parseCronToHumanReadable(s.cronExpression, s.timezone)
  if (s.nextRunAt) return `Once at ${formatAbsoluteDate(s.nextRunAt)}`
  return 'Unknown schedule'
}

function TimestampCell({ value }: { value: string | null }) {
  if (!value) return <span>—</span>
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span>{formatRelativeTime(value)}</span>
      </Tooltip.Trigger>
      <Tooltip.Content>{formatAbsoluteDate(value)}</Tooltip.Content>
    </Tooltip.Root>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={
        status === 'active' ? 'rounded-[4px] text-[12px]' : 'rounded-[4px] text-[12px] opacity-60'
      }
    >
      {status}
    </Badge>
  )
}

function LifecycleBadge({
  lifecycle,
  runCount,
  maxRuns,
}: {
  lifecycle: string | null
  runCount: number | null
  maxRuns: number | null
}) {
  if (!lifecycle || lifecycle === 'persistent') {
    return <span className='text-[12px] text-[var(--text-muted)]'>persistent</span>
  }
  const label = maxRuns ? `${runCount ?? 0}/${maxRuns}` : `${runCount ?? 0} runs`
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span className='text-[12px] text-[var(--text-muted)]'>until_complete ({label})</span>
      </Tooltip.Trigger>
      <Tooltip.Content>Runs until success condition is met</Tooltip.Content>
    </Tooltip.Root>
  )
}

export function SchedulesView() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.workspaceId as string

  const { data: allItems = [], isLoading, error } = useWorkspaceSchedules(workspaceId)

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const { workflowSchedules, jobs } = useMemo(() => {
    const ws: WorkspaceScheduleData[] = []
    const j: WorkspaceScheduleData[] = []
    for (const item of allItems) {
      if (item.sourceType === 'job') j.push(item)
      else ws.push(item)
    }
    return { workflowSchedules: ws, jobs: j }
  }, [allItems])

  const filteredSchedules = useMemo(() => {
    if (!debouncedSearchQuery) return workflowSchedules
    const q = debouncedSearchQuery.toLowerCase()
    return workflowSchedules.filter(
      (s) =>
        s.workflowName?.toLowerCase().includes(q) || getHumanReadable(s).toLowerCase().includes(q)
    )
  }, [workflowSchedules, debouncedSearchQuery])

  const filteredJobs = useMemo(() => {
    if (!debouncedSearchQuery) return jobs
    const q = debouncedSearchQuery.toLowerCase()
    return jobs.filter(
      (j) =>
        j.jobTitle?.toLowerCase().includes(q) ||
        j.prompt?.toLowerCase().includes(q) ||
        j.sourceTaskName?.toLowerCase().includes(q) ||
        getHumanReadable(j).toLowerCase().includes(q)
    )
  }, [jobs, debouncedSearchQuery])

  return (
    <div className='flex h-full flex-1 flex-col'>
      <div className='flex flex-1 overflow-hidden'>
        <div className='flex h-full flex-1 flex-col overflow-auto bg-white px-[24px] pt-[28px] pb-[24px] dark:bg-[var(--bg)]'>
          {/* Header */}
          <div>
            <div className='flex items-start gap-[12px]'>
              <div className='flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border border-[#F59E0B] bg-[#FFFBEB] dark:border-[#B45309] dark:bg-[#451A03]'>
                <Clock className='h-[14px] w-[14px] text-[#F59E0B] dark:text-[#FBBF24]' />
              </div>
              <h1 className='font-medium text-[18px]'>Schedules</h1>
            </div>
            <p className='mt-[10px] text-[14px] text-[var(--text-tertiary)]'>
              View all scheduled workflows and jobs in your workspace.
            </p>
          </div>

          {/* Search */}
          <div className='mt-[14px] flex items-center justify-between'>
            <div className='flex h-[32px] w-[400px] items-center gap-[6px] rounded-[8px] bg-[var(--surface-4)] px-[8px]'>
              <Search className='h-[14px] w-[14px] text-[var(--text-subtle)]' />
              <Input
                placeholder='Search'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='flex-1 border-0 bg-transparent px-0 font-medium text-[var(--text-secondary)] text-small leading-none placeholder:text-[var(--text-subtle)] focus-visible:ring-0 focus-visible:ring-offset-0'
              />
            </div>
          </div>

          {/* Content */}
          <div className='mt-[24px] min-h-0 flex-1 space-y-[32px] overflow-y-auto'>
            {isLoading ? (
              <ScheduleTableSkeleton />
            ) : error ? (
              <div className='flex h-64 items-center justify-center rounded-lg border border-muted-foreground/25 bg-muted/20'>
                <p className='text-[14px] text-[var(--text-muted)]'>Failed to load schedules</p>
              </div>
            ) : (
              <>
                {/* Schedules section */}
                <section>
                  <h2 className='mb-[12px] font-medium text-[15px] text-[var(--text-secondary)]'>
                    Schedules
                  </h2>
                  {filteredSchedules.length === 0 ? (
                    <div className='flex h-32 items-center justify-center rounded-lg border border-muted-foreground/25 bg-muted/20'>
                      <p className='text-[13px] text-[var(--text-muted)]'>
                        {debouncedSearchQuery
                          ? `No schedules matching "${searchQuery}"`
                          : 'No scheduled workflows yet'}
                      </p>
                    </div>
                  ) : (
                    <Table className='table-fixed text-[14px]'>
                      <TableHeader>
                        <TableRow className='hover:bg-transparent'>
                          <TableHead className='w-[28%] px-[12px] py-[8px] text-[13px] text-[var(--text-secondary)]'>
                            Workflow
                          </TableHead>
                          <TableHead className='w-[30%] px-[12px] py-[8px] text-left text-[13px] text-[var(--text-secondary)]'>
                            Schedule
                          </TableHead>
                          <TableHead className='w-[12%] px-[12px] py-[8px] text-left text-[13px] text-[var(--text-secondary)]'>
                            Status
                          </TableHead>
                          <TableHead className='w-[15%] px-[12px] py-[8px] text-left text-[13px] text-[var(--text-secondary)]'>
                            Next Run
                          </TableHead>
                          <TableHead className='w-[15%] px-[12px] py-[8px] text-left text-[13px] text-[var(--text-secondary)]'>
                            Last Run
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSchedules.map((schedule) => (
                          <TableRow
                            key={schedule.id}
                            className='cursor-pointer hover:bg-[var(--surface-2)]'
                            onClick={() =>
                              router.push(`/workspace/${workspaceId}/w/${schedule.workflowId}`)
                            }
                          >
                            <TableCell className='px-[12px] py-[8px]'>
                              <div className='flex min-w-0 items-center gap-[8px]'>
                                <div
                                  className='h-[8px] w-[8px] flex-shrink-0 rounded-full'
                                  style={{
                                    backgroundColor: schedule.workflowColor || '#3972F6',
                                  }}
                                />
                                <span className='truncate text-[14px] text-[var(--text-primary)]'>
                                  {schedule.workflowName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className='px-[12px] py-[8px] text-[13px] text-[var(--text-muted)]'>
                              <span className='truncate'>{getHumanReadable(schedule)}</span>
                            </TableCell>
                            <TableCell className='px-[12px] py-[8px]'>
                              <StatusBadge status={schedule.status} />
                            </TableCell>
                            <TableCell className='whitespace-nowrap px-[12px] py-[8px] text-[13px] text-[var(--text-muted)]'>
                              <TimestampCell value={schedule.nextRunAt} />
                            </TableCell>
                            <TableCell className='whitespace-nowrap px-[12px] py-[8px] text-[13px] text-[var(--text-muted)]'>
                              <TimestampCell value={schedule.lastRanAt} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </section>

                {/* Jobs section */}
                <section>
                  <h2 className='mb-[12px] font-medium text-[15px] text-[var(--text-secondary)]'>
                    Jobs
                  </h2>
                  {filteredJobs.length === 0 ? (
                    <div className='flex h-32 items-center justify-center rounded-lg border border-muted-foreground/25 bg-muted/20'>
                      <p className='text-[13px] text-[var(--text-muted)]'>
                        {debouncedSearchQuery
                          ? `No jobs matching "${searchQuery}"`
                          : 'No jobs yet'}
                      </p>
                    </div>
                  ) : (
                    <Table className='table-fixed text-[14px]'>
                      <TableHeader>
                        <TableRow className='hover:bg-transparent'>
                          <TableHead className='w-[18%] px-[12px] py-[8px] text-[13px] text-[var(--text-secondary)]'>
                            Title
                          </TableHead>
                          <TableHead className='w-[22%] px-[12px] py-[8px] text-[13px] text-[var(--text-secondary)]'>
                            Prompt
                          </TableHead>
                          <TableHead className='w-[16%] px-[12px] py-[8px] text-left text-[13px] text-[var(--text-secondary)]'>
                            Schedule
                          </TableHead>
                          <TableHead className='w-[10%] px-[12px] py-[8px] text-left text-[13px] text-[var(--text-secondary)]'>
                            Status
                          </TableHead>
                          <TableHead className='w-[10%] px-[12px] py-[8px] text-left text-[13px] text-[var(--text-secondary)]'>
                            Lifecycle
                          </TableHead>
                          <TableHead className='w-[12%] px-[12px] py-[8px] text-left text-[13px] text-[var(--text-secondary)]'>
                            Next Run
                          </TableHead>
                          <TableHead className='w-[12%] px-[12px] py-[8px] text-left text-[13px] text-[var(--text-secondary)]'>
                            Last Run
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredJobs.map((job) => (
                          <TableRow key={job.id} className='hover:bg-[var(--surface-2)]'>
                            <TableCell className='px-[12px] py-[8px]'>
                              <span className='truncate text-[14px] text-[var(--text-primary)]'>
                                {job.jobTitle || '—'}
                              </span>
                            </TableCell>
                            <TableCell className='px-[12px] py-[8px]'>
                              <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                  <span className='line-clamp-1 text-[13px] text-[var(--text-muted)]'>
                                    {job.prompt}
                                  </span>
                                </Tooltip.Trigger>
                                <Tooltip.Content className='max-w-[400px]'>
                                  {job.prompt}
                                </Tooltip.Content>
                              </Tooltip.Root>
                            </TableCell>
                            <TableCell className='px-[12px] py-[8px] text-[13px] text-[var(--text-muted)]'>
                              <span className='truncate'>{getHumanReadable(job)}</span>
                            </TableCell>
                            <TableCell className='px-[12px] py-[8px]'>
                              <StatusBadge status={job.status} />
                            </TableCell>
                            <TableCell className='px-[12px] py-[8px]'>
                              <LifecycleBadge lifecycle={job.lifecycle} runCount={job.runCount} maxRuns={job.maxRuns} />
                            </TableCell>
                            <TableCell className='whitespace-nowrap px-[12px] py-[8px] text-[13px] text-[var(--text-muted)]'>
                              <TimestampCell value={job.nextRunAt} />
                            </TableCell>
                            <TableCell className='whitespace-nowrap px-[12px] py-[8px] text-[13px] text-[var(--text-muted)]'>
                              <TimestampCell value={job.lastRanAt} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ScheduleTableSkeleton() {
  return (
    <Table className='table-fixed text-[14px]'>
      <TableHeader>
        <TableRow className='hover:bg-transparent'>
          <TableHead className='w-[28%] px-[12px] py-[8px]'>
            <Skeleton className='h-[12px] w-[60px]' />
          </TableHead>
          <TableHead className='w-[30%] px-[12px] py-[8px]'>
            <Skeleton className='h-[12px] w-[56px]' />
          </TableHead>
          <TableHead className='w-[12%] px-[12px] py-[8px]'>
            <Skeleton className='h-[12px] w-[40px]' />
          </TableHead>
          <TableHead className='w-[15%] px-[12px] py-[8px]'>
            <Skeleton className='h-[12px] w-[52px]' />
          </TableHead>
          <TableHead className='w-[15%] px-[12px] py-[8px]'>
            <Skeleton className='h-[12px] w-[48px]' />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }, (_, i) => (
          <TableRow key={i} className='hover:bg-transparent'>
            <TableCell className='px-[12px] py-[8px]'>
              <div className='flex min-w-0 items-center gap-[8px]'>
                <Skeleton className='h-[8px] w-[8px] rounded-full' />
                <Skeleton className='h-[14px] w-[140px]' />
              </div>
            </TableCell>
            <TableCell className='px-[12px] py-[8px]'>
              <Skeleton className='h-[12px] w-[160px]' />
            </TableCell>
            <TableCell className='px-[12px] py-[8px]'>
              <Skeleton className='h-[12px] w-[48px]' />
            </TableCell>
            <TableCell className='px-[12px] py-[8px]'>
              <Skeleton className='h-[12px] w-[60px]' />
            </TableCell>
            <TableCell className='px-[12px] py-[8px]'>
              <Skeleton className='h-[12px] w-[60px]' />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
