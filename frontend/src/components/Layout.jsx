import { Outlet } from 'react-router-dom'

function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xl">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
