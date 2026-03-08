'use client'

import { useState, useEffect, useMemo } from 'react'
import { Building2, ChevronRight, Users, Filter } from 'lucide-react'
import { ocApi } from '@/hooks/use-opencompany-api'

interface Department {
  id: string
  name: string
  nameEn: string
  color: string
  icon: string
  supervisor: string
}

interface AgentInfo {
  id: string
  role: string
  name: string
  status: string
  department: string
}

type FilterMode = 'all' | 'active' | 'idle' | 'issues'

interface DepartmentPanelProps {
  agents?: AgentInfo[]
  onSelectDepartment?: (id: string) => void
}

export function DepartmentPanel({ agents = [], onSelectDepartment }: DepartmentPanelProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterMode>('all')

  useEffect(() => {
    ocApi.get<{ departments: Department[] }>('/api/departments')
      .then((data) => setDepartments(data.departments || []))
      .catch(() => {})
  }, [])

  const agentsByDept = useMemo(() => {
    const map: Record<string, AgentInfo[]> = {}
    for (const a of agents) {
      if (!map[a.department]) map[a.department] = []
      map[a.department].push(a)
    }
    return map
  }, [agents])

  const handleSelect = (id: string) => {
    setSelected(id === selected ? null : id)
    onSelectDepartment?.(id)
  }

  const filters: { id: FilterMode; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'idle', label: 'Idle' },
    { id: 'issues', label: 'Issues' },
  ]

  const filteredDepts = departments.filter((dept) => {
    const deptAgents = agentsByDept[dept.id] || []
    if (filter === 'active') return deptAgents.some((a) => a.status === 'working' || a.status === 'reviewing')
    if (filter === 'idle') return deptAgents.every((a) => a.status === 'idle' || a.status === 'offline')
    if (filter === 'issues') return deptAgents.some((a) => a.status === 'blocked')
    return true
  })

  return (
    <div className="w-64 border-r bg-card p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
        <Building2 className="w-4 h-4" />
        Departments
      </h2>

      {/* Filter buttons */}
      <div className="flex gap-1 mb-3">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
              filter === f.id
                ? 'bg-blue-500 text-white'
                : 'bg-accent text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {filteredDepts.map((dept) => {
          const deptAgents = agentsByDept[dept.id] || []
          const activeCount = deptAgents.filter((a) => a.status !== 'offline' && a.status !== 'idle').length

          return (
            <button
              key={dept.id}
              onClick={() => handleSelect(dept.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${
                selected === dept.id
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                <span>{dept.nameEn}</span>
              </div>
              <div className="flex items-center gap-2">
                {deptAgents.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {activeCount}/{deptAgents.length}
                  </span>
                )}
                <ChevronRight className={`w-3 h-3 transition-transform ${selected === dept.id ? 'rotate-90' : ''}`} />
              </div>
            </button>
          )
        })}

        {filteredDepts.length === 0 && (
          <p className="text-xs text-muted-foreground px-3 py-2">
            {departments.length === 0 ? 'No departments configured' : 'No departments match filter'}
          </p>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-6 pt-4 border-t space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground mb-2">Quick Actions</h3>
        <button
          onClick={() => {
            ocApi.post('/api/agent-pool/register', {
              role: 'engineer',
              instanceName: `engineer-${Date.now()}`,
            }).catch(() => {})
          }}
          className="w-full text-left px-3 py-1.5 rounded-md text-xs hover:bg-accent/50 flex items-center gap-2"
        >
          <Users className="w-3 h-3" />
          + New Agent
        </button>
      </div>
    </div>
  )
}
