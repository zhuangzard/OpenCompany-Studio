'use client'

import { useState, useEffect } from 'react'
import { Clock, ShieldAlert, AlertTriangle, CheckCircle, Zap } from 'lucide-react'
import { ocApi } from '@/hooks/use-opencompany-api'

interface TimelineEvent {
  id: string
  type: 'violation' | 'emergency' | 'task' | 'resource'
  description: string
  timestamp: string
  severity: string
  details?: Record<string, unknown>
}

type FilterType = 'all' | 'violation' | 'emergency' | 'task' | 'resource'

const EVENT_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  violation: { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-100' },
  emergency: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100' },
  task: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
  resource: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100' },
}

export function EventTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    ocApi.get<{
      violations: Array<{ id: string; from_role: string; to_role: string; rule_id: string; timestamp: string }>
      emergencyMessages: Array<{ id: string; from: string; to: string; condition: string; message: string; createdAt: string; reviewStatus: string }>
    }>('/api/god/timeline?limit=100')
      .then((d) => {
        const timelineEvents: TimelineEvent[] = []

        // Map violations
        for (const v of (d.violations || [])) {
          timelineEvents.push({
            id: v.id || `v-${v.timestamp}`,
            type: 'violation',
            description: `SOP violation: ${v.from_role} → ${v.to_role} (${v.rule_id})`,
            timestamp: v.timestamp,
            severity: 'high',
          })
        }

        // Map emergency messages
        for (const e of (d.emergencyMessages || [])) {
          timelineEvents.push({
            id: e.id,
            type: 'emergency',
            description: `Emergency (${e.condition}): ${e.from} → ${e.to} — ${e.message}`,
            timestamp: e.createdAt,
            severity: 'critical',
            details: { reviewStatus: e.reviewStatus },
          })
        }

        // Sort by timestamp descending
        timelineEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setEvents(timelineEvents)
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'violation', label: 'Violations' },
    { id: 'emergency', label: 'Emergency' },
  ]

  const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4" />
          <h3 className="text-sm font-medium">Event Timeline</h3>
          <span className="text-xs text-muted-foreground">{events.length} events</span>
        </div>

        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filter === f.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading && <p className="text-sm text-muted-foreground">Loading timeline...</p>}

        {!loading && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No events recorded</p>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          {filtered.length > 0 && (
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          )}

          <div className="space-y-4">
            {filtered.map((event) => {
              const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.task
              const Icon = config.icon

              return (
                <div key={event.id} className="flex gap-3 relative">
                  {/* Dot on timeline */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${config.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                  </div>

                  {/* Event content */}
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bg} ${config.color}`}>
                        {event.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs">{event.description}</p>
                    {event.details?.reviewStatus != null && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${
                        String(event.details.reviewStatus) === 'justified' ? 'bg-green-100 text-green-700' :
                        String(event.details.reviewStatus) === 'unjustified' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {String(event.details.reviewStatus)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
