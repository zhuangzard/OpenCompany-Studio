'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronRight, MessageSquare, FolderOpen, ListTodo, Brain, AlertTriangle, Shield, Users, Building } from 'lucide-react'
import { ocApi } from '@/hooks/use-opencompany-api'

export interface NavSelection {
  type: 'conversations' | 'memory' | 'tasks' | 'agent' | 'timeline' | 'emergency' | 'profiles' | 'company-memory'
  id: string
}

interface AgentInfo {
  id: string
  role: string
  name: string
  status: string
  department: string
}

interface Department {
  id: string
  name: string
  nameEn: string
  color: string
}

interface NavTreeProps {
  agents: AgentInfo[]
  onSelect: (sel: NavSelection) => void
  selected: NavSelection | null
}

export function NavTree({ agents, onSelect, selected }: NavTreeProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    ocApi.get<{ departments: Department[] }>('/api/departments')
      .then((d) => setDepartments(d.departments || []))
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

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const isSelected = (type: NavSelection['type'], id: string) =>
    selected?.type === type && selected?.id === id

  const itemClass = (type: NavSelection['type'], id: string) =>
    `w-full text-left px-3 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors ${
      isSelected(type, id) ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
    }`

  return (
    <div className="p-3 space-y-1">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Departments</p>

      {departments.map((dept) => {
        const deptAgents = agentsByDept[dept.id] || []
        const isOpen = expanded.has(dept.id)

        return (
          <div key={dept.id}>
            <button
              onClick={() => toggle(dept.id)}
              className="w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center gap-2 hover:bg-accent/50 font-medium"
            >
              <ChevronRight className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
              <span>{dept.nameEn}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{deptAgents.length}</span>
            </button>

            {isOpen && (
              <div className="ml-4 space-y-0.5 mt-0.5">
                <button
                  onClick={() => onSelect({ type: 'conversations', id: dept.id })}
                  className={itemClass('conversations', dept.id)}
                >
                  <MessageSquare className="w-3 h-3" />
                  Conversations
                </button>
                <button
                  onClick={() => onSelect({ type: 'memory', id: dept.id })}
                  className={itemClass('memory', dept.id)}
                >
                  <Brain className="w-3 h-3" />
                  Memory
                </button>

                {/* Agent list */}
                {deptAgents.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => onSelect({ type: 'agent', id: a.id })}
                    className={itemClass('agent', a.id)}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      a.status === 'working' ? 'bg-amber-500' :
                      a.status === 'blocked' ? 'bg-red-500' :
                      a.status === 'idle' ? 'bg-green-500' :
                      'bg-gray-400'
                    }`} />
                    {a.name || a.role}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Global section */}
      <div className="mt-4 pt-3 border-t">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Global</p>

        <button
          onClick={() => onSelect({ type: 'timeline', id: 'global' })}
          className={itemClass('timeline', 'global')}
        >
          <AlertTriangle className="w-3 h-3" />
          Event Timeline
        </button>
        <button
          onClick={() => onSelect({ type: 'emergency', id: 'global' })}
          className={itemClass('emergency', 'global')}
        >
          <Shield className="w-3 h-3" />
          Emergency Events
        </button>
        <button
          onClick={() => onSelect({ type: 'profiles', id: 'global' })}
          className={itemClass('profiles', 'global')}
        >
          <Users className="w-3 h-3" />
          Employee Profiles
        </button>
        <button
          onClick={() => onSelect({ type: 'company-memory', id: 'global' })}
          className={itemClass('company-memory', 'global')}
        >
          <Building className="w-3 h-3" />
          Company Memory
        </button>
      </div>
    </div>
  )
}
