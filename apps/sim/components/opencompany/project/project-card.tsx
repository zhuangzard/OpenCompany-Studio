'use client'

import { useState } from 'react'
import { ChevronRight, Users, Layers, FlaskConical } from 'lucide-react'
import { useProjectStore, type Project } from '@/stores/opencompany/project-store'
import Link from 'next/link'

interface ProjectCardProps {
  project: Project
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

// Available transitions per status
const TRANSITIONS: Record<string, string[]> = {
  draft: ['approved'],
  approved: ['forming'],
  forming: ['staffing'],
  staffing: ['trial'],
  trial: ['active'],
  active: ['running', 'suspended'],
  running: ['closing', 'suspended'],
  closing: ['completed'],
  suspended: ['active'],
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [transitioning, setTransitioning] = useState(false)
  const { transitionProject } = useProjectStore()

  const availableTransitions = TRANSITIONS[project.status] || []

  const handleTransition = async (newStatus: string) => {
    setTransitioning(true)
    try {
      await transitionProject(project.id, newStatus, 'admin')
    } catch {
      // handled by store
    } finally {
      setTransitioning(false)
    }
  }

  return (
    <div className="bg-card border rounded-md p-3 space-y-2 shadow-sm">
      {/* Title */}
      <Link
        href={`/projects/${project.id}`}
        className="text-sm font-medium hover:underline block truncate"
      >
        {project.title}
      </Link>

      {/* Description */}
      {project.description && (
        <p className="text-[10px] text-muted-foreground line-clamp-2">{project.description}</p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {project.owner}
        </span>
        {project.departments && (
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {project.departments.length} depts
          </span>
        )}
      </div>

      {/* Trial status */}
      {project.trialsAttempted > 0 && (
        <div className="flex items-center gap-1.5 text-[10px]">
          <FlaskConical className="w-3 h-3" />
          <span className={project.trialsPassed > 0 ? 'text-green-600' : 'text-yellow-600'}>
            {project.trialsPassed}/{project.trialsAttempted} trials passed
          </span>
        </div>
      )}

      {/* Transition actions */}
      {availableTransitions.length > 0 && (
        <div className="flex gap-1 pt-1 border-t">
          {availableTransitions.map((t) => (
            <button
              key={t}
              onClick={() => handleTransition(t)}
              disabled={transitioning}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-accent hover:bg-accent/80 disabled:opacity-50 capitalize"
            >
              <ChevronRight className="w-2.5 h-2.5" />
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
