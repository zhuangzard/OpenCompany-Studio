'use client'

import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAgentsStore } from '@/stores/opencompany/agents-store'
import { useMessagesStore } from '@/stores/opencompany/messages-store'
import { useSOPStore } from '@/stores/opencompany/sop-store'

export function useOpenCompanySocket() {
  const socketRef = useRef<Socket | null>(null)
  const { setAgents, updateAgentStatus } = useAgentsStore()
  const { addMessage } = useMessagesStore()
  const { addViolation } = useSOPStore()

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_OPENCOMPANY_API_URL || 'http://localhost:4000'
    const socket = io(apiUrl, { path: '/socket.io' })
    socketRef.current = socket

    socket.on('init', (data: { agents: Array<{ id: string; role: string; name: string; status: string; department: string }> }) => {
      setAgents(data.agents.map((a) => ({
        ...a,
        status: a.status as 'idle' | 'working' | 'reviewing' | 'blocked' | 'offline',
      })))
    })

    socket.on('heartbeat', (data: { agents: Array<{ id: string; status: string }> }) => {
      for (const a of data.agents) {
        updateAgentStatus(a.id, a.status as 'idle' | 'working' | 'reviewing' | 'blocked' | 'offline')
      }
    })

    socket.on('update', (data: { type: string; data: Record<string, unknown> }) => {
      if (data.type === 'message_created') {
        addMessage({
          id: data.data.id as string,
          senderId: data.data.senderId as string,
          receiverId: data.data.receiverId as string,
          type: data.data.type as string,
          content: data.data.content as string,
          priority: data.data.priority as string,
          createdAt: data.data.createdAt as string,
        })
      }
    })

    socket.on('sop_violation', (data: { senderId: string; receiverId: string; content: string; timestamp: string }) => {
      addViolation(data)
    })

    return () => {
      socket.disconnect()
    }
  }, [setAgents, updateAgentStatus, addMessage, addViolation])

  return socketRef.current
}
