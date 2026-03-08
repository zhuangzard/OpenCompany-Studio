'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Play, Pause, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { WorkflowView } from '@/components/opencompany/project/workflow-view'
import { TrialRunner } from '@/components/opencompany/project/trial-runner'
import { AgentPoolPanel } from '@/components/opencompany/project/agent-pool-panel'
import { ocApi } from '@/hooks/use-opencompany-api'
import { useProjectStore, type Project } from '@/stores/opencompany/project-store'

interface ProjectDetail {
  project: Project
  actions: string[]
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  approved: 'bg-blue-100 text-blue-700',
  forming: 'bg-cyan-100 text-cyan-700',
  staffing: 'bg-indigo-100 text-indigo-700',
  trial: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  running: 'bg-emerald-100 text-emerald-700',
  closing: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-200 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  suspended: 'bg-orange-100 text-orange-700',
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const [detail, setDetail] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'workflow' | 'trials' | 'agents'>('overview')
  const { transitionProject, activateProject } = useProjectStore()

  const load = () => {
    setLoading(true)
    ocApi.get<ProjectDetail>(`/api/projects/${params.id}`)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [params.id])

  const handleTransition = async (status: string) => {
    await transitionProject(params.id, status, 'admin')
    load()
  }

  const handleActivate = async () => {
    await activateProject(params.id, 'admin')
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    )
  }

  const { project, actions } = detail

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'workflow' as const, label: 'Workflow' },
    { id: 'trials' as const, label: 'Trials' },
    { id: 'agents' as const, label: 'Agent Pool' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-3 bg-card">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/projects" className="p-1 hover:bg-accent rounded">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg font-bold">{project.title}</h1>
          <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[project.status] || 'bg-accent'}`}>
            {project.status}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                tab === t.id ? 'bg-blue-500 text-white' : 'bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'overview' && (
          <div className="max-w-2xl space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm text-foreground/90">{project.description || 'No description'}</p>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-accent/50 rounded p-3">
                <p className="text-muted-foreground mb-0.5">Owner</p>
                <p className="font-medium">{project.owner}</p>
              </div>
              <div className="bg-accent/50 rounded p-3">
                <p className="text-muted-foreground mb-0.5">Sponsor</p>
                <p className="font-medium">{project.sponsor}</p>
              </div>
              <div className="bg-accent/50 rounded p-3">
                <p className="text-muted-foreground mb-0.5">Departments</p>
                <p className="font-medium">{project.departments?.join(', ') || 'None'}</p>
              </div>
              <div className="bg-accent/50 rounded p-3">
                <p className="text-muted-foreground mb-0.5">Trials</p>
                <p className="font-medium">{project.trialsPassed}/{project.trialsAttempted} passed</p>
              </div>
              <div className="bg-accent/50 rounded p-3">
                <p className="text-muted-foreground mb-0.5">Created</p>
                <p className="font-medium">{new Date(project.createdAt).toLocaleString()}</p>
              </div>
              <div className="bg-accent/50 rounded p-3">
                <p className="text-muted-foreground mb-0.5">Workflow</p>
                <p className="font-medium">{project.workflowId || 'None'}</p>
              </div>
            </div>

            {/* Actions */}
            {actions && actions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Available Actions</h3>
                <div className="flex gap-2">
                  {actions.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleTransition(action)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 capitalize"
                    >
                      {action === 'active' ? <Play className="w-3 h-3" /> :
                       action === 'suspended' ? <Pause className="w-3 h-3" /> :
                       action === 'completed' ? <CheckCircle className="w-3 h-3" /> : null}
                      {action}
                    </button>
                  ))}
                  {project.status === 'trial' && (
                    <button
                      onClick={handleActivate}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-500 text-white text-xs hover:bg-green-600"
                    >
                      <Play className="w-3 h-3" /> Full Activation
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'workflow' && (
          <WorkflowView projectId={params.id} />
        )}

        {tab === 'trials' && (
          <TrialRunner projectId={params.id} onTrialComplete={load} />
        )}

        {tab === 'agents' && (
          <AgentPoolPanel />
        )}
      </div>
    </div>
  )
}
