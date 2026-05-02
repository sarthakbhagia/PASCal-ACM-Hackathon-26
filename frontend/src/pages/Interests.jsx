import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const allTags = [
  'Beach',
  'Mountains',
  'City',
  'Food',
  'Culture',
  'Adventure',
  'Nightlife',
  'History',
  'Nature',
  'Relaxation',
  'Shopping',
  'Photography',
  'Wildlife',
  'Museums',
  'Hiking',
  'Water Sports',
]

function Interests() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState([])

  function toggleTag(tag) {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-text-secondary mb-8">
        Select all that apply.
      </p>

      <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-lg">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200 ${
              selected.includes(tag)
                ? 'bg-accent border-accent text-white'
                : 'bg-surface border-border text-text-secondary hover:border-text-muted hover:text-text-primary'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <button
        onClick={() => navigate('/search')}
        disabled={selected.length === 0}
        className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200 text-base"
      >
        Generate Itinerary
      </button>
    </div>
  )
}

export default Interests
