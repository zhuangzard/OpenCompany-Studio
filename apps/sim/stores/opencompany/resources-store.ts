import { create } from 'zustand'
import { ocApi } from '@/hooks/use-opencompany-api'

export interface ResourcePool {
  id: string
  name: string
  parentId: string | null
  status: string
  quotas: Record<string, { limit: number; used: number }>
  overagePolicy: string
}

export interface PoolHealthReport {
  poolId: string
  name: string
  status: string
  alerts: string[]
  utilizationPercent: number
}

export interface ExpenseSummary {
  totalCost: number
  totalTokens: number
  byDepartment: Record<string, number>
  byAgent: Record<string, number>
}

export interface EfficiencyEntry {
  department: string
  costPerTask: number
  tokensPerTask: number
  rating: string
}

interface ResourcesStore {
  pools: ResourcePool[]
  health: PoolHealthReport[]
  expenses: ExpenseSummary | null
  efficiency: EfficiencyEntry[]
  alerts: Array<{ poolId: string; level: string; message: string }>
  fetchPools: () => Promise<void>
  fetchHealth: () => Promise<void>
  fetchExpenses: (scope?: string, scopeId?: string) => Promise<void>
  fetchEfficiency: () => Promise<void>
  fetchAlerts: () => Promise<void>
}

export const useResourcesStore = create<ResourcesStore>((set) => ({
  pools: [],
  health: [],
  expenses: null,
  efficiency: [],
  alerts: [],

  fetchPools: async () => {
    const data = await ocApi.get<{ pools: ResourcePool[] }>('/api/resources/pools')
    set({ pools: data.pools })
  },

  fetchHealth: async () => {
    const data = await ocApi.get<{ health: PoolHealthReport[] }>('/api/resources/health')
    set({ health: data.health })
  },

  fetchExpenses: async (scope = 'company', scopeId = 'all') => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const end = now.toISOString()
    const data = await ocApi.get<ExpenseSummary>(
      `/api/accounting/summary?scope=${scope}&scopeId=${scopeId}&start=${start}&end=${end}`
    )
    set({ expenses: data })
  },

  fetchEfficiency: async () => {
    const data = await ocApi.get<{ ranking: EfficiencyEntry[] }>('/api/accounting/efficiency/ranking')
    set({ efficiency: data.ranking })
  },

  fetchAlerts: async () => {
    const data = await ocApi.get<{ alerts: Array<{ poolId: string; level: string; message: string }> }>('/api/accounting/alerts')
    set({ alerts: data.alerts })
  },
}))
