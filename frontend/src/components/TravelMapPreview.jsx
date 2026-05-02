function TravelMapPreview({ from, to }) {
  return (
    <div className="mt-3 rounded-lg border border-border bg-background overflow-hidden">
      <div className="relative h-36 bg-background">
        <svg width="100%" height="100%" viewBox="0 0 400 144" className="absolute inset-0">
          <defs>
            <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#27272a" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mapGrid)" />
          <path
            d="M 80 100 Q 160 30 320 44"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.6"
          />
          <circle cx="80" cy="100" r="5" fill="#3b82f6" />
          <circle cx="80" cy="100" r="8" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
          <circle cx="320" cy="44" r="5" fill="#ef4444" />
          <circle cx="320" cy="44" r="8" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.4" />
          <text x="80" y="124" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="system-ui">
            {from?.name?.split(' ').slice(0, 2).join(' ')}
          </text>
          <text x="320" y="30" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="system-ui">
            {to?.name?.split(' ').slice(0, 2).join(' ')}
          </text>
        </svg>
      </div>
    </div>
  )
}

export default TravelMapPreview
