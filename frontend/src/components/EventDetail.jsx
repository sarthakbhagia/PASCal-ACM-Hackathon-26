const typeConfig = {
  travel: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Travel' },
  food: { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Food' },
  site: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Sightseeing' },
  activity: { color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Activity' },
  hotel: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Hotel' },
}

function EventDetail({ event }) {
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
            <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-text-secondary text-sm">
          Click an event to view its details
        </p>
      </div>
    )
  }

  const config = typeConfig[event.type] || typeConfig.activity

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold uppercase tracking-wider ${config.color} ${config.bg} px-2.5 py-1 rounded-md`}>
            {config.label}
          </span>
          {event.subtype && (
            <span className="text-xs text-text-muted">{event.subtype}</span>
          )}
        </div>
        <h3 className="text-xl font-semibold text-text-primary">{event.title}</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background rounded-lg p-3">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Time</p>
          <p className="text-text-primary text-sm font-medium">{event.time}</p>
        </div>
        <div className="bg-background rounded-lg p-3">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Duration</p>
          <p className="text-text-primary text-sm font-medium">{event.duration}</p>
        </div>
      </div>

      {event.location && (
        <div className="bg-background rounded-lg p-3">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Location</p>
          <p className="text-text-primary text-sm font-medium">{event.location}</p>
        </div>
      )}

      {event.description && (
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-2">About</p>
          <p className="text-text-secondary text-sm leading-relaxed">{event.description}</p>
        </div>
      )}

      {event.notes && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
          <p className="text-blue-400 text-xs font-medium mb-1">Note</p>
          <p className="text-blue-300/70 text-sm">{event.notes}</p>
        </div>
      )}

      {event.type === 'travel' && event.from && event.to && (
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Route</p>
          <div className="bg-background rounded-lg p-3 flex items-center gap-3">
            <div>
              <p className="text-text-muted text-xs">From</p>
              <p className="text-text-primary text-sm font-medium">{event.from.name}</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 flex-shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <p className="text-text-muted text-xs">To</p>
              <p className="text-text-primary text-sm font-medium">{event.to.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventDetail
