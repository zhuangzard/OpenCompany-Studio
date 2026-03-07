import { create } from 'zustand'

export interface AgentState {
  id: string
  role: string
  name: string
  status: 'idle' | 'working' | 'reviewing' | 'blocked' | 'offline'
  department: string
}

interface AgentsStore {
  agents: AgentState[]
  setAgents: (agents: AgentState[]) => void
  updateAgentStatus: (agentId: string, status: AgentState['status']) => void
}

export const useAgentsStore = create<AgentsStore>((set) => ({
  agents: [],
  setAgents: (agents) => set({ agents }),
  updateAgentStatus: (agentId, status) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, status } : a
      ),
    })),
}))
