'use client'

import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Node,
  type Edge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { AgentNode, type AgentNodeData } from './agent-node'

interface AgentInfo {
  id: string
  role: string
  name: string
  status: string
  department: string
  supervisorId: string | null
}

interface CanvasViewProps {
  agents: AgentInfo[]
}

const nodeTypes = { agentNode: AgentNode }

// Auto-layout: hierarchical positioning by role level
const ROLE_LEVELS: Record<string, number> = {
  ceo: 0, director: 1, engineer: 2, reviewer: 2, research: 2,
  hr: 1, finance: 1, legal: 1,
}

function buildNodesAndEdges(agents: AgentInfo[]): { nodes: Node<AgentNodeData>[]; edges: Edge[] } {
  const levelGroups: Record<number, AgentInfo[]> = {}
  for (const agent of agents) {
    const level = ROLE_LEVELS[agent.role] ?? 2
    if (!levelGroups[level]) levelGroups[level] = []
    levelGroups[level].push(agent)
  }

  const nodes: Node<AgentNodeData>[] = []
  const edges: Edge[] = []

  for (const [levelStr, group] of Object.entries(levelGroups)) {
    const level = Number(levelStr)
    const spacing = 220
    const startX = -(group.length - 1) * spacing / 2

    group.forEach((agent, i) => {
      nodes.push({
        id: agent.id,
        type: 'agentNode',
        position: { x: startX + i * spacing, y: level * 180 },
        data: {
          role: agent.role,
          status: agent.status as AgentNodeData['status'],
          department: agent.department,
          messageStats: { sent: 0, received: 0, today: 0 },
        },
      })

      if (agent.supervisorId) {
        edges.push({
          id: `${agent.supervisorId}-${agent.id}`,
          source: agent.supervisorId,
          target: agent.id,
          animated: agent.status === 'working',
          style: { stroke: agent.status === 'working' ? '#3B82F6' : '#94A3B8', strokeWidth: 1.5 },
        })
      }
    })
  }

  return { nodes, edges }
}

const MINIMAP_ROLE_COLORS: Record<string, string> = {
  ceo: '#F59E0B', director: '#8B5CF6', engineer: '#3B82F6',
  reviewer: '#10B981', research: '#06B6D4', hr: '#F43F5E',
  finance: '#14B8A6', legal: '#A855F7',
}

export function CanvasView({ agents }: CanvasViewProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildNodesAndEdges(agents),
    [agents]
  )

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const nodeColor = useCallback((node: Node) => {
    const data = node.data as AgentNodeData
    return MINIMAP_ROLE_COLORS[data.role] ?? '#94A3B8'
  }, [])

  return (
    <div className="flex-1 h-full oc-canvas-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="rgba(100,116,139,0.3)" />
        <Controls position="bottom-right" />
        <MiniMap
          nodeColor={nodeColor}
          maskColor="rgba(0,0,0,0.1)"
          position="bottom-right"
          style={{ marginBottom: 50 }}
        />
      </ReactFlow>
    </div>
  )
}
