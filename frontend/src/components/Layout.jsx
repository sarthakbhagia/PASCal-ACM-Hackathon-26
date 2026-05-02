import { Outlet } from 'react-router-dom'
import BackButton from './BackButton'

function Layout() {
  return (
    <div className="min-h-screen bg-background px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Trip Planner</h1>
        <BackButton />
      </div>
      <Outlet />
    </div>
  )
}

export default Layout
