'use client'

import { useState, useEffect, useRef } from 'react'
import { ocApi } from '@/hooks/use-opencompany-api'
import { useMessagesStore } from '@/stores/opencompany/messages-store'
import { ArrowDown } from 'lucide-react'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  type: string
  content: string
  priority: string
  created_at: string
}

interface AgentInfo {
  id: string
  role: string
  name: string
  department: string
}

interface ConversationViewerProps {
  departmentId?: string
  agentId?: string
  agents: AgentInfo[]
}

const ROLE_COLORS: Record<string, string> = {
  ceo: 'bg-purple-100 text-purple-800 border-purple-300',
  director: 'bg-blue-100 text-blue-800 border-blue-300',
  engineer: 'bg-green-100 text-green-800 border-green-300',
  hr: 'bg-pink-100 text-pink-800 border-pink-300',
  legal: 'bg-orange-100 text-orange-800 border-orange-300',
  finance: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  research: 'bg-cyan-100 text-cyan-800 border-cyan-300',
}

export function ConversationViewer({ departmentId, agentId, agents }: ConversationViewerProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const liveMessages = useMessagesStore((s) => s.messages)

  useEffect(() => {
    setLoading(true)
    let url = '/api/messages?limit=100'
    if (agentId) url += `&agent=${agentId}`
    if (departmentId) url += `&department=${departmentId}`

    ocApi.get<{ messages: Message[] }>(url)
      .then((d) => setMessages(d.messages || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }, [departmentId, agentId])

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100)
  }

  const agentMap = new Map(agents.map((a) => [a.id, a]))

  const getAgentInfo = (id: string) => {
    const agent = agentMap.get(id)
    return { name: agent?.name || id, role: agent?.role || 'unknown' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Loading conversations...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-4 py-2 border-b bg-card">
        <h3 className="text-sm font-medium">
          {agentId ? `Messages: ${getAgentInfo(agentId).name}` :
           departmentId ? `Department: ${departmentId}` :
           'All Messages'}
        </h3>
        <p className="text-[10px] text-muted-foreground">{messages.length} messages</p>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No messages found</p>
        )}

        {messages.map((m) => {
          const sender = getAgentInfo(m.sender_id)
          const colorClass = ROLE_COLORS[sender.role] || 'bg-gray-100 text-gray-800 border-gray-300'

          return (
            <div key={m.id} className="flex gap-3 group">
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${colorClass}`}>
                {sender.role.slice(0, 2).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium">{sender.name}</span>
                  <span className="text-[10px] text-muted-foreground">→ {getAgentInfo(m.receiver_id).name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    m.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    m.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-accent text-muted-foreground'
                  }`}>{m.type}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 p-2 rounded-full bg-accent shadow-md hover:bg-accent/80"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
