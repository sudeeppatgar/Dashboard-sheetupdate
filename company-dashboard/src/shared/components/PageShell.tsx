import type { ReactNode } from 'react'

type PageShellProps = {
  children: ReactNode
}

function PageShell({ children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-4 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">{children}</div>
    </main>
  )
}

export default PageShell
