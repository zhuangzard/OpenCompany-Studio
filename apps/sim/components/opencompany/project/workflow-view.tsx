'use client'

import { useEffect, useState, useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  type NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { ocApi } from '@/hooks/use-opencompany-api'

interface WorkflowStatus {
  projectId: string
  progress: number
  nodes: Array<{ id: string; status: string; label: string }>
  edges: Array<{ from: string; to: string }>
}

interface WorkflowViewProps {
  projectId: string
}

const STATUS_STYLES: Record<string, { bg: string; border: string }> = {
  active: { bg: '#dcfce7', border: '#22c55e' },
  completed: { bg: '#dbeafe', border: '#3b82f6' },
  blocked: { bg: '#fee2e2', border: '#ef4444' },
  pending: { bg: '#f3f4f6', border: '#9ca3af' },
}

export function WorkflowView({ projectId }: WorkflowViewProps) {
  const [workflow, setWorkflow] = useState<WorkflowStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    ocApi.get<WorkflowStatus>(`/api/workflows/${projectId}/status`)
      .then(setWorkflow)
      .catch(() => setWorkflow(null))
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading workflow...</p>
  }

  if (!workflow || !workflow.nodes?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">No workflow configured for this project.</p>
        <p className="text-xs text-muted-foreground mt-1">Create a workflow via the API to visualize the DAG.</p>
      </div>
    )
  }

  // Convert to ReactFlow nodes/edges
  const rfNodes: Node[] = workflow.nodes.map((n, i) => {
    const style = STATUS_STYLES[n.status] || STATUS_STYLES.pending
    return {
      id: n.id,
      position: { x: 150 * (i % 4), y: 120 * Math.floor(i / 4) },
      data: {
        label: (
          <div className="text-center">
            <div className="text-xs font-medium">{n.label}</div>
            <div className="text-[10px] mt-0.5 capitalize">{n.status}</div>
          </div>
        ),
      },
      style: {
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
      },
    }
  })

  const rfEdges: Edge[] = workflow.edges.map((e, i) => ({
    id: `e-${i}`,
    source: e.from,
    target: e.to,
    animated: workflow.nodes.find((n) => n.id === e.from)?.status === 'active',
    style: { strokeWidth: 2 },
  }))

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Progress</span>
        <div className="flex-1 h-2 rounded-full bg-accent">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${workflow.progress}%` }}
          />
        </div>
        <span className="text-xs font-mono">{workflow.progress}%</span>
      </div>

      {/* ReactFlow canvas */}
      <div className="h-[500px] border rounded-lg overflow-hidden bg-background">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}
