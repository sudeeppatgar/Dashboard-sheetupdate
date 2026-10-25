import type { ReactNode } from 'react'

type PageShellProps = {
  children: ReactNode
}

function PageShell({ children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-3 py-4 text-slate-900 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1600px] space-y-6">{children}</div>
    </main>
  )
}

export default PageShell
