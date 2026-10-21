import { useEffect, useState } from 'react'
import type { Asset } from '../types'
import type { Employee } from '../../employees/types'

type AssignmentDialogProps = {
  asset: Asset
  mode: 'assign' | 'return'
  employees: Employee[]
  submitting: boolean
  onClose: () => void
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
}

const returnConditions = [
  { value: 'good', label: 'Good' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'under_repair', label: 'Under repair' },
]

function AssignmentDialog({ asset, mode, employees, submitting, onClose, onSubmit }: AssignmentDialogProps) {
  const [employeeId, setEmployeeId] = useState('')
  const [assignedAt, setAssignedAt] = useState('')
  const [notes, setNotes] = useState('')
  const [returnedAt, setReturnedAt] = useState('')
  const [returnCondition, setReturnCondition] = useState('good')
  const [returnNotes, setReturnNotes] = useState('')

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (mode === 'assign') {
      if (!employeeId) return
      await onSubmit({ employeeId, assignedAt: assignedAt || undefined, notes: notes || undefined })
    } else {
      await onSubmit({
        returnedAt: returnedAt || undefined,
        returnCondition,
        returnNotes: returnNotes || undefined,
      })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              {mode === 'assign' ? 'Assign asset' : 'Return asset'}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{asset.fullName}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === 'assign' ? (
            <>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Employee</span>
                <select
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name} ({employee.employeeNumber})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Assigned date</span>
                <input
                  type="date"
                  value={assignedAt}
                  onChange={(event) => setAssignedAt(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Notes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                />
              </label>
            </>
          ) : (
            <>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Return date</span>
                <input
                  type="date"
                  value={returnedAt}
                  onChange={(event) => setReturnedAt(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Condition</span>
                <select
                  value={returnCondition}
                  onChange={(event) => setReturnCondition(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                >
                  {returnConditions.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Return notes</span>
                <textarea
                  value={returnNotes}
                  onChange={(event) => setReturnNotes(event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                />
              </label>
            </>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : mode === 'assign' ? 'Assign' : 'Return'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default AssignmentDialog
