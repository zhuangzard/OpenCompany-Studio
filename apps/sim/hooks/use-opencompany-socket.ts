'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAgentsStore } from '@/stores/opencompany/agents-store'
import { useMessagesStore } from '@/stores/opencompany/messages-store'
import { useSOPStore } from '@/stores/opencompany/sop-store'
import { useCompensationStore } from '@/stores/opencompany/compensation-store'
import { usePerformanceStore } from '@/stores/opencompany/performance-store'
import { useProjectStore } from '@/stores/opencompany/project-store'
import { useResourcesStore } from '@/stores/opencompany/resources-store'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

export function useOpenCompanySocket() {
  const socketRef = useRef<Socket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')
  const { setAgents, updateAgentStatus } = useAgentsStore()
  const { addMessage } = useMessagesStore()
  const { addViolation } = useSOPStore()
  const { fetchLeaderboard } = useCompensationStore()
  const { fetchRating } = usePerformanceStore()
  const { fetchProjects } = useProjectStore()
  const { fetchPools, fetchAlerts } = useResourcesStore()

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_OPENCOMPANY_API_URL || 'http://localhost:4000'
    const socket = io(apiUrl, {
      path: '/socket.io',
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
    })
    socketRef.current = socket

    socket.on('connect', () => setConnectionStatus('connected'))
    socket.on('disconnect', () => setConnectionStatus('disconnected'))
    socket.on('reconnect_attempt', () => setConnectionStatus('connecting'))

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

    // New event handlers for expanded domain coverage

    socket.on('task_update', (data: { agentId: string; status: string }) => {
      updateAgentStatus(data.agentId, data.status as 'idle' | 'working' | 'reviewing' | 'blocked' | 'offline')
    })

    socket.on('resource_alert', () => {
      fetchPools()
      fetchAlerts()
    })

    socket.on('expense_recorded', () => {
      fetchPools()
    })

    socket.on('project_transition', () => {
      fetchProjects()
    })

    socket.on('performance_update', (data: { agentId: string }) => {
      fetchRating(data.agentId)
    })

    socket.on('compensation_update', () => {
      fetchLeaderboard()
    })

    return () => {
      socket.disconnect()
    }
  }, [setAgents, updateAgentStatus, addMessage, addViolation, fetchLeaderboard, fetchRating, fetchProjects, fetchPools, fetchAlerts])

  return { socket: socketRef.current, connectionStatus }
}
