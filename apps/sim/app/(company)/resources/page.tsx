'use client'

import { useEffect, useState } from 'react'
import { PoolTree } from '@/components/opencompany/resources/pool-tree'
import { PoolDetail } from '@/components/opencompany/resources/pool-detail'
import { BudgetDashboard } from '@/components/opencompany/resources/budget-dashboard'
import { ExpenseView } from '@/components/opencompany/resources/expense-view'
import { EnforcementPanel } from '@/components/opencompany/resources/enforcement-panel'
import { useResourcesStore } from '@/stores/opencompany/resources-store'

type Tab = 'pools' | 'budget' | 'expenses' | 'enforcement'

export default function ResourcesPage() {
  const [tab, setTab] = useState<Tab>('pools')
  const [selectedPool, setSelectedPool] = useState<string | null>(null)
  const { fetchPools, fetchHealth } = useResourcesStore()

  useEffect(() => {
    fetchPools()
    fetchHealth()
  }, [fetchPools, fetchHealth])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'pools', label: 'Resource Pools' },
    { id: 'budget', label: 'Budget' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'enforcement', label: 'Enforcement' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-3 bg-card">
        <h1 className="text-lg font-bold mb-2">Resources & Budget</h1>
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                tab === t.id ? 'bg-blue-500 text-white' : 'bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'pools' && (
          <div className="flex h-full">
            <div className="w-72 border-r overflow-y-auto">
              <PoolTree
                selectedId={selectedPool}
                onSelect={setSelectedPool}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {selectedPool ? (
                <PoolDetail poolId={selectedPool} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">Select a resource pool from the tree</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'budget' && (
          <div className="overflow-y-auto p-6">
            <BudgetDashboard />
          </div>
        )}

        {tab === 'expenses' && (
          <div className="overflow-y-auto p-6">
            <ExpenseView />
          </div>
        )}

        {tab === 'enforcement' && (
          <div className="overflow-y-auto p-6">
            <EnforcementPanel />
          </div>
        )}
      </div>
    </div>
  )
}
