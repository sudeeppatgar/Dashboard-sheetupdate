import { NavLink } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { domainConfig } from '../config/domain'

const adminNavItems = [
  { to: '/dashboard', label: 'Dashboard', end: false },
  { to: '/assets', label: domainConfig.recordPlural, end: false },
  { to: '/categories', label: domainConfig.categoryPlural, end: false },
  { to: '/make-models', label: domainConfig.modelPlural, end: false },
  { to: '/departments', label: domainConfig.groupPlural, end: false },
  { to: '/employees', label: domainConfig.personPlural, end: false },
]

const employerNavItems = [
  { to: '/dashboard', label: 'Dashboard', end: false },
  { to: '/employees', label: `My ${domainConfig.personPlural}`, end: false },
]

const userNavItems = [{ to: '/', label: `My ${domainConfig.recordPlural}`, end: true }]

export function Sidebar() {
  const { user } = useApp()
  const navItems = user?.role === 'admin' ? adminNavItems : user?.role === 'employer' ? employerNavItems : userNavItems

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
