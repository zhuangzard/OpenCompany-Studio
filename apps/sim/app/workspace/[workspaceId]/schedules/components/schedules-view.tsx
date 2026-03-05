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
import { useWorkspaceSchedules } from '@/hooks/queries/schedules'
import { useDebounce } from '@/hooks/use-debounce'

export function SchedulesView() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.workspaceId as string

  const { data: schedules = [], isLoading, error } = useWorkspaceSchedules(workspaceId)

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const filteredSchedules = useMemo(() => {
    if (!debouncedSearchQuery) return schedules

    const query = debouncedSearchQuery.toLowerCase()
    return schedules.filter((s) => {
      const humanReadable = s.cronExpression
        ? parseCronToHumanReadable(s.cronExpression, s.timezone)
        : ''
      return (
        s.workflowName.toLowerCase().includes(query) || humanReadable.toLowerCase().includes(query)
      )
    })
  }, [schedules, debouncedSearchQuery])

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
              View all scheduled workflows in your workspace.
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
          <div className='mt-[24px] min-h-0 flex-1 overflow-y-auto'>
            {isLoading ? (
              <ScheduleTableSkeleton />
            ) : error ? (
              <div className='flex h-64 items-center justify-center rounded-lg border border-muted-foreground/25 bg-muted/20'>
                <p className='text-[14px] text-[var(--text-muted)]'>Failed to load schedules</p>
              </div>
            ) : schedules.length === 0 ? (
              <div className='flex h-64 items-center justify-center rounded-lg border border-muted-foreground/25 bg-muted/20'>
                <div className='text-center'>
                  <h3 className='font-medium text-[14px] text-[var(--text-secondary)]'>
                    No scheduled workflows
                  </h3>
                  <p className='mt-[4px] text-[13px] text-[var(--text-muted)]'>
                    Deploy a workflow with a schedule block to see it here.
                  </p>
                </div>
              </div>
            ) : filteredSchedules.length === 0 ? (
              <div className='py-[16px] text-center text-[14px] text-[var(--text-muted)]'>
                No schedules found matching &quot;{searchQuery}&quot;
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
                  {filteredSchedules.map((schedule) => {
                    const humanReadable = schedule.cronExpression
                      ? parseCronToHumanReadable(schedule.cronExpression, schedule.timezone)
                      : 'Unknown schedule'

                    return (
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
                              style={{ backgroundColor: schedule.workflowColor || '#3972F6' }}
                            />
                            <span className='truncate text-[14px] text-[var(--text-primary)]'>
                              {schedule.workflowName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className='px-[12px] py-[8px] text-[13px] text-[var(--text-muted)]'>
                          <span className='truncate'>{humanReadable}</span>
                        </TableCell>
                        <TableCell className='px-[12px] py-[8px]'>
                          <Badge
                            className={
                              schedule.status === 'active'
                                ? 'rounded-[4px] text-[12px]'
                                : 'rounded-[4px] text-[12px] opacity-60'
                            }
                          >
                            {schedule.status}
                          </Badge>
                        </TableCell>
                        <TableCell className='whitespace-nowrap px-[12px] py-[8px] text-[13px] text-[var(--text-muted)]'>
                          {schedule.nextRunAt ? (
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <span>{formatRelativeTime(schedule.nextRunAt)}</span>
                              </Tooltip.Trigger>
                              <Tooltip.Content>
                                {formatAbsoluteDate(schedule.nextRunAt)}
                              </Tooltip.Content>
                            </Tooltip.Root>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className='whitespace-nowrap px-[12px] py-[8px] text-[13px] text-[var(--text-muted)]'>
                          {schedule.lastRanAt ? (
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <span>{formatRelativeTime(schedule.lastRanAt)}</span>
                              </Tooltip.Trigger>
                              <Tooltip.Content>
                                {formatAbsoluteDate(schedule.lastRanAt)}
                              </Tooltip.Content>
                            </Tooltip.Root>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
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
