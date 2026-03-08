'use client'

import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'
import { ocApi } from '@/hooks/use-opencompany-api'

interface Compensation {
  agentId: string
  role?: string
  level: string
  currentSalary: number
  balance: number
  lifetimeEarnings: number
}

interface PersonaInfo {
  traits: Record<string, number>
  mood: Record<string, number>
}

interface PerformanceInfo {
  rating: string
  overallScore: number
}

interface ProfileCardProps {
  compensation: Compensation
  persona?: PersonaInfo | null
  onClick?: () => void
}

const LEVEL_TITLES: Record<string, string> = {
  L1: 'Intern', L2: 'Junior', L3: 'Mid-Level', L4: 'Senior', L5: 'Staff',
  L6: 'Lead', L7: 'Principal', L8: 'Director', L9: 'VP', L10: 'C-Suite',
}

const RATING_COLORS: Record<string, string> = {
  S: 'bg-purple-500 text-white',
  A: 'bg-blue-500 text-white',
  B: 'bg-green-500 text-white',
  C: 'bg-yellow-500 text-white',
  D: 'bg-red-500 text-white',
}

const MODEL_BADGES: Record<string, { label: string; class: string }> = {
  haiku: { label: 'Haiku', class: 'bg-gray-100 text-gray-700' },
  sonnet: { label: 'Sonnet', class: 'bg-blue-100 text-blue-700' },
  opus: { label: 'Opus', class: 'bg-purple-100 text-purple-700' },
}

export function ProfileCard({ compensation, persona, onClick }: ProfileCardProps) {
  const [perf, setPerf] = useState<PerformanceInfo | null>(null)
  const [modelAccess, setModelAccess] = useState<string>('haiku')

  useEffect(() => {
    ocApi.get<{ rating: PerformanceInfo | null }>(`/api/performance/agents/${compensation.agentId}`)
      .then((d) => { if (d.rating) setPerf(d.rating) })
      .catch(() => {})

    ocApi.get<{ compensation: unknown; modelAccess: string }>(`/api/compensation/agents/${compensation.agentId}`)
      .then((d) => setModelAccess(d.modelAccess || 'haiku'))
      .catch(() => {})
  }, [compensation.agentId])

  const level = compensation.level || 'L1'
  const title = LEVEL_TITLES[level] || level
  const model = MODEL_BADGES[modelAccess] || MODEL_BADGES.haiku

  // Promotion progress from compensation store
  const promotionProgress = (compensation as unknown as { promotionProgress?: number }).promotionProgress ?? 0

  return (
    <div
      onClick={onClick}
      className="border rounded-lg p-4 bg-card hover:bg-accent/30 cursor-pointer transition-colors space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">{compensation.agentId}</p>
          <p className="text-[10px] text-muted-foreground">{level} {title}</p>
        </div>
        {perf && (
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${RATING_COLORS[perf.rating] || 'bg-accent'}`}>
            {perf.rating}
          </span>
        )}
      </div>

      {/* Salary */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Salary</span>
        <span className="font-mono font-medium">${compensation.currentSalary.toLocaleString()}/mo</span>
      </div>

      {/* Balance */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Balance</span>
        <span className="font-mono">${compensation.balance.toLocaleString()}</span>
      </div>

      {/* Promotion progress */}
      <div>
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          <span>Promotion</span>
          <span>{promotionProgress}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-accent">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${Math.min(promotionProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Model access */}
      <div className="flex items-center gap-1.5">
        <Zap className="w-3 h-3 text-muted-foreground" />
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${model.class}`}>
          {model.label}
        </span>
      </div>

      {/* Mood indicators */}
      {persona?.mood && (
        <div className="flex gap-2 pt-1 border-t">
          {Object.entries(persona.mood).map(([key, val]) => (
            <div key={key} className="flex-1">
              <div className="text-[8px] text-muted-foreground text-center capitalize">{key.slice(0, 3)}</div>
              <div className="w-full h-1 rounded-full bg-accent mt-0.5">
                <div
                  className={`h-full rounded-full ${
                    key === 'stress' ? (val > 60 ? 'bg-red-400' : 'bg-green-400') :
                    val >= 60 ? 'bg-green-400' : val >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
