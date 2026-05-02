import { useState, useMemo, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import searchablePlaces from '../data/searchablePlaces'

export const SelectedItemsContext = createContext()

export function useSelectedItems() {
  return useContext(SelectedItemsContext)
}

const categories = [
  { key: 'all', label: 'All' },
  { key: 'site', label: 'Places' },
  { key: 'food', label: 'Food' },
  { key: 'activity', label: 'Activities' },
]

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

function SearchCard({ item, isSelected, onToggle }) {
  return (
    <div className="flex flex-col p-4 rounded-lg bg-surface border border-border transition-all duration-150">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${typeColors[item.type]}`}>
              {typeLabels[item.type]}
            </span>
            {item.subtype && (
              <span className="text-xs text-text-muted">{item.subtype}</span>
            )}
          </div>
          <h4 className="text-text-primary text-sm font-semibold truncate">{item.title}</h4>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#facc15">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-text-muted text-xs">{item.rating}</span>
        </div>
      </div>
      <p className="text-text-secondary text-xs leading-relaxed mb-3">{item.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs">{item.duration} · {item.location}</span>
        <button
          onClick={() => onToggle(item)}
          className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
            isSelected
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isSelected ? 'Added' : 'Add'}
        </button>
      </div>
    </div>
  )
}

function Search() {
  const navigate = useNavigate()
  const { selectedItems, toggleItem } = useSelectedItems()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    return searchablePlaces.filter((item) => {
      const matchCategory = category === 'all' || item.type === category
      const q = query.toLowerCase()
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.subtype.toLowerCase().includes(q)
      return matchCategory && matchSearch
    })
  }, [query, category])

  const selectedCount = selectedItems.length

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <p className="text-text-secondary mb-6">
        Search for places, restaurants, and activities to add to your trip.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search places, food, activities..."
            className="w-full bg-surface border border-border rounded-lg pl-11 pr-5 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-blue-500 transition-colors text-sm"
          />
        </div>
        <button
          onClick={() => navigate('/review')}
          disabled={selectedCount === 0}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-5 py-3 rounded-lg transition-colors text-sm whitespace-nowrap"
        >
          Review ({selectedCount})
        </button>
      </div>

      <div className="flex items-center gap-1 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              category === cat.key
                ? 'bg-blue-500 text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-text-muted text-sm">No results found</p>
            <p className="text-text-muted text-xs mt-1">Try a different search term or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
            {filtered.map((item) => (
              <SearchCard
                key={item.id}
                item={item}
                isSelected={!!selectedItems.find((s) => s.id === item.id)}
                onToggle={toggleItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
