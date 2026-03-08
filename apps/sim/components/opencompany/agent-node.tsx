'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'

export interface AgentNodeData {
  role: string
  status: 'idle' | 'working' | 'reviewing' | 'blocked' | 'offline'
  currentTask?: { id: string; title: string; progress: number }
  messageStats: { sent: number; received: number; today: number }
  department: string
}

const ROLE_COLORS: Record<string, string> = {
  ceo: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30',
  director: 'border-violet-500 bg-violet-50 dark:bg-violet-950/30',
  engineer: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
  reviewer: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
  research: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30',
  hr: 'border-rose-500 bg-rose-50 dark:bg-rose-950/30',
  finance: 'border-teal-500 bg-teal-50 dark:bg-teal-950/30',
  legal: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30',
}

const STATUS_INDICATORS: Record<string, { color: string; label: string; animation?: string }> = {
  idle: { color: 'bg-gray-400', label: 'Idle' },
  working: { color: 'bg-green-500', label: 'Working', animation: 'animate-pulse' },
  reviewing: { color: 'bg-blue-500', label: 'Reviewing', animation: 'animate-pulse' },
  blocked: { color: 'bg-red-500', label: 'Blocked', animation: 'animate-ping' },
  offline: { color: 'bg-gray-300', label: 'Offline' },
}

function AgentNodeComponent({ data }: NodeProps<AgentNodeData>) {
  const roleStyle = ROLE_COLORS[data.role] ?? 'border-gray-400 bg-gray-50'
  const status = STATUS_INDICATORS[data.status] ?? STATUS_INDICATORS.idle
  const nodeClass = data.status === 'working' ? 'oc-node-working' :
    data.status === 'blocked' ? 'oc-node-error' :
    data.status === 'idle' ? 'oc-node-idle' : ''

  return (
    <div className={`rounded-lg border-2 p-3 min-w-[160px] shadow-sm ${roleStyle} ${nodeClass}`}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      {/* Header: role + status */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm capitalize">{data.role}</span>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${status.color} ${status.animation ?? ''}`} />
          <span className="text-xs text-muted-foreground">{status.label}</span>
        </div>
      </div>

      {/* Current task with progress */}
      {data.currentTask && (
        <div className="mb-2">
          <p className="text-xs truncate text-muted-foreground">{data.currentTask.title}</p>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${data.currentTask.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Message stats */}
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span title="Sent">{data.messageStats.sent}↑</span>
        <span title="Received">{data.messageStats.received}↓</span>
        <span title="Today">{data.messageStats.today} today</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  )
}

export const AgentNode = memo(AgentNodeComponent)
