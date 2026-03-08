'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, AlertTriangle, Info, Zap } from 'lucide-react'

interface Violation {
  id: string
  timestamp: string
  agentRole: string
  ruleId: string
  ruleName: string
  severity: 'info' | 'warning' | 'critical' | 'emergency'
  description: string
  action: { type: string; executed: boolean; result?: string }
}

const SEVERITY_STYLES: Record<string, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  critical: { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
  emergency: { icon: Zap, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
}

interface ViolationLogProps {
  apiUrl: string
}

export function ViolationLog({ apiUrl }: ViolationLogProps) {
  const [violations, setViolations] = useState<Violation[]>([])

  useEffect(() => {
    fetch(`${apiUrl}/api/hr/violations?limit=50`)
      .then((r) => r.json())
      .then((d) => setViolations(d.violations || []))
      .catch(() => {})
  }, [apiUrl])

  return (
    <div className="space-y-1 text-xs">
      {violations.map((v) => {
        const style = SEVERITY_STYLES[v.severity] ?? SEVERITY_STYLES.info
        const Icon = style.icon
        return (
          <div key={v.id} className={`flex items-center gap-2 px-3 py-2 rounded ${style.bg}`}>
            <Icon className={`w-3.5 h-3.5 shrink-0 ${style.color}`} />
            <span className="font-mono w-16 shrink-0">{v.ruleId}</span>
            <span className="font-medium w-20 shrink-0">{v.agentRole}</span>
            <span className="truncate flex-1">{v.description}</span>
            <span className="text-muted-foreground shrink-0">
              {v.action.executed ? 'Done' : 'Pending'}
            </span>
          </div>
        )
      })}
      {violations.length === 0 && (
        <p className="text-muted-foreground px-3 py-4 text-center">No violations recorded</p>
      )}
    </div>
  )
}
