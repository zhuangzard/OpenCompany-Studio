'use client'

import { useEffect } from 'react'
import { DollarSign, Users, TrendingUp } from 'lucide-react'
import { useCompensationStore } from '@/stores/opencompany/compensation-store'

export function SalaryOverviewPanel() {
  const { salaryOverview, fetchSalaryOverview } = useCompensationStore()

  useEffect(() => {
    fetchSalaryOverview()
  }, [fetchSalaryOverview])

  if (!salaryOverview) {
    return (
      <div className="text-xs text-muted-foreground">Loading salary overview...</div>
    )
  }

  const summaryCards = [
    { label: 'Total Payroll', value: `$${salaryOverview.totalPayroll.toLocaleString()}`, icon: DollarSign },
    { label: 'Agents', value: salaryOverview.agentCount, icon: Users },
    { label: 'Average Salary', value: `$${salaryOverview.averageSalary.toLocaleString()}`, icon: TrendingUp },
    { label: 'Median Salary', value: `$${salaryOverview.medianSalary.toLocaleString()}`, icon: TrendingUp },
  ]

  const deptEntries = Object.entries(salaryOverview.departments || {})
  const maxDeptSalary = Math.max(...deptEntries.map(([, d]) => d.totalSalary), 1)

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="border rounded-md p-3 bg-card">
            <div className="flex items-center gap-1.5 mb-1">
              <card.icon className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{card.label}</span>
            </div>
            <p className="text-lg font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Department breakdown */}
      {deptEntries.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Department Breakdown</h4>
          <div className="space-y-1.5">
            {deptEntries.map(([dept, data]) => (
              <div key={dept} className="flex items-center gap-3 text-xs">
                <span className="w-24 font-mono truncate">{dept}</span>
                <div className="flex-1 h-2 rounded-full bg-accent overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(data.totalSalary / maxDeptSalary) * 100}%` }}
                  />
                </div>
                <span className="w-20 text-right font-mono text-muted-foreground">
                  ${data.totalSalary.toLocaleString()}
                </span>
                <span className="w-12 text-right text-muted-foreground">
                  {data.count} agents
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
