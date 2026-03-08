'use client'

import { useResourcesStore } from '@/stores/opencompany/resources-store'
import { AlertTriangle } from 'lucide-react'

interface PoolDetailProps {
  poolId: string
}

const STATUS_BADGES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  throttled: 'bg-orange-100 text-orange-700',
  frozen: 'bg-red-100 text-red-700',
}

const OVERAGE_BADGES: Record<string, string> = {
  block: 'bg-red-100 text-red-700',
  throttle: 'bg-orange-100 text-orange-700',
  alert: 'bg-yellow-100 text-yellow-700',
  allow: 'bg-green-100 text-green-700',
}

export function PoolDetail({ poolId }: PoolDetailProps) {
  const { pools, health } = useResourcesStore()

  const pool = pools.find((p) => p.id === poolId)
  const poolHealth = health.find((h) => h.poolId === poolId)

  if (!pool) {
    return <p className="text-sm text-muted-foreground">Pool not found</p>
  }

  const quotas = Object.entries(pool.quotas || {})

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-lg font-bold">{pool.name}</h2>
          <span className={`px-2 py-0.5 rounded text-xs ${STATUS_BADGES[pool.status] || 'bg-accent'}`}>
            {pool.status}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs ${OVERAGE_BADGES[pool.overagePolicy] || 'bg-accent'}`}>
            Overage: {pool.overagePolicy}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">ID: {pool.id}</p>
        {pool.parentId && <p className="text-xs text-muted-foreground">Parent: {pool.parentId}</p>}
      </div>

      {/* Health alerts */}
      {poolHealth?.alerts && poolHealth.alerts.length > 0 && (
        <div className="space-y-1">
          {poolHealth.alerts.map((alert, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 text-xs">
              <AlertTriangle className="w-3 h-3 text-yellow-600 shrink-0" />
              <span>{alert}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quota breakdown */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Quota Usage</h3>
        {quotas.length === 0 ? (
          <p className="text-xs text-muted-foreground">No quotas configured</p>
        ) : (
          <div className="space-y-3">
            {quotas.map(([type, quota]) => {
              const pct = quota.limit > 0 ? Math.round((quota.used / quota.limit) * 100) : 0
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-muted-foreground">
                      {quota.used.toLocaleString()} / {quota.limit.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-accent overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Overall utilization */}
      {poolHealth && (
        <div className="bg-accent/30 rounded p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold">Overall Utilization</span>
            <span className="font-mono">{poolHealth.utilizationPercent}%</span>
          </div>
          <div className="w-full h-4 rounded-full bg-accent overflow-hidden">
            <div
              className={`h-full rounded-full ${
                poolHealth.utilizationPercent > 90 ? 'bg-red-500' :
                poolHealth.utilizationPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(poolHealth.utilizationPercent, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
