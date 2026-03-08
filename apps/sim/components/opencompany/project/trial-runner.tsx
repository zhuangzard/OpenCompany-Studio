'use client'

import { useEffect, useState } from 'react'
import { FlaskConical, Play, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { ocApi } from '@/hooks/use-opencompany-api'

interface Trial {
  id: string
  projectId: string
  status: string
  score?: number
  passed?: boolean
  scenarios: Array<{
    id: string
    name: string
    passed?: boolean
    actual?: string
  }>
}

interface TrialRunnerProps {
  projectId: string
  onTrialComplete?: () => void
}

export function TrialRunner({ projectId, onTrialComplete }: TrialRunnerProps) {
  const [trials, setTrials] = useState<Trial[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [evaluating, setEvaluating] = useState<string | null>(null)

  const fetchTrials = () => {
    ocApi.get<{ trials: Trial[] }>(`/api/trials/${projectId}`)
      .then((d) => setTrials(d.trials || []))
      .catch(() => setTrials([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTrials() }, [projectId])

  const handleCreate = async () => {
    setCreating(true)
    try {
      await ocApi.post('/api/trials', { projectId })
      fetchTrials()
    } finally {
      setCreating(false)
    }
  }

  const handleEvaluate = async (trialId: string) => {
    setEvaluating(trialId)
    try {
      await ocApi.post(`/api/trials/${trialId}/evaluate`, {})
      fetchTrials()
      onTrialComplete?.()
    } finally {
      setEvaluating(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading trials...</p>
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4" />
          <h3 className="text-sm font-semibold">Trial Runs</h3>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 disabled:opacity-50"
        >
          <Play className="w-3 h-3" /> {creating ? 'Creating...' : 'New Trial'}
        </button>
      </div>

      {trials.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No trials yet. Create one to validate the project.
        </p>
      )}

      {trials.map((trial) => (
        <div key={trial.id} className="border rounded-lg overflow-hidden">
          {/* Trial header */}
          <div className="px-4 py-3 bg-accent/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {trial.passed === true ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : trial.passed === false ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : (
                <FlaskConical className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm font-medium">Trial {trial.id.slice(0, 8)}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                trial.status === 'passed' ? 'bg-green-100 text-green-700' :
                trial.status === 'failed' ? 'bg-red-100 text-red-700' :
                trial.status === 'running' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {trial.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {trial.score != null && (
                <span className="text-xs text-muted-foreground">Score: {trial.score}%</span>
              )}
              {trial.status === 'running' && (
                <button
                  onClick={() => handleEvaluate(trial.id)}
                  disabled={evaluating === trial.id}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-green-500 text-white text-[10px] hover:bg-green-600 disabled:opacity-50"
                >
                  <CheckCircle className="w-3 h-3" />
                  {evaluating === trial.id ? 'Evaluating...' : 'Evaluate'}
                </button>
              )}
            </div>
          </div>

          {/* Scenarios */}
          <div className="p-3 space-y-1">
            {trial.scenarios?.map((s) => (
              <div key={s.id} className="flex items-center gap-2 py-1 text-xs">
                {s.passed === true ? (
                  <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                ) : s.passed === false ? (
                  <XCircle className="w-3 h-3 text-red-500 shrink-0" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-muted-foreground shrink-0" />
                )}
                <span className="font-mono">{s.name || s.id}</span>
                {s.actual && (
                  <span className="text-muted-foreground truncate ml-auto">{s.actual}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
