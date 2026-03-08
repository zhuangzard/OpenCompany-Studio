import { create } from 'zustand'
import { ocApi } from '@/hooks/use-opencompany-api'

export interface AgentCompensation {
  agentId: string
  role: string
  level: string
  baseSalary: number
  currentSalary: number
  balance: number
  lifetimeEarnings: number
  promotionProgress: number
}

export interface LeaderboardEntry {
  agentId: string
  role: string
  level: string
  currentSalary: number
  balance: number
  lifetimeEarnings: number
}

export interface SalaryOverview {
  totalPayroll: number
  agentCount: number
  averageSalary: number
  medianSalary: number
  departments: Record<string, { count: number; totalSalary: number }>
}

export interface PayrollReport {
  period: string
  totalPaid: number
  agents: Array<{ agentId: string; paid: number; adjustments: string[] }>
}

interface CompensationStore {
  compensations: Record<string, AgentCompensation>
  leaderboard: LeaderboardEntry[]
  salaryOverview: SalaryOverview | null
  latestPayroll: PayrollReport | null
  fetchCompensation: (agentId: string) => Promise<void>
  fetchLeaderboard: () => Promise<void>
  fetchSalaryOverview: () => Promise<void>
  runPayroll: (period: string) => Promise<PayrollReport>
  awardBonus: (agentId: string, type: string, amount: number, reason: string, awardedBy: string) => Promise<void>
  issueDeduction: (agentId: string, type: string, amount: number, reason: string, issuedBy: string) => Promise<void>
  promote: (agentId: string) => Promise<unknown>
}

export const useCompensationStore = create<CompensationStore>((set, get) => ({
  compensations: {},
  leaderboard: [],
  salaryOverview: null,
  latestPayroll: null,

  fetchCompensation: async (agentId) => {
    const data = await ocApi.get<{ compensation: AgentCompensation }>(`/api/compensation/agents/${agentId}`)
    set((s) => ({ compensations: { ...s.compensations, [agentId]: data.compensation } }))
  },

  fetchLeaderboard: async () => {
    const data = await ocApi.get<{ leaderboard: LeaderboardEntry[] }>('/api/compensation/leaderboard')
    set({ leaderboard: data.leaderboard })
  },

  fetchSalaryOverview: async () => {
    const data = await ocApi.get<SalaryOverview>('/api/compensation/salary-overview')
    set({ salaryOverview: data })
  },

  runPayroll: async (period) => {
    const data = await ocApi.post<{ report: PayrollReport }>('/api/compensation/payroll', { period })
    set({ latestPayroll: data.report })
    return data.report
  },

  awardBonus: async (agentId, type, amount, reason, awardedBy) => {
    await ocApi.post('/api/compensation/bonus', { agentId, type, amount, reason, awardedBy })
    get().fetchCompensation(agentId)
  },

  issueDeduction: async (agentId, type, amount, reason, issuedBy) => {
    await ocApi.post('/api/compensation/deduction', { agentId, type, amount, reason, issuedBy })
    get().fetchCompensation(agentId)
  },

  promote: async (agentId) => {
    const result = await ocApi.post(`/api/compensation/promote/${agentId}`, {})
    get().fetchCompensation(agentId)
    return result
  },
}))
