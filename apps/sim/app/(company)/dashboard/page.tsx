'use client'

import { useEffect, useState, useCallback } from 'react'
import { CanvasView } from '../../../components/opencompany/canvas-view'
import { StatsGrid } from '../../../components/opencompany/stats-grid'
import { DepartmentPanel } from '../../../components/opencompany/department-panel'
import { BottomPanel } from '../../../components/opencompany/bottom-panel'
import { useOpenCompanySocket } from '@/hooks/use-opencompany-socket'
import { ocApi } from '@/hooks/use-opencompany-api'
import { useSOPStore } from '@/stores/opencompany/sop-store'

interface AgentInfo {
  id: string
  role: string
  name: string
  status: string
  department: string
  supervisorId: string | null
}

interface Stats {
  agents: number
  messages: number
  tasks: Record<string, number>
}

export default function DashboardPage() {
  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [tokenUsage, setTokenUsage] = useState(0)
  const [budgetUsed, setBudgetUsed] = useState(0)
  const [bottomCollapsed, setBottomCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const { connectionStatus } = useOpenCompanySocket()
  const violations = useSOPStore((s) => s.violations)

  const fetchData = useCallback(async () => {
    try {
      const [agentsRes, statsRes] = await Promise.all([
        ocApi.get<{ agents: AgentInfo[] }>('/api/agents'),
        ocApi.get<Stats>('/api/stats'),
      ])
      setAgents(agentsRes.agents || [])
      setStats(statsRes)

      // Fetch resource metrics (non-blocking)
      try {
        const health = await ocApi.get<{ health: Array<{ utilizationPercent: number }> }>('/api/resources/health')
        if (health.health?.length > 0) {
          const avg = health.health.reduce((s, h) => s + (h.utilizationPercent || 0), 0) / health.health.length
          setBudgetUsed(Math.round(avg))
        }
      } catch { /* resources not available */ }

      try {
        const usage = await ocApi.get<{ totalTokens?: number }>('/api/metrics/activity')
        setTokenUsage(usage.totalTokens ?? 0)
      } catch { /* metrics not available */ }
    } catch {
      // Backend not available
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Connecting to OpenCompany...</p>
      </div>
    )
  }

  const runningTasks = stats?.tasks
    ? Object.entries(stats.tasks)
        .filter(([s]) => s === 'in_progress' || s === 'assigned')
        .reduce((sum, [, c]) => sum + c, 0)
    : 0

  const statusColor = connectionStatus === 'connected' ? 'bg-green-500'
    : connectionStatus === 'connecting' ? 'bg-yellow-500'
    : 'bg-red-500'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-3 flex items-center justify-between bg-card">
        <h1 className="text-lg font-bold">OpenCompany Control Center</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
            <span className="text-xs text-muted-foreground capitalize">{connectionStatus}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {agents.length} agents &middot; {stats?.messages ?? 0} messages
          </span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-6 py-4 border-b bg-background">
        <StatsGrid
          stats={{
            activeAgents: agents.filter((a) => a.status !== 'offline').length,
            runningTasks,
            todayMessages: stats?.messages ?? 0,
            sopViolations: violations.length,
            tokenUsage,
            budgetUsed,
          }}
        />
      </div>

      {/* Main content: sidebar + canvas */}
      <div className="flex flex-1 overflow-hidden">
        <DepartmentPanel agents={agents} />
        <CanvasView agents={agents} />
      </div>

      {/* Bottom panel */}
      <BottomPanel
        collapsed={bottomCollapsed}
        onToggle={() => setBottomCollapsed(!bottomCollapsed)}
      />
    </div>
  )
}
