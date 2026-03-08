'use client'

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'panel' | 'inline'
  count?: number
}

export function LoadingSkeleton({ variant = 'card', count = 3 }: LoadingSkeletonProps) {
  if (variant === 'inline') {
    return <div className="h-4 w-24 rounded bg-accent animate-pulse" />
  }

  if (variant === 'table') {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-accent/50 px-3 py-2 flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-3 w-20 rounded bg-accent animate-pulse" />
          ))}
        </div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="px-3 py-3 border-t flex gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-3 w-16 rounded bg-accent animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'panel') {
    return (
      <div className="p-4 space-y-3">
        <div className="h-5 w-32 rounded bg-accent animate-pulse" />
        <div className="h-3 w-full rounded bg-accent animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-accent animate-pulse" />
        <div className="h-20 w-full rounded bg-accent animate-pulse" />
      </div>
    )
  }

  // card variant
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 bg-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded bg-accent animate-pulse" />
            <div className="h-6 w-8 rounded bg-accent animate-pulse" />
          </div>
          <div className="h-2 w-full rounded-full bg-accent animate-pulse" />
          <div className="flex gap-2">
            <div className="h-3 w-16 rounded bg-accent animate-pulse" />
            <div className="h-3 w-12 rounded bg-accent animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface EmptyStateProps {
  message: string
  description?: string
}

export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="border rounded-lg p-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  )
}
