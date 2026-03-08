'use client'

import { useEffect, useState } from 'react'
import { Trophy, AlertTriangle } from 'lucide-react'
import { useCompensationStore, type LeaderboardEntry } from '@/stores/opencompany/compensation-store'
import { ocApi } from '@/hooks/use-opencompany-api'

interface LeaderboardProps {
  onSelectAgent: (id: string) => void
}

interface AgentPerf {
  rating: string | null
  overallScore: number
}

const MEDAL_COLORS = ['text-yellow-500', 'text-gray-400', 'text-orange-600']

const RATING_COLORS: Record<string, string> = {
  S: 'bg-purple-500 text-white',
  A: 'bg-blue-500 text-white',
  B: 'bg-green-500 text-white',
  C: 'bg-yellow-500 text-white',
  D: 'bg-red-500 text-white',
}

export function Leaderboard({ onSelectAgent }: LeaderboardProps) {
  const { leaderboard, fetchLeaderboard } = useCompensationStore()
  const [perfs, setPerfs] = useState<Record<string, AgentPerf>>({})

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  useEffect(() => {
    for (const entry of leaderboard) {
      if (!perfs[entry.agentId]) {
        ocApi.get<{ rating: { rating: string; overallScore: number } | null }>(`/api/performance/agents/${entry.agentId}`)
          .then((d) => {
            setPerfs((prev) => ({
              ...prev,
              [entry.agentId]: { rating: d.rating?.rating || null, overallScore: d.rating?.overallScore || 0 },
            }))
          })
          .catch(() => {})
      }
    }
  }, [leaderboard, perfs])

  // Sort by lifetime earnings descending
  const sorted = [...leaderboard].sort((a, b) => b.lifetimeEarnings - a.lifetimeEarnings)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4" />
        <h3 className="text-sm font-semibold">Employee Leaderboard</h3>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-accent/50 text-left text-muted-foreground">
              <th className="px-3 py-2 w-12">#</th>
              <th className="px-3 py-2">Agent</th>
              <th className="px-3 py-2">Level</th>
              <th className="px-3 py-2">Rating</th>
              <th className="px-3 py-2 text-right">Salary</th>
              <th className="px-3 py-2 text-right">Balance</th>
              <th className="px-3 py-2 text-right">Lifetime</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, i) => {
              const perf = perfs[entry.agentId]
              const isWarning = perf?.rating === 'C' || perf?.rating === 'D'

              return (
                <tr
                  key={entry.agentId}
                  onClick={() => onSelectAgent(entry.agentId)}
                  className={`border-t cursor-pointer transition-colors hover:bg-accent/30 ${
                    isWarning ? 'bg-red-50 dark:bg-red-950/20' : ''
                  }`}
                >
                  <td className="px-3 py-2">
                    {i < 3 ? (
                      <Trophy className={`w-4 h-4 ${MEDAL_COLORS[i]}`} />
                    ) : (
                      <span className="text-muted-foreground">{i + 1}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium">
                    <div className="flex items-center gap-1.5">
                      {entry.agentId}
                      {isWarning && <AlertTriangle className="w-3 h-3 text-red-500" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{entry.role}</span>
                  </td>
                  <td className="px-3 py-2 font-mono">{entry.level}</td>
                  <td className="px-3 py-2">
                    {perf?.rating ? (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${RATING_COLORS[perf.rating] || 'bg-accent'}`}>
                        {perf.rating}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">${entry.currentSalary.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono">${entry.balance.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono">${entry.lifetimeEarnings.toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No employee data. Initialize compensation first.
          </div>
        )}
      </div>
    </div>
  )
}
