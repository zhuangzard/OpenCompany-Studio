'use client'

import { useEffect, useState } from 'react'

interface AgentInfo {
  id: string
  role: string
  name: string
  status: string
  department: string
}

const STATUS_COLORS: Record<string, string> = {
  idle: 'bg-gray-400',
  working: 'bg-green-500',
  reviewing: 'bg-blue-500',
  blocked: 'bg-red-500',
  offline: 'bg-gray-300',
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_OPENCOMPANY_API_URL || 'http://localhost:4000'
    fetch(`${apiUrl}/api/agents`)
      .then((res) => res.json())
      .then((data) => {
        setAgents(data.agents || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading agents...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Agent Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[agent.status] || 'bg-gray-400'}`} />
              <h3 className="font-semibold capitalize">{agent.role}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{agent.name}</p>
            <div className="flex justify-between mt-3 text-xs text-muted-foreground">
              <span>{agent.department}</span>
              <span className="capitalize">{agent.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
