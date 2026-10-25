import { NavLink } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { domainConfig } from '../config/domain'

const adminNavItems = [
  { to: '/dashboard', label: 'Dashboard', end: false },
  { to: '/records', label: domainConfig.recordPlural, end: false },
  { to: '/categories', label: domainConfig.categoryPlural, end: false },
  { to: '/record-types', label: domainConfig.typePlural, end: false },
  { to: '/groups', label: domainConfig.groupPlural, end: false },
  { to: '/people', label: domainConfig.personPlural, end: false },
]

const userNavItems = [
  { to: '/records', label: domainConfig.recordPlural, end: true },
]

export function Sidebar() {
  const { user } = useApp()
  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems

  return (
    <aside className="w-60 border-r bg-white p-4">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rounded-xl px-3 py-2 text-sm transition ${
                isActive ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
