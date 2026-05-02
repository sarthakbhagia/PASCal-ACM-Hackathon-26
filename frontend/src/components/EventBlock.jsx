import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TravelMapPreview from './TravelMapPreview'

const typeConfig = {
  travel: {
    color: 'border-blue-500',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    icon: '✈',
    label: 'Travel',
  },
  food: {
    color: 'border-green-500',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    icon: '🍽',
    label: 'Food',
  },
  site: {
    color: 'border-yellow-500',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    icon: '📍',
    label: 'Sightseeing',
  },
  activity: {
    color: 'border-orange-500',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    icon: '🎯',
    label: 'Activity',
  },
  hotel: {
    color: 'border-red-500',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    icon: '🏨',
    label: 'Hotel',
  },
}

function EventBlock({ event, onClick, isSelected }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: event.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  }

  const config = typeConfig[event.type] || typeConfig.activity

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onClick(event)}
      className={`group flex flex-col p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-150 ${config.color} ${
        isSelected
          ? 'bg-surface-hover ring-1 ring-blue-500/40'
          : 'bg-surface border-transparent hover:bg-surface-hover'
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 w-5 flex items-center justify-center text-text-muted opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </div>

        <div className={`flex-shrink-0 w-8 h-8 rounded-md ${config.bg} flex items-center justify-center text-sm`}>
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium uppercase tracking-wide ${config.text}`}>
              {config.label}
            </span>
            {event.subtype && (
              <span className="text-xs text-text-muted">· {event.subtype}</span>
            )}
          </div>
          <p className="text-text-primary text-sm font-medium truncate">{event.title}</p>
        </div>

        <div className="flex-shrink-0 text-right">
          <p className="text-text-muted text-xs">{event.time}</p>
          {event.duration && (
            <p className="text-text-muted text-xs">{event.duration}</p>
          )}
        </div>
      </div>

      {event.type === 'travel' && event.from && event.to && (
        <TravelMapPreview from={event.from} to={event.to} />
      )}
    </div>
  )
}

export default EventBlock
