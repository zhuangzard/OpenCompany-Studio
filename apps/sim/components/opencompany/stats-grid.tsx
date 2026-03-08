'use client'

import { Users, Play, MessageSquare, ShieldAlert, Coins, PieChart, TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'

interface StatCard {
  label: string
  value: number | string
  icon: LucideIcon
  warning?: boolean
  trend?: 'up' | 'down' | 'flat'
}

interface StatsGridProps {
  stats: {
    activeAgents: number
    runningTasks: number
    todayMessages: number
    sopViolations: number
    tokenUsage: number
    budgetUsed: number
  }
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function StatsGrid({ stats }: StatsGridProps) {
  const cards: StatCard[] = [
    { label: 'Active Agents', value: stats.activeAgents, icon: Users },
    { label: 'Running Tasks', value: stats.runningTasks, icon: Play },
    { label: 'Today Messages', value: stats.todayMessages, icon: MessageSquare },
    { label: 'SOP Violations', value: stats.sopViolations, icon: ShieldAlert, warning: stats.sopViolations > 0 },
    { label: 'Token Usage', value: formatTokens(stats.tokenUsage), icon: Coins },
    { label: 'Budget Used', value: `${stats.budgetUsed}%`, icon: PieChart, warning: stats.budgetUsed > 90 },
  ]

  return (
    <div className="oc-stats-grid">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`oc-stat-card ${card.warning ? 'warning' : ''}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{card.label}</span>
          </div>
          <div className={`text-2xl font-bold ${card.warning ? 'oc-stat-value text-red-500' : ''}`}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  )
}
