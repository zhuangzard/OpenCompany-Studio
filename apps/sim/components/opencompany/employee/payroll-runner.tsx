'use client'

import { useState } from 'react'
import { Play, X, CheckCircle } from 'lucide-react'
import { useCompensationStore, type PayrollReport } from '@/stores/opencompany/compensation-store'

export function PayrollRunner() {
  const [open, setOpen] = useState(false)
  const [period, setPeriod] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<PayrollReport | null>(null)
  const { runPayroll, fetchLeaderboard, fetchSalaryOverview } = useCompensationStore()

  const handleRun = async () => {
    setRunning(true)
    try {
      const report = await runPayroll(period)
      setResult(report)
      // Refresh related data
      fetchLeaderboard()
      fetchSalaryOverview()
    } catch {
      // Error handled by store
    } finally {
      setRunning(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-500 text-white text-xs hover:bg-green-600"
      >
        <Play className="w-3 h-3" /> Run Payroll
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => { setOpen(false); setResult(null) }} />
      <div className="relative w-full max-w-md bg-card rounded-lg shadow-2xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-bold">Run Monthly Payroll</h3>
          <button onClick={() => { setOpen(false); setResult(null) }} className="p-1 hover:bg-accent rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!result ? (
            <>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Period</label>
                <input
                  type="month"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2 rounded border bg-background text-sm"
                />
              </div>
              <button
                onClick={handleRun}
                disabled={running}
                className="w-full py-2 rounded bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50"
              >
                {running ? 'Processing...' : 'Run Payroll'}
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Payroll Complete</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-accent/50 rounded p-2">
                  <p className="text-muted-foreground">Period</p>
                  <p className="font-bold">{result.period}</p>
                </div>
                <div className="bg-accent/50 rounded p-2">
                  <p className="text-muted-foreground">Total Paid</p>
                  <p className="font-bold">${result.totalPaid.toLocaleString()}</p>
                </div>
              </div>

              {result.agents && result.agents.length > 0 && (
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b">
                        <th className="py-1">Agent</th>
                        <th className="py-1 text-right">Paid</th>
                        <th className="py-1 text-right">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.agents.map((a) => (
                        <tr key={a.agentId} className="border-b border-border/50">
                          <td className="py-1 font-mono">{a.agentId}</td>
                          <td className="py-1 text-right">${a.paid.toLocaleString()}</td>
                          <td className="py-1 text-right text-muted-foreground">
                            {a.adjustments?.join(', ') || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                onClick={() => { setOpen(false); setResult(null) }}
                className="w-full py-2 rounded bg-accent text-sm hover:bg-accent/80"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
