import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Destination() {
  const navigate = useNavigate()
  const [destination, setDestination] = useState('')

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-text-primary mb-4">
        Where are you going?
      </h1>
      <p className="text-text-secondary mb-8">
        Enter your dream destination to get started.
      </p>
      <input
        type="text"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="City, country, or region"
        className="w-full bg-surface border border-border rounded-lg px-5 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors mb-8"
      />
      <button
        onClick={() => navigate('/details')}
        disabled={!destination.trim()}
        className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200 text-base"
      >
        Continue
      </button>
    </div>
  )
}

export default Destination
