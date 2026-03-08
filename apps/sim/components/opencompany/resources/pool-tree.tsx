'use client'

import { useMemo } from 'react'
import { ChevronRight, Database } from 'lucide-react'
import { useResourcesStore, type ResourcePool } from '@/stores/opencompany/resources-store'

interface PoolTreeProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500',
  warning: 'bg-yellow-500',
  throttled: 'bg-orange-500',
  frozen: 'bg-red-500',
}

interface TreeNode {
  pool: ResourcePool
  children: TreeNode[]
}

export function PoolTree({ selectedId, onSelect }: PoolTreeProps) {
  const { pools } = useResourcesStore()

  // Build tree from flat list
  const tree = useMemo(() => {
    const map = new Map<string, TreeNode>()
    const roots: TreeNode[] = []

    for (const p of pools) {
      map.set(p.id, { pool: p, children: [] })
    }

    for (const p of pools) {
      const node = map.get(p.id)!
      if (p.parentId && map.has(p.parentId)) {
        map.get(p.parentId)!.children.push(node)
      } else {
        roots.push(node)
      }
    }

    return roots
  }, [pools])

  // Calculate usage % for a pool
  const getUsage = (pool: ResourcePool): number => {
    const quotas = Object.values(pool.quotas || {})
    if (quotas.length === 0) return 0
    const total = quotas.reduce((s, q) => s + (q.limit > 0 ? (q.used / q.limit) * 100 : 0), 0)
    return Math.round(total / quotas.length)
  }

  const renderNode = (node: TreeNode, depth: number) => {
    const usage = getUsage(node.pool)
    const statusColor = STATUS_COLORS[node.pool.status] || 'bg-gray-400'

    return (
      <div key={node.pool.id}>
        <button
          onClick={() => onSelect(node.pool.id)}
          className={`w-full text-left px-3 py-2 flex items-center gap-2 text-xs transition-colors ${
            selectedId === node.pool.id
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent/50'
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {node.children.length > 0 && (
            <ChevronRight className="w-3 h-3 shrink-0" />
          )}
          <div className={`w-2 h-2 rounded-full shrink-0 ${statusColor}`} />
          <span className="flex-1 truncate">{node.pool.name}</span>
          {/* Usage bar */}
          <div className="w-16 h-1.5 rounded-full bg-accent shrink-0">
            <div
              className={`h-full rounded-full ${
                usage > 90 ? 'bg-red-500' : usage > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usage, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground w-8 text-right">{usage}%</span>
        </button>

        {node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="py-2">
      <div className="px-4 py-2 flex items-center gap-2">
        <Database className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">Resource Pools</span>
      </div>

      {pools.length === 0 && (
        <p className="text-xs text-muted-foreground px-4 py-4">No resource pools configured</p>
      )}

      {tree.map((node) => renderNode(node, 0))}
    </div>
  )
}
