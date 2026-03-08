'use client'

import { useState, useEffect } from 'react'
import { NavTree, type NavSelection } from '@/components/opencompany/god-view/nav-tree'
import { ConversationViewer } from '@/components/opencompany/god-view/conversation-viewer'
import { AgentInspector } from '@/components/opencompany/god-view/agent-inspector'
import { MemoryBrowser } from '@/components/opencompany/god-view/memory-browser'
import { EventTimeline } from '@/components/opencompany/god-view/event-timeline'
import { GlobalSearch } from '@/components/opencompany/god-view/global-search'
import { useAgentsStore } from '@/stores/opencompany/agents-store'
import { ocApi } from '@/hooks/use-opencompany-api'

interface AgentInfo {
  id: string
  role: string
  name: string
  status: string
  department: string
}

export default function GodViewPage() {
  const [selection, setSelection] = useState<NavSelection | null>(null)
  const [inspectedAgent, setInspectedAgent] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [agents, setAgents] = useState<AgentInfo[]>([])

  useEffect(() => {
    ocApi.get<{ agents: AgentInfo[] }>('/api/agents')
      .then((d) => setAgents(d.agents || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // When selecting an agent in nav tree, also inspect it
  useEffect(() => {
    if (selection?.type === 'agent') {
      setInspectedAgent(selection.id)
    }
  }, [selection])

  const renderCenter = () => {
    if (!selection) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">God View</p>
            <p className="text-sm">Select a department, agent, or category from the left panel</p>
            <p className="text-xs mt-4 text-muted-foreground">Press <kbd className="px-1.5 py-0.5 rounded bg-accent text-[10px]">⌘K</kbd> to search</p>
          </div>
        </div>
      )
    }

    switch (selection.type) {
      case 'conversations':
        return <ConversationViewer departmentId={selection.id} agents={agents} />
      case 'memory':
        return <MemoryBrowser agentId={selection.id} />
      case 'timeline':
        return <EventTimeline />
      case 'agent':
        return <ConversationViewer agentId={selection.id} agents={agents} />
      default:
        return <ConversationViewer departmentId={selection.id} agents={agents} />
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-3 flex items-center justify-between bg-card">
        <h1 className="text-lg font-bold">God View</h1>
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent text-xs text-muted-foreground hover:text-foreground"
        >
          Search... <kbd className="text-[10px]">⌘K</kbd>
        </button>
      </div>

      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Nav tree */}
        <div className="w-64 border-r bg-card overflow-y-auto">
          <NavTree
            agents={agents}
            onSelect={setSelection}
            selected={selection}
          />
        </div>

        {/* Center: Main content */}
        <div className="flex-1 overflow-y-auto bg-background">
          {renderCenter()}
        </div>

        {/* Right: Agent inspector */}
        {inspectedAgent && (
          <div className="w-80 border-l bg-card overflow-y-auto">
            <AgentInspector
              agentId={inspectedAgent}
              onClose={() => setInspectedAgent(null)}
            />
          </div>
        )}
      </div>

      {/* Global search overlay */}
      {searchOpen && (
        <GlobalSearch
          onClose={() => setSearchOpen(false)}
          onSelectAgent={(id) => {
            setInspectedAgent(id)
            setSelection({ type: 'agent', id })
            setSearchOpen(false)
          }}
        />
      )}
    </div>
  )
}
