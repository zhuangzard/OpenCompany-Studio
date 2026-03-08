'use client'

import { useEffect, useState } from 'react'
import { ocApi } from '@/hooks/use-opencompany-api'

interface Profile {
  role: string
  score: number
  totalMessages: number
  violations: { info: number; warning: number; critical: number; emergency: number }
}

interface PerfRating {
  rating: string
  overallScore: number
  dimensions: Record<string, number>
}

interface CompInfo {
  level: string
  currentSalary: number
}

interface AgentScorecardProps {
  onSelectAgent?: (agentId: string) => void
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 50) return 'text-amber-500'
  return 'text-red-500'
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

const RATING_COLORS: Record<string, string> = {
  S: 'bg-purple-500 text-white',
  A: 'bg-blue-500 text-white',
  B: 'bg-green-500 text-white',
  C: 'bg-yellow-500 text-white',
  D: 'bg-red-500 text-white',
}

const DIM_LABELS: Record<string, string> = {
  taskQuality: 'Quality',
  efficiency: 'Efficiency',
  collaboration: 'Collab',
  compliance: 'Compliance',
  growth: 'Growth',
}

export function AgentScorecard({ onSelectAgent }: AgentScorecardProps) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [perfs, setPerfs] = useState<Record<string, PerfRating>>({})
  const [comps, setComps] = useState<Record<string, CompInfo>>({})

  useEffect(() => {
    ocApi.get<{ profiles: Profile[] }>('/api/hr/trends')
      .then((d) => {
        const ps = d.profiles || []
        setProfiles(ps)
        // Fetch performance + compensation for each
        for (const p of ps) {
          ocApi.get<{ rating: PerfRating | null }>(`/api/performance/agents/${p.role}`)
            .then((r) => { if (r.rating) setPerfs((prev) => ({ ...prev, [p.role]: r.rating! })) })
            .catch(() => {})
          ocApi.get<{ compensation: CompInfo }>(`/api/compensation/agents/${p.role}`)
            .then((r) => { if (r.compensation) setComps((prev) => ({ ...prev, [p.role]: r.compensation })) })
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {profiles.map((p) => {
        const perf = perfs[p.role]
        const comp = comps[p.role]

        return (
          <div
            key={p.role}
            onClick={() => onSelectAgent?.(p.role)}
            className={`border rounded-lg p-3 bg-card ${onSelectAgent ? 'cursor-pointer hover:bg-accent/30' : ''}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{p.role}</span>
                {comp && <span className="text-[10px] text-muted-foreground font-mono">{comp.level}</span>}
              </div>
              <div className="flex items-center gap-1.5">
                {perf && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${RATING_COLORS[perf.rating] || 'bg-accent'}`}>
                    {perf.rating}
                  </span>
                )}
                <span className={`text-lg font-bold ${scoreColor(p.score)}`}>{p.score}</span>
              </div>
            </div>

            {/* Score bar */}
            <div className="w-full h-2 bg-accent rounded-full mb-2">
              <div
                className={`h-full rounded-full transition-all ${scoreBg(p.score)}`}
                style={{ width: `${p.score}%` }}
              />
            </div>

            {/* 5-dimension mini bars */}
            {perf?.dimensions && (
              <div className="grid grid-cols-5 gap-1 mb-2">
                {Object.entries(perf.dimensions).map(([dim, val]) => (
                  <div key={dim} className="text-center">
                    <div className="text-[8px] text-muted-foreground">{DIM_LABELS[dim] || dim}</div>
                    <div className="w-full h-1 rounded-full bg-accent mt-0.5">
                      <div
                        className={`h-full rounded-full ${val >= 70 ? 'bg-green-500' : val >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer stats */}
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{p.totalMessages} msgs</span>
              {comp && <span className="font-mono">${comp.currentSalary.toLocaleString()}</span>}
              {p.violations.warning > 0 && (
                <span className="text-amber-500">{p.violations.warning} warn</span>
              )}
              {p.violations.critical > 0 && (
                <span className="text-red-500">{p.violations.critical} crit</span>
              )}
            </div>
          </div>
        )
      })}
      {profiles.length === 0 && (
        <p className="text-muted-foreground text-xs col-span-full text-center py-4">
          No agent profiles yet — monitoring will populate data
        </p>
      )}
    </div>
  )
}
