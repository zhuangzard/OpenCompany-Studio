'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, ListTodo, ShieldAlert, BarChart3, ArrowDown, ArrowUp, HelpCircle, AlertTriangle } from 'lucide-react'
import { useMessagesStore, type MessageState } from '@/stores/opencompany/messages-store'
import { useSOPStore } from '@/stores/opencompany/sop-store'
import { ocApi } from '@/hooks/use-opencompany-api'

interface BottomPanelProps {
  collapsed?: boolean
  onToggle?: () => void
}

type Tab = 'messages' | 'tasks' | 'sop' | 'metrics'

interface TaskInfo {
  agentId: string
  role: string
  status: string
  currentTask?: string
}

interface EfficiencyEntry {
  department: string
  costPerTask: number
  tokensPerTask: number
  rating: string
}

const MESSAGE_TYPE_ICONS: Record<string, typeof ArrowDown> = {
  directive: ArrowDown,
  report: ArrowUp,
  question: HelpCircle,
  alert: AlertTriangle,
}

const STATUS_COLORS: Record<string, string> = {
  idle: 'bg-gray-400',
  working: 'bg-amber-500',
  reviewing: 'bg-blue-500',
  blocked: 'bg-red-500',
  offline: 'bg-gray-300',
}

export function BottomPanel({ collapsed, onToggle }: BottomPanelProps) {
  const [tab, setTab] = useState<Tab>('messages')
  const [tasks, setTasks] = useState<TaskInfo[]>([])
  const [efficiency, setEfficiency] = useState<EfficiencyEntry[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = useMessagesStore((s) => s.messages)
  const violations = useSOPStore((s) => s.violations)

  useEffect(() => {
    if (collapsed) return
    if (tab === 'tasks') {
      ocApi.get<{ agents: TaskInfo[] }>('/api/agents')
        .then((d) => setTasks(d.agents?.filter((a: TaskInfo) => a.status !== 'offline') || []))
        .catch(() => {})
    } else if (tab === 'metrics') {
      ocApi.get<{ ranking: EfficiencyEntry[] }>('/api/accounting/efficiency/ranking')
        .then((d) => setEfficiency(d.ranking || []))
        .catch(() => {})
    }
  }, [tab, collapsed])

  // Auto-scroll messages
  useEffect(() => {
    if (tab === 'messages' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, tab])

  const tabs = [
    { id: 'messages' as Tab, label: 'Messages', icon: MessageSquare, count: messages.length },
    { id: 'tasks' as Tab, label: 'Tasks', icon: ListTodo, count: tasks.filter((t) => t.status === 'working').length },
    { id: 'sop' as Tab, label: 'SOP Log', icon: ShieldAlert, count: violations.length },
    { id: 'metrics' as Tab, label: 'Metrics', icon: BarChart3 },
  ]

  if (collapsed) {
    return (
      <div
        className="h-8 border-t bg-card flex items-center justify-center cursor-pointer hover:bg-accent/50"
        onClick={onToggle}
      >
        <span className="text-xs text-muted-foreground">Show Panel</span>
      </div>
    )
  }

  return (
    <div className="h-64 border-t bg-card flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b px-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon className="w-3 h-3" />
            {t.label}
            {t.count ? (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-accent text-[10px]">{t.count}</span>
            ) : null}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={onToggle} className="px-2 text-xs text-muted-foreground hover:text-foreground">
          Hide
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3 text-xs">
        {tab === 'messages' && (
          <div className="space-y-1">
            {messages.map((m) => {
              const Icon = MESSAGE_TYPE_ICONS[m.type] || MessageSquare
              return (
                <div key={m.id} className="flex gap-2 py-1 border-b border-border/50 items-center">
                  <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="font-mono text-muted-foreground w-32 shrink-0">{m.senderId} → {m.receiverId}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    m.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    m.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-accent'
                  }`}>{m.type}</span>
                  <span className="truncate">{m.content}</span>
                  <span className="ml-auto text-muted-foreground shrink-0">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}
            {messages.length === 0 && <p className="text-muted-foreground">No messages yet</p>}
            <div ref={messagesEndRef} />
          </div>
        )}

        {tab === 'tasks' && (
          <div className="space-y-1">
            {tasks.length === 0 && <p className="text-muted-foreground">No active agents</p>}
            {tasks
              .sort((a, b) => {
                const order = { working: 0, reviewing: 1, blocked: 2, idle: 3 }
                return (order[a.status as keyof typeof order] ?? 4) - (order[b.status as keyof typeof order] ?? 4)
              })
              .map((t) => (
              <div key={t.agentId} className="flex gap-2 py-1.5 border-b border-border/50 items-center">
                <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_COLORS[t.status] || 'bg-gray-400'}`} />
                <span className="font-mono w-28 shrink-0">{t.role}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                  t.status === 'working' ? 'bg-amber-100 text-amber-700' :
                  t.status === 'blocked' ? 'bg-red-100 text-red-700' :
                  t.status === 'reviewing' ? 'bg-blue-100 text-blue-700' :
                  'bg-accent'
                }`}>{t.status}</span>
                <span className="truncate text-muted-foreground">{t.currentTask || '—'}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'sop' && (
          <div className="space-y-1">
            {violations.map((v, i) => (
              <div key={i} className="flex gap-2 py-1 border-b border-border/50">
                <span className="text-red-500 font-mono">VIOLATION</span>
                <span>{v.senderId} → {v.receiverId}</span>
                <span className="truncate text-muted-foreground">{v.content}</span>
                <span className="text-muted-foreground ml-auto shrink-0">{v.timestamp}</span>
              </div>
            ))}
            {violations.length === 0 && <p className="text-muted-foreground">No SOP violations recorded</p>}
          </div>
        )}

        {tab === 'metrics' && (
          <div>
            {efficiency.length === 0 && <p className="text-muted-foreground">No efficiency data available</p>}
            {efficiency.length > 0 && (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="py-1 pr-4">Department</th>
                    <th className="py-1 pr-4">Cost/Task</th>
                    <th className="py-1 pr-4">Tokens/Task</th>
                    <th className="py-1">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {efficiency.map((e) => (
                    <tr key={e.department} className="border-b border-border/50">
                      <td className="py-1.5 pr-4 font-mono">{e.department}</td>
                      <td className="py-1.5 pr-4">${e.costPerTask?.toFixed(2) ?? '—'}</td>
                      <td className="py-1.5 pr-4">{e.tokensPerTask?.toLocaleString() ?? '—'}</td>
                      <td className="py-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          e.rating === 'efficient' ? 'bg-green-100 text-green-700' :
                          e.rating === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>{e.rating}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
