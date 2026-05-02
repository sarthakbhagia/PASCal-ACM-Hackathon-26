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
  const [detailedRoute, setDetailedRoute] = useState<[number, number][]>([])
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch actual routing data from LocationIQ when places change
  useEffect(() => {
    async function fetchRoute() {
      if (places.length < 2) {
        setDetailedRoute([])
        return
      }

      // LocationIQ Directions API expects: lon,lat;lon,lat
      const coordinatesString = places
        .map(p => `${p.coordinates[1]},${p.coordinates[0]}`)
        .join(';')

      const apiKey = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY
      if (!apiKey) return

      try {
        const url = `https://us1.locationiq.com/v1/directions/driving/${coordinatesString}?key=${apiKey}&geometries=geojson&overview=full`
        const res = await fetch(url)
        
        if (res.ok) {
          const data = await res.json()
          if (data.routes && data.routes.length > 0) {
            // GeoJSON returns [lon, lat], Leaflet needs [lat, lon]
            const routePoints = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
            setDetailedRoute(routePoints)
            return
          }
        }
      } catch (error) {
        console.error('Failed to fetch detailed route:', error)
      }
      
      // Fallback: clear detailed route so it falls back to straight lines
      setDetailedRoute([])
    }

    fetchRoute()
  }, [places])
  
  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-card rounded-xl flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading map...</div>
      </div>
    )
  }
  
  const routeCoordinates = places.map(p => p.coordinates)
  
  // Decide which path to show: detailed street route (if available), or straight connecting lines
  const pathToRender = detailedRoute.length > 0 ? detailedRoute : routeCoordinates
  
  return (
    <MapContainer
      center={center}
      zoom={12}
      className="w-full h-full min-h-[400px] rounded-xl z-0"
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
      {pathToRender.length > 1 && (
        <Polyline
          positions={pathToRender}
          pathOptions={{
            color: '#e87d3e',
            weight: 4,
            opacity: 0.8,
            dashArray: detailedRoute.length > 0 ? undefined : '10, 10', // Dashed for straight lines, solid for real routes
            lineCap: 'round',
            lineJoin: 'round'
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
