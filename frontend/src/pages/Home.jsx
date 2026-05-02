import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-5xl font-semibold tracking-tight text-text-primary mb-4">
        Plan Your Next Trip
      </h1>
      <p className="text-text-secondary text-lg mb-10 max-w-md">
        Discover curated itineraries tailored to your preferences in minutes.
      </p>
      <button
        onClick={() => navigate('/destination')}
        className="bg-accent hover:bg-accent-hover text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200 text-base"
      >
        Start Booking
      </button>
    </div>
  )
}

export default Home
