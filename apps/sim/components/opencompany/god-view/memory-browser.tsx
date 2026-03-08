'use client'

import { useState, useEffect } from 'react'
import { Brain, Search } from 'lucide-react'
import { ocApi } from '@/hooks/use-opencompany-api'

type MemoryLayer = 'personal' | 'department' | 'project' | 'company'

interface MemoryEntry {
  key: string
  content: string
  author?: string
  timestamp?: string
  tags?: string[]
}

interface MemoryBrowserProps {
  agentId?: string
}

export function MemoryBrowser({ agentId }: MemoryBrowserProps) {
  const [layer, setLayer] = useState<MemoryLayer>('personal')
  const [entries, setEntries] = useState<MemoryEntry[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (agentId) params.set('agentId', agentId)
    params.set('layer', layer)

    ocApi.get<{ memories: MemoryEntry[] } | MemoryEntry[]>(`/api/memory/${layer}?${params}`)
      .then((d) => {
        const entries = Array.isArray(d) ? d : (d as { memories: MemoryEntry[] }).memories || []
        setEntries(entries)
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [layer, agentId])

  const layers: { id: MemoryLayer; label: string }[] = [
    { id: 'personal', label: 'Personal' },
    { id: 'department', label: 'Department' },
    { id: 'project', label: 'Project' },
    { id: 'company', label: 'Company' },
  ]

  const filtered = search
    ? entries.filter((e) =>
        e.content?.toLowerCase().includes(search.toLowerCase()) ||
        e.key?.toLowerCase().includes(search.toLowerCase())
      )
    : entries

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4" />
          <h3 className="text-sm font-medium">Memory Browser</h3>
          {agentId && <span className="text-xs text-muted-foreground">— {agentId}</span>}
        </div>

        {/* Layer tabs */}
        <div className="flex gap-1 mb-2">
          {layers.map((l) => (
            <button
              key={l.id}
              onClick={() => setLayer(l.id)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                layer === l.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded bg-accent text-xs border-0 outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

        {!loading && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No memories in this layer</p>
        )}

        {filtered.map((entry, i) => (
          <div key={i} className="border rounded-md p-3 bg-card">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-medium">{entry.key}</span>
              {entry.author && (
                <span className="text-[10px] text-muted-foreground">by {entry.author}</span>
              )}
              {entry.timestamp && (
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-xs text-foreground/90 whitespace-pre-wrap">{entry.content}</p>
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex gap-1 mt-1.5">
                {entry.tags.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded bg-accent text-[10px] text-muted-foreground">{t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
