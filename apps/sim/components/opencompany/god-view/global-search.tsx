'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, User } from 'lucide-react'
import { ocApi } from '@/hooks/use-opencompany-api'

interface SearchResult {
  agents: Array<{ id: string; role: string; name: string; department: string; status: string }>
  query: string
}

interface GlobalSearchProps {
  onClose: () => void
  onSelectAgent: (id: string) => void
}

export function GlobalSearch({ onClose, onSelectAgent }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      return
    }

    const timer = setTimeout(() => {
      setLoading(true)
      ocApi.get<SearchResult>(`/api/god/search?q=${encodeURIComponent(query)}`)
        .then(setResults)
        .catch(() => setResults(null))
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Search panel */}
      <div className="relative w-full max-w-lg bg-card rounded-lg shadow-2xl border overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search agents, messages, tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">Searching...</div>
          )}

          {!loading && query && results?.agents?.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">No results found</div>
          )}

          {!loading && results?.agents && results.agents.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-1 text-[10px] font-semibold text-muted-foreground uppercase">Agents</p>
              {results.agents.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onSelectAgent(a.id)}
                  className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-accent transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{a.name || a.id}</p>
                    <p className="text-[10px] text-muted-foreground">{a.role} · {a.department} · {a.status}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!query && (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              Type to search across agents, messages, and tasks
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t flex items-center gap-4 text-[10px] text-muted-foreground">
          <span><kbd className="px-1 py-0.5 rounded bg-accent">↑↓</kbd> Navigate</span>
          <span><kbd className="px-1 py-0.5 rounded bg-accent">↵</kbd> Select</span>
          <span><kbd className="px-1 py-0.5 rounded bg-accent">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  )
}
