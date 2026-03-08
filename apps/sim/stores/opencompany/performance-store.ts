import { create } from 'zustand'
import { ocApi } from '@/hooks/use-opencompany-api'

export interface PerformanceRating {
  agentId: string
  period: string
  overallScore: number
  rating: 'S' | 'A' | 'B' | 'C' | 'D'
  dimensions: {
    taskQuality: number
    efficiency: number
    collaboration: number
    compliance: number
    growth: number
  }
}

interface PerformanceStore {
  ratings: Record<string, PerformanceRating>
  ratingHistory: Record<string, PerformanceRating[]>
  fetchRating: (agentId: string) => Promise<void>
  fetchHistory: (agentId: string) => Promise<void>
  evaluatePerformance: (input: {
    agentId: string
    period: string
    taskQuality: number
    efficiency: number
    collaboration: number
    compliance: number
    growth: number
  }) => Promise<PerformanceRating>
}

export const usePerformanceStore = create<PerformanceStore>((set) => ({
  ratings: {},
  ratingHistory: {},

  fetchRating: async (agentId) => {
    const data = await ocApi.get<{ rating: PerformanceRating | null }>(`/api/performance/agents/${agentId}`)
    if (data.rating) {
      set((s) => ({ ratings: { ...s.ratings, [agentId]: data.rating! } }))
    }
  },

  fetchHistory: async (agentId) => {
    const data = await ocApi.get<{ ratings: PerformanceRating[] }>(`/api/performance/agents/${agentId}/history`)
    set((s) => ({ ratingHistory: { ...s.ratingHistory, [agentId]: data.ratings } }))
  },

  evaluatePerformance: async (input) => {
    const data = await ocApi.post<{ rating: PerformanceRating }>('/api/performance/evaluate', input)
    set((s) => ({ ratings: { ...s.ratings, [input.agentId]: data.rating } }))
    return data.rating
  },
}))
