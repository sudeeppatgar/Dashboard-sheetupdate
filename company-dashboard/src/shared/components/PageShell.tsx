import type { ReactNode } from 'react'

type PageShellProps = {
  children: ReactNode
}

function PageShell({ children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 py-4 text-slate-900">
      <div className="w-full space-y-6">{children}</div>
    </main>
  )
}

export default PageShell
