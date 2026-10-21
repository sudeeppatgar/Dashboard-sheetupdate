import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/categories', label: 'Categories', end: false },
  { to: '/make-models', label: 'Make models', end: false },
  { to: '/processors', label: 'Processors', end: false },
  { to: '/departments', label: 'Departments', end: false },
  { to: '/employees', label: 'Employees', end: false },
]

export function Sidebar() {
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
