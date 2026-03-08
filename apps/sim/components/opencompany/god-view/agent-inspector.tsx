'use client'

import { useState, useEffect } from 'react'
import { X, User, DollarSign, BarChart3, Brain, Zap } from 'lucide-react'
import { ocApi } from '@/hooks/use-opencompany-api'

interface InspectData {
  agentId: string
  persona: {
    traits: Record<string, number>
    mood: { satisfaction: number; motivation: number; stress: number; confidence: number }
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
    dimensions: Record<string, number>
  } | null
  modelAccess: string
}

interface MemorySnapshot {
  snapshot: Array<{
    layer: string
    entries: Array<{ key: string; content: string; timestamp?: string }>
  }>
}

interface AgentInspectorProps {
  agentId: string
  onClose: () => void
}

const RATING_COLORS: Record<string, string> = {
  S: 'bg-purple-500 text-white',
  A: 'bg-blue-500 text-white',
  B: 'bg-green-500 text-white',
  C: 'bg-yellow-500 text-white',
  D: 'bg-red-500 text-white',
}

const MODEL_BADGES: Record<string, string> = {
  haiku: 'bg-gray-100 text-gray-700',
  sonnet: 'bg-blue-100 text-blue-700',
  opus: 'bg-purple-100 text-purple-700',
}

export function AgentInspector({ agentId, onClose }: AgentInspectorProps) {
  const [data, setData] = useState<InspectData | null>(null)
  const [memory, setMemory] = useState<MemorySnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      ocApi.get<InspectData>(`/api/god/agents/${agentId}/inspect`),
      ocApi.get<MemorySnapshot>(`/api/god/agents/${agentId}/memory/snapshot`).catch(() => null),
    ]).then(([inspectData, memData]) => {
      setData(inspectData)
      setMemory(memData)
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [agentId])

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Loading agent data...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Agent not found</p>
      </div>
    )
  }

  const { persona, compensation, performance, modelAccess } = data

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="text-sm font-bold">{agentId}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-accent rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Model access badge */}
      <div className="flex items-center gap-2">
        <Zap className="w-3 h-3 text-muted-foreground" />
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${MODEL_BADGES[modelAccess] || 'bg-accent'}`}>
          {modelAccess || 'N/A'}
        </span>
      </div>

      {/* Compensation */}
      {compensation && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="w-3 h-3" /> Compensation
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-accent/50 rounded p-2">
              <p className="text-muted-foreground">Level</p>
              <p className="font-bold">{compensation.level}</p>
            </div>
            <div className="bg-accent/50 rounded p-2">
              <p className="text-muted-foreground">Salary</p>
              <p className="font-bold">${compensation.currentSalary.toLocaleString()}</p>
            </div>
            <div className="bg-accent/50 rounded p-2">
              <p className="text-muted-foreground">Balance</p>
              <p className="font-bold">${compensation.balance.toLocaleString()}</p>
            </div>
            <div className="bg-accent/50 rounded p-2">
              <p className="text-muted-foreground">Lifetime</p>
              <p className="font-bold">${compensation.lifetimeEarnings.toLocaleString()}</p>
            </div>
          </div>
          {/* Promotion progress */}
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Promotion Progress</span>
              <span>{compensation.promotionProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-accent">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${Math.min(compensation.promotionProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Performance */}
      {performance && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <BarChart3 className="w-3 h-3" /> Performance
          </h4>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${RATING_COLORS[performance.rating] || 'bg-accent'}`}>
              {performance.rating}
            </span>
            <span className="text-xs text-muted-foreground">Score: {performance.overallScore}</span>
          </div>
          {/* 5-dimension bars */}
          <div className="space-y-1.5">
            {Object.entries(performance.dimensions || {}).map(([dim, score]) => (
              <div key={dim}>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                  <span className="capitalize">{dim.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span>{score}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-accent">
                  <div
                    className={`h-full rounded-full transition-all ${
                      score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personality / Mood */}
      {persona && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Brain className="w-3 h-3" /> Mood
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(persona.mood).map(([key, val]) => (
              <div key={key} className="text-xs">
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
      )}

      {/* Memory snapshot (compact) */}
      {memory?.snapshot && Array.isArray(memory.snapshot) && memory.snapshot.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Recent Memory</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {memory.snapshot.slice(0, 5).map((entry, i) => (
              <div key={i} className="text-[10px] bg-accent/50 rounded p-1.5">
                <span className="text-muted-foreground">{typeof entry === 'object' && 'layer' in entry ? entry.layer : 'memory'}: </span>
                <span>{typeof entry === 'string' ? entry : JSON.stringify(entry).slice(0, 100)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
