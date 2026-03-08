import { create } from 'zustand'
import { ocApi } from '@/hooks/use-opencompany-api'

export interface Project {
  id: string
  title: string
  description: string
  owner: string
  sponsor: string
  status: string
  departments: string[]
  trialsPassed: number
  trialsAttempted: number
  createdAt: string
  workflowId?: string
}

export interface WorkflowStatus {
  projectId: string
  progress: number
  nodes: Array<{ id: string; status: string; label: string }>
  edges: Array<{ from: string; to: string }>
}

export interface ActivationResult {
  success: boolean
  message?: string
  errors?: string[]
}

interface ProjectStore {
  projects: Project[]
  activeProject: Project | null
  workflows: Record<string, WorkflowStatus>
  fetchProjects: (status?: string) => Promise<void>
  createProject: (opts: { title: string; description: string; owner: string; sponsor: string }) => Promise<Project>
  transitionProject: (id: string, status: string, actor: string) => Promise<void>
  activateProject: (id: string, actor: string) => Promise<ActivationResult>
  fetchWorkflowStatus: (projectId: string) => Promise<void>
  setActiveProject: (project: Project | null) => void
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  activeProject: null,
  workflows: {},

  fetchProjects: async (status) => {
    const query = status ? `?status=${status}` : ''
    const data = await ocApi.get<{ projects: Project[] }>(`/api/projects${query}`)
    set({ projects: data.projects })
  },

  createProject: async (opts) => {
    const data = await ocApi.post<{ project: Project }>('/api/projects', opts)
    get().fetchProjects()
    return data.project
  },

  transitionProject: async (id, status, actor) => {
    await ocApi.post(`/api/projects/${id}/transition`, { status, actor })
    get().fetchProjects()
  },

  activateProject: async (id, actor) => {
    const result = await ocApi.post<ActivationResult>(`/api/projects/${id}/activate`, { actor })
    get().fetchProjects()
    return result
  },

  fetchWorkflowStatus: async (projectId) => {
    const data = await ocApi.get<WorkflowStatus>(`/api/workflows/${projectId}/status`)
    set((s) => ({ workflows: { ...s.workflows, [projectId]: data } }))
  },

  setActiveProject: (project) => set({ activeProject: project }),
}))
