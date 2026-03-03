import { Loader2 } from 'lucide-react'

export default function TaskLoading() {
  return (
    <div className='flex h-full bg-[#FCFCFC] dark:bg-[var(--surface-2)]'>
      <div className='flex h-full min-w-0 flex-1 flex-col'>
        <div className='min-h-0 flex-1 overflow-y-auto px-[16px] py-[16px]'>
          <div className='mx-auto max-w-[768px] space-y-[16px]'>
            <div className='flex items-center gap-[8px] py-[8px] text-[13px] text-[var(--text-tertiary)]'>
              <Loader2 className='h-[14px] w-[14px] animate-spin' />
              Thinking...
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
