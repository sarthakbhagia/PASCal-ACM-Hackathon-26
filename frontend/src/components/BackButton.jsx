import { useNavigate, useLocation } from 'react-router-dom'

const backRoutes = {
  '/destination': '/',
  '/details': '/destination',
  '/interests': '/details',
  '/itinerary': '/interests',
}

function BackButton() {
  const navigate = useNavigate()
  const location = useLocation()

  const backPath = backRoutes[location.pathname]
  if (!backPath) return null

  return (
    <button
      onClick={() => navigate(backPath)}
      className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors text-sm"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  )
}

export default BackButton
