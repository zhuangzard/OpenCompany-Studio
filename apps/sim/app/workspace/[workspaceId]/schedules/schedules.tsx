'use client'

import { Calendar } from 'lucide-react'
import { ScheduleList } from '@/app/workspace/[workspaceId]/schedules/components'

export function Schedules() {
  return (
    <div className='flex h-full flex-1 flex-col'>
      <div className='flex flex-1 overflow-hidden'>
        <div className='flex flex-1 flex-col overflow-auto bg-white px-[24px] pt-[28px] pb-[24px] dark:bg-[var(--bg)]'>
          {/* Header */}
          <div>
            <div className='flex items-start gap-[12px]'>
              <div className='flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border border-[#F59E0B] bg-[#FFFBEB] dark:border-[#B45309] dark:bg-[#451A03]'>
                <Calendar className='h-[14px] w-[14px] text-[#F59E0B] dark:text-[#FBBF24]' />
              </div>
              <h1 className='font-medium text-[18px]'>Schedules</h1>
            </div>
            <p className='mt-[10px] text-[14px] text-[var(--text-tertiary)]'>
              View all scheduled workflows and jobs in your workspace.
            </p>
          </div>

          <ScheduleList />
        </div>
      </div>
    </div>
  )
}
