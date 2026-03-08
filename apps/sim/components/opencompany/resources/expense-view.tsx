'use client'

import { useEffect } from 'react'
import { useResourcesStore } from '@/stores/opencompany/resources-store'

export function ExpenseView() {
  const { expenses, fetchExpenses } = useResourcesStore()

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  if (!expenses) {
    return <p className="text-sm text-muted-foreground">Loading expenses...</p>
  }

  const agentEntries = Object.entries(expenses.byAgent || {}).sort(([, a], [, b]) => b - a)
  const deptEntries = Object.entries(expenses.byDepartment || {}).sort(([, a], [, b]) => b - a)

  return (
    <div className="max-w-4xl space-y-6">
      {/* Aggregate stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border rounded-md p-3 bg-card">
          <p className="text-[10px] text-muted-foreground">Total Cost</p>
          <p className="text-lg font-bold">${expenses.totalCost.toLocaleString()}</p>
        </div>
        <div className="border rounded-md p-3 bg-card">
          <p className="text-[10px] text-muted-foreground">Total Tokens</p>
          <p className="text-lg font-bold">{expenses.totalTokens.toLocaleString()}</p>
        </div>
        <div className="border rounded-md p-3 bg-card">
          <p className="text-[10px] text-muted-foreground">Departments</p>
          <p className="text-lg font-bold">{deptEntries.length}</p>
        </div>
        <div className="border rounded-md p-3 bg-card">
          <p className="text-[10px] text-muted-foreground">Agents</p>
          <p className="text-lg font-bold">{agentEntries.length}</p>
        </div>
      </div>

      {/* By Department */}
      {deptEntries.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">By Department</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-accent/50 text-left text-muted-foreground">
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2 text-right">Cost</th>
                  <th className="px-3 py-2">Share</th>
                </tr>
              </thead>
              <tbody>
                {deptEntries.map(([dept, cost]) => (
                  <tr key={dept} className="border-t">
                    <td className="px-3 py-2 font-mono capitalize">{dept}</td>
                    <td className="px-3 py-2 text-right font-mono">${cost.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <div className="w-24 h-1.5 rounded-full bg-accent inline-block align-middle">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${expenses.totalCost > 0 ? (cost / expenses.totalCost) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground ml-2">
                        {expenses.totalCost > 0 ? Math.round((cost / expenses.totalCost) * 100) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* By Agent */}
      {agentEntries.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">By Agent</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-accent/50 text-left text-muted-foreground">
                  <th className="px-3 py-2">Agent</th>
                  <th className="px-3 py-2 text-right">Cost</th>
                  <th className="px-3 py-2">Share</th>
                </tr>
              </thead>
              <tbody>
                {agentEntries.map(([agent, cost]) => (
                  <tr key={agent} className="border-t">
                    <td className="px-3 py-2 font-mono">{agent}</td>
                    <td className="px-3 py-2 text-right font-mono">${cost.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <div className="w-24 h-1.5 rounded-full bg-accent inline-block align-middle">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${expenses.totalCost > 0 ? (cost / expenses.totalCost) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground ml-2">
                        {expenses.totalCost > 0 ? Math.round((cost / expenses.totalCost) * 100) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deptEntries.length === 0 && agentEntries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No expense data available</p>
      )}
    </div>
  )
}
