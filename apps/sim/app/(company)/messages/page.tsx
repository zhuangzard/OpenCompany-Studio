'use client'

import { useEffect, useState } from 'react'

interface MessageInfo {
  id: string
  sender_id: string
  receiver_id: string
  type: string
  content: string
  priority: string
  created_at: string
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-gray-500',
  normal: 'text-foreground',
  high: 'text-orange-500',
  urgent: 'text-red-500 font-bold',
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_OPENCOMPANY_API_URL || 'http://localhost:4000'
    fetch(`${apiUrl}/api/messages?limit=100`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Message Stream</h1>
      {messages.length === 0 ? (
        <p className="text-muted-foreground">No messages yet.</p>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="border rounded-lg p-3 bg-card">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{msg.sender_id}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">{msg.receiver_id}</span>
                  <span className="px-1.5 py-0.5 rounded text-xs bg-muted">{msg.type}</span>
                </div>
                <span className={`text-xs ${PRIORITY_COLORS[msg.priority] || ''}`}>
                  {msg.priority}
                </span>
              </div>
              <p className="text-sm mt-1">{msg.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(msg.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
