'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { ProjectCard } from '@/components/opencompany/project/project-card'
import { CreateWizard } from '@/components/opencompany/project/create-wizard'
import { useProjectStore, type Project } from '@/stores/opencompany/project-store'

const COLUMNS = [
  { status: 'draft', label: 'Draft', color: 'border-gray-300' },
  { status: 'approved', label: 'Approved', color: 'border-blue-300' },
  { status: 'forming', label: 'Forming', color: 'border-cyan-300' },
  { status: 'staffing', label: 'Staffing', color: 'border-indigo-300' },
  { status: 'trial', label: 'Trial', color: 'border-yellow-300' },
  { status: 'active', label: 'Active', color: 'border-green-300' },
  { status: 'running', label: 'Running', color: 'border-emerald-300' },
  { status: 'closing', label: 'Closing', color: 'border-orange-300' },
]

export default function ProjectsPage() {
  const { projects, fetchProjects } = useProjectStore()
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const projectsByStatus = (status: string) =>
    projects.filter((p) => p.status === status)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-3 flex items-center justify-between bg-card">
        <div>
          <h1 className="text-lg font-bold">Projects</h1>
          <p className="text-xs text-muted-foreground">{projects.length} total projects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
        >
          <Plus className="w-3 h-3" /> New Project
        </button>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 min-w-max h-full">
          {COLUMNS.map((col) => {
            const colProjects = projectsByStatus(col.status)
            return (
              <div
                key={col.status}
                className={`w-64 flex flex-col rounded-lg border-t-2 ${col.color} bg-accent/20`}
              >
                {/* Column header */}
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold">{col.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-muted-foreground">
                    {colProjects.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                  {colProjects.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                  {colProjects.length === 0 && (
                    <p className="text-[10px] text-muted-foreground text-center py-4">Empty</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Also show completed/cancelled/suspended below */}
      {projects.some((p) => ['completed', 'cancelled', 'suspended'].includes(p.status)) && (
        <div className="border-t px-6 py-3 bg-card">
          <p className="text-xs text-muted-foreground mb-2">Archived</p>
          <div className="flex gap-2 flex-wrap">
            {projects
              .filter((p) => ['completed', 'cancelled', 'suspended'].includes(p.status))
              .map((p) => (
                <span key={p.id} className={`text-[10px] px-2 py-1 rounded border ${
                  p.status === 'completed' ? 'border-green-300 bg-green-50 dark:bg-green-950/20' :
                  p.status === 'cancelled' ? 'border-red-300 bg-red-50 dark:bg-red-950/20' :
                  'border-orange-300 bg-orange-50 dark:bg-orange-950/20'
                }`}>
                  {p.title} ({p.status})
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Create wizard */}
      {showCreate && <CreateWizard onClose={() => setShowCreate(false)} />}
    </div>
  )
}
