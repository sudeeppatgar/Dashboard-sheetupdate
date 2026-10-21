import { Link } from 'react-router-dom'

export function Sidebar() {
  return (
    <aside className="w-60 border-r bg-white p-4">
      <nav className="flex flex-col gap-2">
        <Link to="/">Dashboard</Link>
        <Link to="/assets">Assets</Link>
        <Link to="/departments">Departments</Link>
        <Link to="/employees">Employees</Link>
      </nav>
    </aside>
  )
}
