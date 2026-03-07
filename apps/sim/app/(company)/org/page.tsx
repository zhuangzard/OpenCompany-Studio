'use client'

import { useEffect, useState } from 'react'

interface OrgAgent {
  id: string
  role: string
  name: string
  department: string
  status: string
  supervisorId: string | null
}

interface OrgData {
  name: string
  agents: OrgAgent[]
}

const ROLE_COLORS: Record<string, string> = {
  ceo: 'border-amber-500 bg-amber-50 dark:bg-amber-950',
  director: 'border-violet-500 bg-violet-50 dark:bg-violet-950',
  engineer: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
  reviewer: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950',
  research: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950',
  hr: 'border-rose-500 bg-rose-50 dark:bg-rose-950',
  finance: 'border-teal-500 bg-teal-50 dark:bg-teal-950',
  legal: 'border-purple-500 bg-purple-50 dark:bg-purple-950',
}

export default function OrgPage() {
  const [org, setOrg] = useState<OrgData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_OPENCOMPANY_API_URL || 'http://localhost:4000'
    fetch(`${apiUrl}/api/org`)
      .then((res) => res.json())
      .then((data) => {
        setOrg(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || !org) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading organization...</p>
      </div>
    )
  }

  const ceos = org.agents.filter((a) => a.role === 'ceo')
  const directors = org.agents.filter((a) => a.role === 'director')
  const staff = org.agents.filter((a) => ['engineer', 'reviewer', 'research'].includes(a.role))
  const support = org.agents.filter((a) => ['hr', 'finance', 'legal'].includes(a.role))

  const renderAgent = (agent: OrgAgent) => (
    <div
      key={agent.id}
      className={`border-l-4 rounded-lg p-3 ${ROLE_COLORS[agent.role] || 'border-gray-500'}`}
    >
      <div className="font-semibold capitalize">{agent.role}</div>
      <div className="text-sm text-muted-foreground">{agent.name}</div>
      <div className="text-xs text-muted-foreground mt-1 capitalize">{agent.status}</div>
    </div>
  )

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">{org.name} — Organization</h1>

      {/* CEO Level */}
      <div className="flex justify-center mb-8">
        <div className="w-64">{ceos.map(renderAgent)}</div>
      </div>

      {/* Director Level */}
      {directors.length > 0 && (
        <>
          <div className="flex justify-center mb-2">
            <div className="w-px h-8 bg-border" />
          </div>
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {directors.map((d) => (
              <div key={d.id} className="w-56">{renderAgent(d)}</div>
            ))}
          </div>
        </>
      )}

      {/* Staff Level */}
      {staff.length > 0 && (
        <>
          <div className="flex justify-center mb-2">
            <div className="w-px h-8 bg-border" />
          </div>
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {staff.map((s) => (
              <div key={s.id} className="w-48">{renderAgent(s)}</div>
            ))}
          </div>
        </>
      )}

      {/* Support Departments */}
      {support.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-4 text-center">Support Departments</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {support.map((s) => (
              <div key={s.id} className="w-48">{renderAgent(s)}</div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
