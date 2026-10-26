import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import Notice from '../../../shared/components/Notice'
import { useApp } from '../../../shared/context/useApp'
import { getErrorMessage } from '../../../shared/utils/getErrorMessage'
import type { RegisterAdminPayload } from '../types'

const initialForm: RegisterAdminPayload = {
  workspaceName: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  recordLabel: '',
  recordLabelPlural: '',
  personLabel: '',
  personLabelPlural: '',
}

const inputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100'

export default function RegisterPage() {
  const { signUp, setNotice, notice } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterAdminPayload>(initialForm)
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof RegisterAdminPayload, value: string) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (form.password !== form.confirmPassword) {
      setNotice({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    setSubmitting(true)
    setNotice(null)
    try {
      const name = await signUp({
        ...form,
        recordLabel: form.recordLabel?.trim() || undefined,
        recordLabelPlural: form.recordLabelPlural?.trim() || undefined,
        personLabel: form.personLabel?.trim() || undefined,
        personLabelPlural: form.personLabelPlural?.trim() || undefined,
      })
      setNotice({ type: 'success', message: `Welcome, ${name}. Your workspace is ready.` })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, 'Unable to create your workspace.') })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_35%)]" />
          <div className="relative space-y-6">
            <p className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-cyan-200">Start your workspace</p>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Create a private workspace for your organization.</h1>
              <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">Register independently, invite employees later, and keep your categories, records, groups, people, and record types separate from every other organization.</p>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              {['Your workspace is created with you as the administrator.', 'Employees you add will use your workspace automatically.', 'You can customize the words your team uses for records and people.'].map((item) => <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4"><span className="text-cyan-300">✓</span><span>{item}</span></div>)}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/10 bg-white p-6 text-slate-900 shadow-xl shadow-slate-950/10 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div><h2 className="text-2xl font-semibold tracking-tight">Create your workspace</h2><p className="mt-1 text-sm text-slate-500">Set up the first administrator account.</p></div>
            <Link to="/login" className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">Sign in</Link>
          </div>

          {notice ? <Notice notice={notice} className="mb-4" /> : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-slate-800">Workspace name <span className="text-rose-500">*</span></span><input value={form.workspaceName} onChange={(event) => update('workspaceName', event.target.value)} placeholder="Acme Operations" className={inputClass} required /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-800">Your name <span className="text-rose-500">*</span></span><input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Alex Morgan" className={inputClass} required /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-800">Email <span className="text-rose-500">*</span></span><input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="alex@example.com" className={inputClass} required /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-800">Password <span className="text-rose-500">*</span></span><input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="At least 8 characters" minLength={8} className={inputClass} required /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-800">Confirm password <span className="text-rose-500">*</span></span><input type="password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} placeholder="Repeat your password" minLength={8} className={inputClass} required /></label>
            </div>

            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
              <p className="text-sm font-semibold text-cyan-950">Optional workspace language</p>
              <p className="mt-1 text-xs leading-5 text-cyan-800">Use the terms your organization already understands. You can leave these blank to use the default labels.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cyan-900">One record</span><input value={form.recordLabel} onChange={(event) => update('recordLabel', event.target.value)} placeholder="Equipment" className={inputClass} /></label>
                <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cyan-900">Many records</span><input value={form.recordLabelPlural} onChange={(event) => update('recordLabelPlural', event.target.value)} placeholder="Equipment" className={inputClass} /></label>
                <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cyan-900">One person</span><input value={form.personLabel} onChange={(event) => update('personLabel', event.target.value)} placeholder="Employee" className={inputClass} /></label>
                <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cyan-900">Many people</span><input value={form.personLabelPlural} onChange={(event) => update('personLabelPlural', event.target.value)} placeholder="Employees" className={inputClass} /></label>
              </div>
            </div>

            <Button type="submit" variant="primary" disabled={submitting} className="w-full">{submitting ? 'Creating workspace…' : 'Create workspace'}</Button>
          </form>
        </section>
      </div>
    </main>
  )
}
