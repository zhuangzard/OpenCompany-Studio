'use client'

import { useState } from 'react'
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'
import { useProjectStore } from '@/stores/opencompany/project-store'

interface CreateWizardProps {
  onClose: () => void
}

const DEPARTMENTS = [
  'engineering', 'research', 'legal', 'hr', 'finance', 'marketing', 'operations',
]

export function CreateWizard({ onClose }: CreateWizardProps) {
  const [step, setStep] = useState(1)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    owner: '',
    sponsor: '',
    departments: [] as string[],
  })
  const { createProject } = useProjectStore()

  const toggleDept = (d: string) => {
    setForm((f) => ({
      ...f,
      departments: f.departments.includes(d)
        ? f.departments.filter((x) => x !== d)
        : [...f.departments, d],
    }))
  }

  const canProceed = () => {
    if (step === 1) return form.title.trim().length > 0 && form.description.trim().length > 0
    if (step === 2) return form.departments.length > 0
    if (step === 3) return form.owner.trim().length > 0 && form.sponsor.trim().length > 0
    return true
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      await createProject({
        title: form.title,
        description: form.description,
        owner: form.owner,
        sponsor: form.sponsor,
      })
      onClose()
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-lg shadow-2xl border overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-bold">Create Project — Step {step}/3</h3>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="px-5 pt-4 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-blue-500' : 'bg-accent'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Project Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Customer Portal v2"
                  className="w-full px-3 py-2 rounded border bg-background text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the project goals and scope..."
                  rows={3}
                  className="w-full px-3 py-2 rounded border bg-background text-sm resize-none"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Select Departments</label>
              <div className="grid grid-cols-2 gap-2">
                {DEPARTMENTS.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDept(d)}
                    className={`px-3 py-2 rounded border text-xs text-left capitalize transition-colors ${
                      form.departments.includes(d)
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    {form.departments.includes(d) && <CheckCircle className="w-3 h-3 inline mr-1.5" />}
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Owner (Agent ID)</label>
                <input
                  type="text"
                  value={form.owner}
                  onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
                  placeholder="e.g. director-1"
                  className="w-full px-3 py-2 rounded border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Sponsor (Agent ID)</label>
                <input
                  type="text"
                  value={form.sponsor}
                  onChange={(e) => setForm((f) => ({ ...f, sponsor: e.target.value }))}
                  placeholder="e.g. ceo"
                  className="w-full px-3 py-2 rounded border bg-background text-sm"
                />
              </div>

              {/* Review */}
              <div className="bg-accent/30 rounded p-3 text-xs space-y-1">
                <p><strong>Title:</strong> {form.title}</p>
                <p><strong>Description:</strong> {form.description}</p>
                <p><strong>Departments:</strong> {form.departments.join(', ')}</p>
                <p><strong>Owner:</strong> {form.owner}</p>
                <p><strong>Sponsor:</strong> {form.sponsor}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs hover:bg-accent"
          >
            <ChevronLeft className="w-3 h-3" />
            {step > 1 ? 'Back' : 'Cancel'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 disabled:opacity-50"
            >
              Next <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={creating || !canProceed()}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-green-500 text-white text-xs hover:bg-green-600 disabled:opacity-50"
            >
              <CheckCircle className="w-3 h-3" />
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
