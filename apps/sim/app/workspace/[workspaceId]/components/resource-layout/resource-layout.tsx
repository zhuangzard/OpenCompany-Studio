'use client'

import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/core/utils/cn'

interface ResourceLayoutProps {
  children: ReactNode
  onContextMenu?: (e: React.MouseEvent) => void
}

/**
 * Shared wrapper for resource list pages (tables, files, knowledge, schedules).
 * Provides consistent padding, background, and scroll behaviour.
 */
export function ResourceLayout({ children, onContextMenu }: ResourceLayoutProps) {
  return (
    <div className='flex h-full flex-1 flex-col'>
      <div className='flex flex-1 overflow-hidden'>
        <div
          className='flex flex-1 flex-col overflow-auto bg-white px-6 pt-7 pb-6 dark:bg-[var(--bg)]'
          onContextMenu={onContextMenu}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

interface ResourceIconBadgeProps {
  icon: React.ElementType
  borderClassName: string
  bgClassName: string
  iconClassName: string
}

/**
 * Coloured icon badge used in the resource header (26 x 26 rounded square).
 */
export function ResourceIconBadge({
  icon: Icon,
  borderClassName,
  bgClassName,
  iconClassName,
}: ResourceIconBadgeProps) {
  return (
    <div
      className={cn(
        'flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border',
        borderClassName,
        bgClassName
      )}
    >
      <Icon className={cn('h-[14px] w-[14px]', iconClassName)} />
    </div>
  )
}

interface ResourceHeaderProps {
  icon: ReactNode
  title: string
  action?: ReactNode
}

/**
 * Row 1 of the resource page: icon + title on the left, primary action on the right.
 */
export function ResourceHeader({ icon, title, action }: ResourceHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        {icon}
        <h1 className='font-medium text-[18px] leading-none'>{title}</h1>
      </div>
      {action && <div className='flex items-center gap-2'>{action}</div>}
    </div>
  )
}

interface ResourceToolbarProps {
  children?: ReactNode
  actions?: ReactNode
}

/**
 * Row 2 of the resource page: filter / sort controls on the left, secondary actions on the right.
 */
export function ResourceToolbar({ children, actions }: ResourceToolbarProps) {
  return (
    <div className='mt-3.5 flex items-center justify-between'>
      <div className='flex items-center gap-2'>{children}</div>
      {actions && <div className='flex items-center gap-2'>{actions}</div>}
    </div>
  )
}

interface ResourceSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * Inline search input used inside `ResourceToolbar`.
 */
export function ResourceSearch({
  value,
  onChange,
  placeholder = 'Search',
  disabled,
  className,
}: ResourceSearchProps) {
  return (
    <div
      className={cn(
        'flex h-8 w-60 items-center gap-1.5 rounded-lg bg-[var(--surface-4)] px-2',
        disabled && 'opacity-50',
        className
      )}
    >
      <Search className='h-3.5 w-3.5 text-[var(--text-subtle)]' />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className='flex-1 border-0 bg-transparent px-0 font-medium text-[var(--text-secondary)] text-small leading-none placeholder:text-[var(--text-subtle)] focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-100'
      />
    </div>
  )
}

interface ResourceContentProps {
  children: ReactNode
  className?: string
}

/**
 * Scrollable content area below the toolbar. Holds the list/table.
 */
export function ResourceContent({ children, className }: ResourceContentProps) {
  return <div className={cn('mt-4 min-h-0 flex-1', className)}>{children}</div>
}

interface ResourceEmptyStateProps {
  title: string
  description?: string
}

/**
 * Centred empty state used when there are no items.
 */
export function ResourceEmptyState({ title, description }: ResourceEmptyStateProps) {
  return (
    <div className='flex h-64 items-center justify-center'>
      <div className='text-center'>
        <p className='font-medium text-[var(--text-secondary)] text-sm'>{title}</p>
        {description && <p className='mt-1 text-[var(--text-muted)] text-xs'>{description}</p>}
      </div>
    </div>
  )
}
