'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { ItineraryPlace, Place } from '@/lib/travel-types'
import 'leaflet/dist/leaflet.css'

// Fix for default markers
const createNumberedIcon = (number: number) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs border-2 border-white shadow-lg">${number}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

interface MapUpdaterProps {
  center: [number, number]
  places: (Place | ItineraryPlace)[]
}

function MapUpdater({ center, places }: MapUpdaterProps) {
  const map = useMap()
  
  useEffect(() => {
    if (places.length > 0) {
      const bounds = L.latLngBounds(places.map(p => p.coordinates))
      map.fitBounds(bounds, { padding: [50, 50] })
    } else {
      map.setView(center, 12)
    }
  }, [center, places, map])
  
  return null
}

interface TravelMapProps {
  places: (Place | ItineraryPlace)[]
  center?: [number, number]
  interactive?: boolean
  onPlaceClick?: (place: Place | ItineraryPlace) => void
}

export function TravelMap({ 
  places, 
  center = [35.6762, 139.6503],
  interactive = true,
  onPlaceClick 
}: TravelMapProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-card rounded-xl flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading map...</div>
      </div>
    )
  }
  
  const routeCoordinates = places.map(p => p.coordinates)
  
  return (
    <MapContainer
      center={center}
      zoom={12}
      className="w-full h-[400px] rounded-xl"
      zoomControl={interactive}
      dragging={interactive}
      scrollWheelZoom={interactive}
    >
      <TileLayer
        attribution='&copy; <a href="https://locationiq.com/?ref=maps" target="_blank">LocationIQ</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={`https://{s}-tiles.locationiq.com/v3/dark/r/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY}`}
      />
      
      <MapUpdater center={center} places={places} />
      
      {/* Route line */}
      {routeCoordinates.length > 1 && (
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: '#e87d3e',
            weight: 3,
            opacity: 0.8,
            dashArray: '10, 10',
          }}
        />
      )}
      
      {/* Place markers */}
      {places.map((place, index) => (
        <Marker
          key={place.id}
          position={place.coordinates}
          icon={createNumberedIcon(index + 1)}
          eventHandlers={{
            click: () => onPlaceClick?.(place),
          }}
        >
          <Popup>
            <div className="p-2 min-w-[180px]">
              <h3 className="font-bold text-foreground">{place.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{place.address}</p>
              {'startTime' in place && (
                <p className="text-sm text-primary mt-2">
                  {place.startTime} - {place.endTime}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
