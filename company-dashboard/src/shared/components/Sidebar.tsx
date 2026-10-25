import { NavLink } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { domainConfig } from '../config/domain'

const adminNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⌂', end: false },
  { to: '/records', label: domainConfig.recordPlural, icon: '▦', end: false },
  { to: '/categories', label: domainConfig.categoryPlural, icon: '◈', end: false },
  { to: '/record-types', label: domainConfig.typePlural, icon: '⚙', end: false },
  { to: '/groups', label: domainConfig.groupPlural, icon: '◫', end: false },
  { to: '/people', label: domainConfig.personPlural, icon: '●', end: false },
]

const userNavItems = [
  { to: '/records', label: domainConfig.recordPlural, icon: '▦', end: true },
]

type SidebarProps = {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user } = useApp()
  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar overlay"
        onClick={onToggle}
        className={`fixed inset-0 z-30 bg-slate-950/40 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside className={`fixed inset-y-0 left-0 z-40 flex min-h-screen shrink-0 flex-col border-r border-slate-200 bg-white p-4 shadow-xl transition-all duration-200 md:static md:shadow-none ${isOpen ? 'w-72 translate-x-0 md:w-64' : '-translate-x-full md:w-20 md:translate-x-0'}`}>
        <div className={`flex items-center gap-3 border-b border-slate-100 pb-4 ${isOpen ? 'justify-between' : 'justify-center'}`}>
          {isOpen ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">{domainConfig.appName}</p>
              <p className="mt-0.5 text-xs text-slate-500">Workspace navigation</p>
            </div>
          ) : <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white" title={domainConfig.appName}>{domainConfig.appName.slice(0, 1).toUpperCase()}</span>}
          <button type="button" onClick={onToggle} aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'} aria-expanded={isOpen} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700">
            <span aria-hidden="true">{isOpen ? '‹' : '›'}</span>
          </button>
        </div>

        <nav className="mt-5 flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={isOpen ? undefined : item.label}
            aria-label={item.label}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${isOpen ? 'justify-start' : 'justify-center'} ${
                isActive ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center text-base">{item.icon}</span>
            {isOpen ? <span className="truncate">{item.label}</span> : null}
          </NavLink>
        ))}
        </nav>
      </aside>
    </>
  )
}
