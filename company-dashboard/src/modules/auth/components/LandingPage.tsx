import { Link } from 'react-router-dom'
import { domainConfig } from '../../../shared/config/domain'

const features = [
  {
    number: '01',
    title: `Define your ${domainConfig.typePlural.toLowerCase()}`,
    description: `Create reusable templates with statuses and custom fields for every kind of ${domainConfig.recordSingular.toLowerCase()} your organization manages.`,
    icon: '◈',
  },
  {
    number: '02',
    title: `Organize ${domainConfig.recordPlural.toLowerCase()}`,
    description: `Keep details, categories, groups, locations, and history together so your team can find the right information quickly.`,
    icon: '▦',
  },
  {
    number: '03',
    title: 'Assign and stay aligned',
    description: `Connect records to the right people, control group-based assignments, and track every handoff from one workspace.`,
    icon: '↗',
  },
]

const stats = [
  ['One workspace', 'for the work that matters'],
  ['Clear ownership', 'from assignment to completion'],
  ['Private by design', 'with isolated organization data'],
]

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="relative isolate">
        <div className="pointer-events-none absolute -left-48 top-[-18rem] h-[38rem] w-[38rem] rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-[-16rem] top-24 h-[34rem] w-[34rem] rounded-full bg-blue-600/20 blur-3xl" />

        <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-3" aria-label={`${domainConfig.appName} home`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/20">{domainConfig.appName.slice(0, 1).toUpperCase()}</span>
            <span className="text-sm font-bold tracking-wide text-white sm:text-base">{domainConfig.appName}</span>
          </Link>
          <nav className="flex items-center gap-3" aria-label="Public navigation">
            <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:px-4">Log in</Link>
            <Link to="/register" className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 sm:px-4">Create workspace</Link>
          </nav>
        </header>

        <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1fr_0.9fr] lg:px-10 lg:pb-28 lg:pt-28">
          <div className="max-w-2xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              A clearer way to run your workspace
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Turn scattered work into a <span className="text-cyan-300">shared source of truth.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              {domainConfig.appTagline} Build a workspace that fits your organization, gives every {domainConfig.recordSingular.toLowerCase()} a clear place, and helps your team move work forward.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-950/30 transition hover:bg-cyan-200">
                Start your workspace
                <span aria-hidden="true">→</span>
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
                Sign in to your account
              </Link>
            </div>
            <p className="mt-5 text-xs text-slate-500">Create an admin workspace in minutes. Add employees when your team is ready.</p>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-cyan-300/10 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/15 bg-white/[0.08] p-3 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/90 p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Workspace overview</p>
                    <h2 className="mt-1 text-lg font-semibold text-white">Everything in one view</h2>
                  </div>
                  <span className="rounded-xl bg-emerald-400/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300">Live</span>
                </div>
                <div className="grid grid-cols-2 gap-3 py-5 sm:grid-cols-4">
                  {[
                    ['Records', '248', 'bg-cyan-400'],
                    ['Types', '12', 'bg-violet-400'],
                    ['Groups', '08', 'bg-emerald-400'],
                    ['People', '64', 'bg-blue-400'],
                  ].map(([label, value, color]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                      <span className={`mb-3 block h-1.5 w-7 rounded-full ${color}`} />
                      <p className="text-xl font-semibold text-white">{value}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    ['Laptop inventory', 'Assigned · Engineering', '98%'],
                    ['Vendor agreements', 'In progress · Finance', '72%'],
                    ['Site inspections', 'Available · Operations', '46%'],
                  ].map(([name, detail, progress]) => (
                    <div key={name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0"><p className="truncate text-sm font-medium text-white">{name}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>
                        <span className="text-xs font-semibold text-cyan-300">{progress}</span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300" style={{ width: progress }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-y border-white/10 bg-white/[0.035]">
          <div className="mx-auto grid max-w-7xl gap-px px-5 sm:grid-cols-3 sm:px-8 lg:px-10">
            {stats.map(([value, description]) => (
              <div key={value} className="border-white/10 py-6 sm:border-r sm:px-7 sm:first:pl-0 sm:last:border-r-0">
                <p className="text-sm font-semibold text-white">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Simple by design</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">A practical system for the way your team already works.</h2>
            <p className="mt-4 text-base leading-7 text-slate-400">Start with the building blocks of your organization, then let the workspace keep the details connected and visible.</p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.number} className="group rounded-3xl border border-white/10 bg-white/[0.045] p-6 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.07]">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-xl text-cyan-300">{feature.icon}</span>
                  <span className="text-xs font-semibold tracking-[0.2em] text-slate-600">{feature.number}</span>
                </div>
                <h3 className="mt-8 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
          <div className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300/15 via-blue-500/10 to-white/[0.04] p-8 sm:p-12">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Ready when you are</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Give your organization a workspace it can rely on.</h2>
                <p className="mt-4 text-sm leading-6 text-slate-300">Create your private workspace, configure your first record type, and bring your team into one clear operating rhythm.</p>
              </div>
              <Link to="/register" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-100">Create your workspace <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>

        <footer className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-white/10 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span>{domainConfig.appName}</span>
          <span>Organize clearly. Work confidently.</span>
        </footer>
      </div>
    </main>
  )
}
