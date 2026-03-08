'use client'

import { useEffect, useState } from 'react'
import { ProfileCard } from '@/components/opencompany/employee/profile-card'
import { Leaderboard } from '@/components/opencompany/employee/leaderboard'
import { SalaryOverviewPanel } from '@/components/opencompany/employee/salary-overview'
import { PayrollRunner } from '@/components/opencompany/employee/payroll-runner'
import { EmployeeDetail } from '@/components/opencompany/employee/employee-detail'
import { useCompensationStore } from '@/stores/opencompany/compensation-store'
import { ocApi } from '@/hooks/use-opencompany-api'

type ViewMode = 'grid' | 'leaderboard'

interface PersonaInfo {
  agentId: string
  traits: Record<string, number>
  mood: Record<string, number>
}

export default function EmployeesPage() {
  const [view, setView] = useState<ViewMode>('grid')
  const [personas, setPersonas] = useState<Record<string, PersonaInfo>>({})
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'level' | 'salary' | 'rating'>('level')
  const { leaderboard, fetchLeaderboard, fetchSalaryOverview } = useCompensationStore()

  useEffect(() => {
    fetchLeaderboard()
    fetchSalaryOverview()
  }, [fetchLeaderboard, fetchSalaryOverview])

  // Fetch personas for all agents on leaderboard
  useEffect(() => {
    for (const entry of leaderboard) {
      if (!personas[entry.agentId]) {
        ocApi.get<{ persona: PersonaInfo }>(`/api/personality/agents/${entry.agentId}`)
          .then((d) => {
            if (d.persona) {
              setPersonas((prev) => ({ ...prev, [entry.agentId]: d.persona }))
            }
          })
          .catch(() => {})
      }
    }
  }, [leaderboard, personas])

  const sorted = [...leaderboard].sort((a, b) => {
    if (sortBy === 'level') return a.level.localeCompare(b.level)
    if (sortBy === 'salary') return b.currentSalary - a.currentSalary
    return b.lifetimeEarnings - a.lifetimeEarnings
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-3 flex items-center justify-between bg-card">
        <h1 className="text-lg font-bold">Employee Dashboard</h1>
        <div className="flex items-center gap-3">
          <PayrollRunner />
          <div className="flex gap-1">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1 rounded text-xs ${view === 'grid' ? 'bg-blue-500 text-white' : 'bg-accent text-muted-foreground'}`}
            >
              Profiles
            </button>
            <button
              onClick={() => setView('leaderboard')}
              className={`px-3 py-1 rounded text-xs ${view === 'leaderboard' ? 'bg-blue-500 text-white' : 'bg-accent text-muted-foreground'}`}
            >
              Leaderboard
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Salary overview */}
        <div className="px-6 py-4 border-b">
          <SalaryOverviewPanel />
        </div>

        {/* Sort controls (grid view) */}
        {view === 'grid' && (
          <div className="px-6 py-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by:</span>
            {(['level', 'salary', 'rating'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2 py-0.5 rounded text-[10px] ${
                  sortBy === s ? 'bg-blue-500 text-white' : 'bg-accent text-muted-foreground'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="px-6 pb-6">
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sorted.map((entry) => (
                <ProfileCard
                  key={entry.agentId}
                  compensation={entry}
                  persona={personas[entry.agentId]}
                  onClick={() => setSelectedAgent(entry.agentId)}
                />
              ))}
              {sorted.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                  No employees found. Initialize agent compensation first.
                </p>
              )}
            </div>
          ) : (
            <Leaderboard onSelectAgent={setSelectedAgent} />
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedAgent && (
        <EmployeeDetail
          agentId={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  )
}
