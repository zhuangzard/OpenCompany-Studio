'use client'

import { useState, useEffect } from 'react'
import { X, Award, MinusCircle, TrendingUp, Sliders } from 'lucide-react'
import { PerformanceRadar } from './performance-radar'
import { ocApi } from '@/hooks/use-opencompany-api'
import { useCompensationStore } from '@/stores/opencompany/compensation-store'

interface EmployeeDetailProps {
  agentId: string
  onClose: () => void
}

interface InspectData {
  persona: {
    traits: Record<string, number>
    mood: Record<string, number>
  } | null
  compensation: {
    level: string
    baseSalary: number
    currentSalary: number
    balance: number
    lifetimeEarnings: number
    promotionProgress: number
  } | null
  performance: {
    overallScore: number
    rating: string
    dimensions: {
      taskQuality: number
      efficiency: number
      collaboration: number
      compliance: number
      growth: number
    }
  } | null
  modelAccess: string
}

const RATING_COLORS: Record<string, string> = {
  S: 'bg-purple-500 text-white',
  A: 'bg-blue-500 text-white',
  B: 'bg-green-500 text-white',
  C: 'bg-yellow-500 text-white',
  D: 'bg-red-500 text-white',
}

export function EmployeeDetail({ agentId, onClose }: EmployeeDetailProps) {
  const [data, setData] = useState<InspectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const { awardBonus, issueDeduction, promote, fetchCompensation } = useCompensationStore()

  const load = () => {
    setLoading(true)
    ocApi.get<InspectData>(`/api/god/agents/${agentId}/inspect`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [agentId])

  const handleBonus = async () => {
    setActionLoading(true)
    try {
      await awardBonus(agentId, 'performance', 500, 'Manual bonus from dashboard', 'admin')
      load()
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeduction = async () => {
    setActionLoading(true)
    try {
      await issueDeduction(agentId, 'violation', 200, 'Manual deduction from dashboard', 'admin')
      load()
    } finally {
      setActionLoading(false)
    }
  }

  const handlePromote = async () => {
    setActionLoading(true)
    try {
      await promote(agentId)
      load()
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-card rounded-lg shadow-2xl border">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold">{agentId}</h2>
            {data?.compensation && (
              <p className="text-xs text-muted-foreground">
                {data.compensation.level} &middot; ${data.compensation.currentSalary.toLocaleString()}/mo
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : !data ? (
          <div className="p-8 text-center text-muted-foreground">Agent not found</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleBonus}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-500 text-white text-xs hover:bg-green-600 disabled:opacity-50"
              >
                <Award className="w-3 h-3" /> Award Bonus ($500)
              </button>
              <button
                onClick={handleDeduction}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-500 text-white text-xs hover:bg-red-600 disabled:opacity-50"
              >
                <MinusCircle className="w-3 h-3" /> Deduction ($200)
              </button>
              <button
                onClick={handlePromote}
                disabled={actionLoading || (data.compensation?.promotionProgress ?? 0) < 100}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 disabled:opacity-50"
              >
                <TrendingUp className="w-3 h-3" /> Promote
              </button>
            </div>

            {/* Compensation details */}
            {data.compensation && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Compensation</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-accent/50 rounded p-3">
                    <p className="text-muted-foreground mb-0.5">Base Salary</p>
                    <p className="font-bold">${data.compensation.baseSalary.toLocaleString()}</p>
                  </div>
                  <div className="bg-accent/50 rounded p-3">
                    <p className="text-muted-foreground mb-0.5">Current Salary</p>
                    <p className="font-bold">${data.compensation.currentSalary.toLocaleString()}</p>
                  </div>
                  <div className="bg-accent/50 rounded p-3">
                    <p className="text-muted-foreground mb-0.5">Balance</p>
                    <p className="font-bold">${data.compensation.balance.toLocaleString()}</p>
                  </div>
                  <div className="bg-accent/50 rounded p-3">
                    <p className="text-muted-foreground mb-0.5">Lifetime</p>
                    <p className="font-bold">${data.compensation.lifetimeEarnings.toLocaleString()}</p>
                  </div>
                </div>
                {/* Promotion bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Promotion Progress</span>
                    <span>{data.compensation.promotionProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-accent">
                    <div
                      className={`h-full rounded-full transition-all ${
                        data.compensation.promotionProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(data.compensation.promotionProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Performance */}
            {data.performance && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold">Performance</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${RATING_COLORS[data.performance.rating] || 'bg-accent'}`}>
                    {data.performance.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">Score: {data.performance.overallScore}</span>
                </div>
                <PerformanceRadar dimensions={data.performance.dimensions} size={220} />
              </div>
            )}

            {/* Personality / Mood */}
            {data.persona && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Personality & Mood</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Traits */}
                  <div>
                    <h4 className="text-xs text-muted-foreground mb-2">Traits</h4>
                    <div className="space-y-1.5">
                      {Object.entries(data.persona.traits).map(([key, val]) => (
                        <div key={key}>
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                            <span className="capitalize">{key}</span>
                            <span>{val}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-accent">
                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Mood */}
                  <div>
                    <h4 className="text-xs text-muted-foreground mb-2">Current Mood</h4>
                    <div className="space-y-1.5">
                      {Object.entries(data.persona.mood).map(([key, val]) => (
                        <div key={key}>
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                            <span className="capitalize">{key}</span>
                            <span>{val}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-accent">
                            <div
                              className={`h-full rounded-full ${
                                key === 'stress' ? (val > 60 ? 'bg-red-500' : 'bg-green-500') :
                                val >= 60 ? 'bg-green-500' : val >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${val}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Model Access */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sliders className="w-3 h-3" />
              <span>Model Access:</span>
              <span className="font-medium capitalize">{data.modelAccess || 'N/A'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
