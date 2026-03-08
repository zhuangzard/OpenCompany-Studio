'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { ocApi } from '@/hooks/use-opencompany-api'

interface EmergencyMessage {
  id: string
  from: string
  to: string
  condition: string
  justification: string
  message: string
  createdAt: string
  reviewStatus: 'pending' | 'justified' | 'unjustified'
  reviewedBy?: string
}

const CONDITION_COLORS: Record<string, string> = {
  security_breach: 'bg-red-100 text-red-700',
  data_loss_risk: 'bg-orange-100 text-orange-700',
  system_failure: 'bg-red-100 text-red-700',
  compliance_violation: 'bg-purple-100 text-purple-700',
  critical_deadline: 'bg-yellow-100 text-yellow-700',
}

const REVIEW_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  justified: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  unjustified: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
}

export function EmergencyPanel() {
  const [messages, setMessages] = useState<EmergencyMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)

  const load = () => {
    ocApi.get<{ messages: EmergencyMessage[] }>('/api/emergency/messages')
      .then((d) => setMessages(d.messages || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleReview = async (id: string, result: 'justified' | 'unjustified') => {
    setReviewing(id)
    try {
      await ocApi.post(`/api/emergency/${id}/review`, { reviewer: 'admin', result })
      load()
    } finally {
      setReviewing(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground p-4">Loading emergency messages...</p>
  }

  const pending = messages.filter((m) => m.reviewStatus === 'pending')
  const reviewed = messages.filter((m) => m.reviewStatus !== 'pending')

  return (
    <div className="space-y-6">
      {/* Pending reviews */}
      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Pending Review ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((m) => {
              const condColor = CONDITION_COLORS[m.condition] || 'bg-gray-100 text-gray-700'
              return (
                <div key={m.id} className="border-l-4 border-yellow-400 rounded-r-lg p-4 bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${condColor}`}>
                      {m.condition.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {m.from} → {m.to}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{m.message}</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    <strong>Justification:</strong> {m.justification}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(m.id, 'justified')}
                      disabled={reviewing === m.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded bg-green-500 text-white text-xs hover:bg-green-600 disabled:opacity-50"
                    >
                      <CheckCircle className="w-3 h-3" /> Justified
                    </button>
                    <button
                      onClick={() => handleReview(m.id, 'unjustified')}
                      disabled={reviewing === m.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-500 text-white text-xs hover:bg-red-600 disabled:opacity-50"
                    >
                      <XCircle className="w-3 h-3" /> Unjustified
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reviewed */}
      <div>
        <h3 className="text-sm font-semibold mb-3">
          {pending.length === 0 ? 'Emergency Messages' : 'Reviewed'}
        </h3>
        {reviewed.length === 0 && pending.length === 0 && (
          <div className="border rounded-lg p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No emergency messages</p>
            <p className="text-xs text-muted-foreground">Emergency bypasses will appear here when agents use the emergency channel</p>
          </div>
        )}
        <div className="space-y-2">
          {reviewed.map((m) => {
            const review = REVIEW_CONFIG[m.reviewStatus] || REVIEW_CONFIG.pending
            const ReviewIcon = review.icon
            const condColor = CONDITION_COLORS[m.condition] || 'bg-gray-100 text-gray-700'
            return (
              <div key={m.id} className="border rounded-md p-3 bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${condColor}`}>
                    {m.condition.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs">{m.from} → {m.to}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ml-auto flex items-center gap-1 ${review.bg} ${review.color}`}>
                    <ReviewIcon className="w-3 h-3" />
                    {m.reviewStatus}
                  </span>
                </div>
                <p className="text-xs text-foreground/90">{m.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(m.createdAt).toLocaleString()}
                  {m.reviewedBy && ` · Reviewed by ${m.reviewedBy}`}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
