'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, X, CheckCircle, AlertTriangle, ShieldAlert, Zap } from 'lucide-react'
import { useMessagesStore } from '@/stores/opencompany/messages-store'
import { useSOPStore } from '@/stores/opencompany/sop-store'
import { useResourcesStore } from '@/stores/opencompany/resources-store'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  timestamp: Date
  read: boolean
}

const TYPE_CONFIG = {
  success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-200' },
  error: { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-200' },
  info: { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200' },
}

const MAX_NOTIFICATIONS = 50

export function NotificationProvider() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [toasts, setToasts] = useState<Notification[]>([])

  const messages = useMessagesStore((s) => s.messages)
  const violations = useSOPStore((s) => s.violations)
  const alerts = useResourcesStore((s) => s.alerts)

  const addNotification = useCallback((type: Notification['type'], message: string) => {
    const n: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date(),
      read: false,
    }
    setNotifications((prev) => [n, ...prev].slice(0, MAX_NOTIFICATIONS))
    setToasts((prev) => [n, ...prev].slice(0, 3))

    // Auto-dismiss toast after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== n.id))
    }, 4000)
  }, [])

  // Track new SOP violations
  const [prevViolationCount, setPrevViolationCount] = useState(0)
  useEffect(() => {
    if (violations.length > prevViolationCount && prevViolationCount > 0) {
      const latest = violations[0]
      addNotification('error', `SOP violation: ${latest.senderId} → ${latest.receiverId}`)
    }
    setPrevViolationCount(violations.length)
  }, [violations.length, prevViolationCount, addNotification, violations])

  // Track budget alerts
  const [prevAlertCount, setPrevAlertCount] = useState(0)
  useEffect(() => {
    if (alerts.length > prevAlertCount && prevAlertCount > 0) {
      const latest = alerts[alerts.length - 1]
      addNotification('warning', `Budget alert: ${latest.message}`)
    }
    setPrevAlertCount(alerts.length)
  }, [alerts.length, prevAlertCount, addNotification, alerts])

  const unread = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <>
      {/* Bell button (to be placed in header) */}
      <div className="relative">
        <button
          onClick={() => { setShowPanel(!showPanel); if (!showPanel) markAllRead() }}
          className="p-1.5 rounded hover:bg-accent relative"
        >
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Panel */}
        {showPanel && (
          <div className="absolute right-0 top-full mt-1 w-80 max-h-96 overflow-y-auto bg-card border rounded-lg shadow-xl z-50">
            <div className="px-3 py-2 border-b flex items-center justify-between sticky top-0 bg-card">
              <span className="text-xs font-semibold">Notifications</span>
              <button
                onClick={() => setShowPanel(false)}
                className="p-0.5 hover:bg-accent rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                No notifications
              </div>
            ) : (
              <div className="py-1">
                {notifications.map((n) => {
                  const config = TYPE_CONFIG[n.type]
                  const Icon = config.icon
                  return (
                    <div key={n.id} className={`px-3 py-2 flex items-start gap-2 hover:bg-accent/30 ${!n.read ? 'bg-accent/10' : ''}`}>
                      <Icon className={`w-3.5 h-3.5 ${config.color} shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast stack */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => {
            const config = TYPE_CONFIG[toast.type]
            const Icon = config.icon
            return (
              <div
                key={toast.id}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg ${config.bg} ${config.border} animate-in slide-in-from-right`}
              >
                <Icon className={`w-4 h-4 ${config.color} shrink-0`} />
                <span className="text-xs flex-1">{toast.message}</span>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="p-0.5 hover:bg-accent rounded shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
