'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Lightbulb } from 'lucide-react'
import { useResourcesStore } from '@/stores/opencompany/resources-store'
import { ocApi } from '@/hooks/use-opencompany-api'

interface Optimization {
  suggestion: string
  impact: string
  priority: string
}

export function BudgetDashboard() {
  const { expenses, efficiency, fetchExpenses, fetchEfficiency } = useResourcesStore()
  const [optimizations, setOptimizations] = useState<Optimization[]>([])

  useEffect(() => {
    fetchExpenses()
    fetchEfficiency()
    ocApi.get<{ optimizations: Optimization[] }>('/api/accounting/optimizations')
      .then((d) => setOptimizations(d.optimizations || []))
      .catch(() => {})
  }, [fetchExpenses, fetchEfficiency])

  return (
    <div className="max-w-4xl space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Spend</span>
          </div>
          <p className="text-2xl font-bold">${(expenses?.totalCost ?? 0).toLocaleString()}</p>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Tokens</span>
          </div>
          <p className="text-2xl font-bold">{(expenses?.totalTokens ?? 0).toLocaleString()}</p>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Departments</span>
          </div>
          <p className="text-2xl font-bold">{Object.keys(expenses?.byDepartment ?? {}).length}</p>
        </div>
      </div>

      {/* Department spending */}
      {expenses?.byDepartment && Object.keys(expenses.byDepartment).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Department Spending</h3>
          <div className="space-y-2">
            {Object.entries(expenses.byDepartment)
              .sort(([, a], [, b]) => b - a)
              .map(([dept, cost]) => {
                const maxCost = Math.max(...Object.values(expenses.byDepartment), 1)
                return (
                  <div key={dept} className="flex items-center gap-3 text-xs">
                    <span className="w-24 font-mono truncate capitalize">{dept}</span>
                    <div className="flex-1 h-3 rounded-full bg-accent overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${(cost / maxCost) * 100}%` }}
                      />
                    </div>
                    <span className="w-20 text-right font-mono">${cost.toLocaleString()}</span>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Efficiency ranking */}
      {efficiency.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Efficiency Ranking</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-accent/50 text-left text-muted-foreground">
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2 text-right">Cost/Task</th>
                  <th className="px-3 py-2 text-right">Tokens/Task</th>
                  <th className="px-3 py-2">Rating</th>
                </tr>
              </thead>
              <tbody>
                {efficiency.map((e) => (
                  <tr key={e.department} className="border-t hover:bg-accent/20">
                    <td className="px-3 py-2 font-mono capitalize">{e.department}</td>
                    <td className="px-3 py-2 text-right">${e.costPerTask?.toFixed(2) ?? '—'}</td>
                    <td className="px-3 py-2 text-right">{e.tokensPerTask?.toLocaleString() ?? '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        e.rating === 'efficient' ? 'bg-green-100 text-green-700' :
                        e.rating === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{e.rating}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Optimizations */}
      {optimizations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Optimization Suggestions
          </h3>
          <div className="space-y-2">
            {optimizations.map((o, i) => (
              <div key={i} className="border rounded-md p-3 bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    o.priority === 'high' ? 'bg-red-100 text-red-700' :
                    o.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>{o.priority}</span>
                </div>
                <p className="text-xs">{o.suggestion}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Impact: {o.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
