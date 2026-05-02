import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Details() {
  const navigate = useNavigate()
  const [people, setPeople] = useState(1)
  const [budget, setBudget] = useState(1000)
  const [days, setDays] = useState(3)
  const [timeOfYear, setTimeOfYear] = useState('')

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-text-primary mb-4">
        Trip Details
      </h1>
      <p className="text-text-secondary mb-10">
        Tell us a bit more about your trip.
      </p>

      <div className="w-full space-y-6 mb-10">
        <div className="flex flex-col items-start">
          <label className="text-text-primary text-sm mb-2">Number of people</label>
          <input
            type="number"
            min={1}
            max={20}
            value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
            className="w-full bg-surface border border-border rounded-lg px-5 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex flex-col items-start">
          <label className="text-text-primary text-sm mb-2">Budget ($)</label>
          <input
            type="number"
            min={0}
            step={100}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full bg-surface border border-border rounded-lg px-5 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex flex-col items-start">
          <label className="text-text-primary text-sm mb-2">Number of days</label>
          <input
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full bg-surface border border-border rounded-lg px-5 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex flex-col items-start">
          <label className="text-text-primary text-sm mb-2">Time of visit</label>
          <input
            type="text"
            value={timeOfYear}
            onChange={(e) => setTimeOfYear(e.target.value)}
            placeholder="e.g. Summer, March 2026"
            className="w-full bg-surface border border-border rounded-lg px-5 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      <button
        onClick={() => navigate('/interests')}
        className="bg-accent hover:bg-accent-hover text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200 text-base"
      >
        Continue
      </button>
    </div>
  )
}

export default Details
