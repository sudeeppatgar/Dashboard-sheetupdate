import type { ReactNode } from 'react'

type PageHeroProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  children?: ReactNode
}

export default function PageHero({ eyebrow, title, description, actions, children }: PageHeroProps) {
  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-5 py-7 text-white sm:px-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </div>
  )
}
