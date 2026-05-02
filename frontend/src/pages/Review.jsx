import { useNavigate } from 'react-router-dom'
import { useSelectedItems } from './Search'

const typeColors = {
  site: 'text-yellow-400 bg-yellow-500/10',
  food: 'text-green-400 bg-green-500/10',
  activity: 'text-orange-400 bg-orange-500/10',
}

const typeLabels = {
  site: 'Place',
  food: 'Food',
  activity: 'Activity',
}

function Review() {
  const navigate = useNavigate()
  const { selectedItems, removeItem } = useSelectedItems()

  if (selectedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-text-secondary text-lg mb-6">No items selected yet.</p>
        <button
          onClick={() => navigate('/search')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
        >
          Go Back to Search
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-6">
        <p className="text-text-secondary">
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected for your trip.
        </p>
        <button
          onClick={() => navigate('/search')}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          + Add More
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-4 space-y-3">
        {selectedItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg bg-surface border border-border">
            <div className={`flex-shrink-0 w-10 h-10 rounded-md ${typeColors[item.type]} flex items-center justify-center text-xs font-bold`}>
              {typeLabels[item.type][0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${typeColors[item.type]}`}>
                  {typeLabels[item.type]}
                </span>
                {item.subtype && (
                  <span className="text-xs text-text-muted">{item.subtype}</span>
                )}
              </div>
              <h4 className="text-text-primary text-sm font-semibold truncate">{item.title}</h4>
              <p className="text-text-muted text-xs">{item.location}</p>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/itinerary')}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-3 rounded-lg transition-colors text-base"
      >
        Generate Itinerary
      </button>
    </div>
  )
}

export default Review
