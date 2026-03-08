'use client'

import { useEffect, useState } from 'react'
import { Users, Plus } from 'lucide-react'
import { ocApi } from '@/hooks/use-opencompany-api'

interface PoolSummary {
  total: number
  free: number
  assigned: number
  ready: number
  active: number
}

interface PoolAgent {
  id: string
  role: string
  instanceName: string
  status: string
  model?: string
  skills?: string[]
  projectId?: string
}

type FilterStatus = 'all' | 'free' | 'assigned' | 'ready' | 'active'

const STATUS_COLORS: Record<string, string> = {
  free: 'bg-green-100 text-green-700',
  assigned: 'bg-blue-100 text-blue-700',
  ready: 'bg-yellow-100 text-yellow-700',
  active: 'bg-purple-100 text-purple-700',
}

export function AgentPoolPanel() {
  const [summary, setSummary] = useState<PoolSummary | null>(null)
  const [agents, setAgents] = useState<PoolAgent[]>([])
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [showRegister, setShowRegister] = useState(false)
  const [regForm, setRegForm] = useState({ role: 'engineer', instanceName: '', model: '' })
  const [registering, setRegistering] = useState(false)

  const load = () => {
    ocApi.get<PoolSummary>('/api/agent-pool').then(setSummary).catch(() => {})
    const query = filter === 'all' ? '' : `?status=${filter}`
    ocApi.get<{ agents: PoolAgent[] }>(`/api/agent-pool/agents${query}`)
      .then((d) => setAgents(d.agents || []))
      .catch(() => setAgents([]))
  }

  useEffect(() => { load() }, [filter])

  const handleRegister = async () => {
    if (!regForm.instanceName) return
    setRegistering(true)
    try {
      await ocApi.post('/api/agent-pool/register', {
        role: regForm.role,
        instanceName: regForm.instanceName,
        model: regForm.model || undefined,
      })
      setShowRegister(false)
      setRegForm({ role: 'engineer', instanceName: '', model: '' })
      load()
    } finally {
      setRegistering(false)
    }
  }

  const filters: { id: FilterStatus; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: summary?.total },
    { id: 'free', label: 'Free', count: summary?.free },
    { id: 'assigned', label: 'Assigned', count: summary?.assigned },
    { id: 'ready', label: 'Ready', count: summary?.ready },
    { id: 'active', label: 'Active', count: summary?.active },
  ]

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <h3 className="text-sm font-semibold">Agent Pool</h3>
          {summary && (
            <span className="text-xs text-muted-foreground">{summary.total} agents</span>
          )}
        </div>
        <button
          onClick={() => setShowRegister(!showRegister)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
        >
          <Plus className="w-3 h-3" /> Register Agent
        </button>
      </div>

      {/* Register form */}
      {showRegister && (
        <div className="border rounded-md p-4 bg-accent/20 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Role</label>
              <select
                value={regForm.role}
                onChange={(e) => setRegForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full px-2 py-1.5 rounded border bg-background text-xs"
              >
                {['engineer', 'researcher', 'reviewer', 'director', 'hr', 'legal', 'finance'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Instance Name</label>
              <input
                type="text"
                value={regForm.instanceName}
                onChange={(e) => setRegForm((f) => ({ ...f, instanceName: e.target.value }))}
                placeholder="e.g. engineer-42"
                className="w-full px-2 py-1.5 rounded border bg-background text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Model (optional)</label>
              <input
                type="text"
                value={regForm.model}
                onChange={(e) => setRegForm((f) => ({ ...f, model: e.target.value }))}
                placeholder="e.g. sonnet"
                className="w-full px-2 py-1.5 rounded border bg-background text-xs"
              />
            </div>
          </div>
          <button
            onClick={handleRegister}
            disabled={registering || !regForm.instanceName}
            className="px-3 py-1.5 rounded bg-green-500 text-white text-xs hover:bg-green-600 disabled:opacity-50"
          >
            {registering ? 'Registering...' : 'Register'}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              filter === f.id ? 'bg-blue-500 text-white' : 'bg-accent text-muted-foreground'
            }`}
          >
            {f.label} {f.count != null ? `(${f.count})` : ''}
          </button>
        ))}
      </div>

      {/* Agent list */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-accent/50 text-left text-muted-foreground">
              <th className="px-3 py-2">Agent</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Model</th>
              <th className="px-3 py-2">Project</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id} className="border-t hover:bg-accent/20">
                <td className="px-3 py-2 font-mono">{a.instanceName || a.id}</td>
                <td className="px-3 py-2 capitalize">{a.role}</td>
                <td className="px-3 py-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${STATUS_COLORS[a.status] || 'bg-accent'}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{a.model || '—'}</td>
                <td className="px-3 py-2 text-muted-foreground font-mono">{a.projectId?.slice(0, 8) || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {agents.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No agents in pool. Register one to get started.
          </div>
        )}
      </div>
    </div>
  )
}
