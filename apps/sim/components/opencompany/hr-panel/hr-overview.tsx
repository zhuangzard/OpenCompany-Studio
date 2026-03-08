'use client'

import { useEffect, useState } from 'react'
import { Shield, AlertTriangle, TrendingUp, TrendingDown, Eye } from 'lucide-react'
import { ocApi } from '@/hooks/use-opencompany-api'

interface HRStats {
  totalViolations: number
  bySeverity: Record<string, number>
  avgScore: number
}

export function HROverview() {
  const [stats, setStats] = useState<HRStats | null>(null)

  useEffect(() => {
    ocApi.get<HRStats>('/api/hr/overview')
      .then(setStats)
      .catch(() => {})
  }, [])

  if (!stats) {
    return <p className="text-xs text-muted-foreground p-4">Loading HR overview...</p>
  }

  const trend = stats.avgScore >= 80 ? 'improving' : stats.avgScore >= 50 ? 'stable' : 'declining'
  const TrendIcon = trend === 'declining' ? TrendingDown : TrendingUp

  const cards = [
    { label: 'Total Violations', value: stats.totalViolations, icon: AlertTriangle, color: stats.totalViolations > 0 ? 'text-amber-500' : 'text-green-500' },
    { label: 'Critical', value: stats.bySeverity.critical ?? 0, icon: Shield, color: (stats.bySeverity.critical ?? 0) > 0 ? 'text-red-500' : 'text-green-500' },
    { label: 'Avg Score', value: Math.round(stats.avgScore), icon: TrendingUp, color: stats.avgScore >= 80 ? 'text-green-500' : stats.avgScore >= 50 ? 'text-amber-500' : 'text-red-500' },
    { label: 'Trend', value: trend, icon: TrendIcon, color: trend === 'improving' ? 'text-green-500' : trend === 'stable' ? 'text-blue-500' : 'text-red-500' },
  ]

  return (
    <div className="grid grid-cols-4 gap-3 p-4">
      {cards.map((card) => (
        <div key={card.label} className="border rounded-lg p-3 bg-card">
          <div className="flex items-center gap-2 mb-1">
            <card.icon className={`w-4 h-4 ${card.color}`} />
            <span className="text-xs text-muted-foreground">{card.label}</span>
          </div>
          <div className={`text-xl font-bold ${card.color} capitalize`}>{card.value}</div>
        </div>
      ))}
    </div>
  )
}
