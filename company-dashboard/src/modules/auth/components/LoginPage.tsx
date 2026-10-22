import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../../shared/context/useApp'
import Notice from '../../../shared/components/Notice'
import type { LoginFormValue } from '../types'
import { getErrorMessage } from '../../../shared/utils/getErrorMessage'

const initialForm: LoginFormValue = {
  email: 'admin@company.com',
  password: 'admin123',
}

const highlights = [
  ['Fast', 'Simple CRUD tables with inline edit actions.'],
  ['Responsive', 'Works on small screens with horizontal table scroll.'],
  ['Secure', 'Bearer token stored locally and attached to API calls.'],
] as const

function LoginPage() {
  const { signIn, setNotice, notice } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState<LoginFormValue>(initialForm)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setNotice(null)

    try {
      const name = await signIn(form.email, form.password)
      setNotice({ type: 'success', message: `Welcome back, ${name}.` })
      navigate('/', { replace: true })
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, 'Login failed. Check your credentials.'),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_35%)]" />
          <div className="relative space-y-6">
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-cyan-200">
              Company Dashboard
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Manage company assets from a clean table-first workspace.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Log in with the token-backed API, keep the session in localStorage,
                and manage categories, make models, processors, and assets in one place.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-1 text-sm text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/10 bg-white p-6 text-slate-900 shadow-xl shadow-slate-950/10 sm:p-8">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm text-slate-500">
              Use the seeded admin account or your own backend user.
            </p>
          </div>

          {notice ? <Notice notice={notice} className="mb-4" /> : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                type="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                placeholder="admin@company.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <input
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                type="password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                placeholder="admin123"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : 'Sign in to dashboard'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
