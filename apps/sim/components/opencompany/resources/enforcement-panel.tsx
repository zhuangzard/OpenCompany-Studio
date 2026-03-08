'use client'

import { useEffect, useState } from 'react'
import { Shield, AlertTriangle, Play } from 'lucide-react'
import { useResourcesStore } from '@/stores/opencompany/resources-store'
import { ocApi } from '@/hooks/use-opencompany-api'

interface EnforcementAction {
  poolId: string
  action: string
  reason: string
}

const LEVEL_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  normal: { bg: 'bg-green-100', text: 'text-green-700', label: 'Normal' },
  warn: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Warning' },
  throttle: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Throttled' },
  freeze: { bg: 'bg-red-100', text: 'text-red-700', label: 'Frozen' },
}

export function EnforcementPanel() {
  const { alerts, fetchAlerts } = useResourcesStore()
  const [enforcing, setEnforcing] = useState(false)
  const [actions, setActions] = useState<EnforcementAction[]>([])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const handleEnforce = async () => {
    setEnforcing(true)
    try {
      const result = await ocApi.post<{ actions: EnforcementAction[] }>('/api/accounting/enforce', {})
      setActions(result.actions || [])
      fetchAlerts()
    } finally {
      setEnforcing(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <h3 className="text-sm font-semibold">Budget Enforcement</h3>
        </div>
        <button
          onClick={handleEnforce}
          disabled={enforcing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-500 text-white text-xs hover:bg-orange-600 disabled:opacity-50"
        >
          <Play className="w-3 h-3" /> {enforcing ? 'Enforcing...' : 'Enforce All'}
        </button>
      </div>

      {/* Active alerts */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">Active Alerts</h4>
        {alerts.length === 0 ? (
          <div className="border rounded-md p-6 text-center">
            <p className="text-sm text-muted-foreground">No budget alerts</p>
            <p className="text-xs text-muted-foreground mt-1">All pools within normal limits</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, i) => {
              const level = LEVEL_COLORS[alert.level] || LEVEL_COLORS.normal
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-md border ${level.bg}`}>
                  <AlertTriangle className={`w-4 h-4 ${level.text} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono">{alert.poolId}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${level.bg} ${level.text} font-medium`}>
                        {level.label}
                      </span>
                    </div>
                    <p className="text-xs">{alert.message}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Degradation chain */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">Degradation Chain</h4>
        <div className="flex items-center gap-1 text-xs">
          {(['normal', 'warn', 'throttle', 'freeze'] as const).map((level, i) => {
            const config = LEVEL_COLORS[level]
            const hasAlert = alerts.some((a) => a.level === level)
            return (
              <div key={level} className="flex items-center">
                {i > 0 && <span className="text-muted-foreground mx-1">→</span>}
                <span className={`px-2 py-1 rounded ${config.bg} ${config.text} ${hasAlert ? 'ring-2 ring-offset-1 ring-current font-bold' : ''}`}>
                  {config.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Enforcement actions (if any) */}
      {actions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Last Enforcement Actions</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-accent/50 text-left text-muted-foreground">
                  <th className="px-3 py-2">Pool</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((a, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2 font-mono">{a.poolId}</td>
                    <td className="px-3 py-2 capitalize">{a.action}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
