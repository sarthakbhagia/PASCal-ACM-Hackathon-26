'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, MapPin, Thermometer, Calendar, ChevronRight, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTravelStore } from '@/lib/travel-store'
import { popularDestinations } from '@/lib/sample-data'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface LocationSuggestion {
  place_id: string
  display_name: string
  lat: string
  lon: string
  type: string
}

export function DestinationPicker() {
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { setDestination } = useTravelStore()
  
  const filteredDestinations = popularDestinations.filter(
    d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         d.country.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Debounced LocationIQ autocomplete
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    
    // Check if it matches a popular destination
    const matchesPopular = popularDestinations.some(
      d => d.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (matchesPopular) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1&featuretype=city`
        )
        if (res.ok) {
          const data = await res.json()
          // Nominatim returns a slightly different format, map it to our interface
          const mappedData = data.map((item: any) => ({
            place_id: item.place_id.toString(),
            display_name: item.display_name,
            lat: item.lat,
            lon: item.lon,
            type: item.type
          }))
          setSuggestions(mappedData)
          setShowSuggestions(true)
        }
      } catch {
        // Silently fail
      } finally {
        setIsSearching(false)
      }
    }, 400)
    
    return () => clearTimeout(timer)
  }, [searchQuery])
  
  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    const name = suggestion.display_name.split(',')[0].trim()
    const coords: [number, number] = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)]
    setShowSuggestions(false)
    setSearchQuery(name)
    setDestination(name, coords)
  }
  
  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      setShowSuggestions(false)
      setDestination(searchQuery.trim())
    }
  }
  
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* Hero Section */}
      <div className="text-center py-12 md:py-20 px-4">
        <Badge variant="secondary" className="mb-4">
          AI-Powered Planning
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-balance">
          Where will your next
          <span className="block text-primary">adventure take you?</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
          Discover amazing destinations and let AI create the perfect itinerary 
          tailored to your preferences and travel style.
        </p>
        
        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search any destination worldwide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit()
            }}
            className="pl-12 pr-24 h-14 text-lg bg-card border-border/50 rounded-2xl"
          />
          {isSearching && (
            <Loader2 className="absolute right-20 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
          )}
          <Button 
            size="sm" 
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl"
            onClick={handleSearchSubmit}
            disabled={searchQuery.trim().length === 0}
            suppressHydrationWarning
          >
            Explore
          </Button>
          
          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s.place_id}
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border/30 last:border-b-0"
                >
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm line-clamp-1">{s.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Destinations Grid */}
      <div className="flex-1 px-4 pb-12">
        <div className="container mx-auto">
          <h2 className="text-sm font-medium text-muted-foreground mb-6 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Popular Destinations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination) => (
              <Card
                key={destination.id}
                className={cn(
                  'group cursor-pointer overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all duration-300',
                  hoveredId === destination.id && 'scale-[1.02] border-primary/50 shadow-xl shadow-primary/10'
                )}
                onClick={() => setDestination(destination.name, destination.coordinates)}
                onMouseEnter={() => setHoveredId(destination.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={destination.imageUrl}
                    alt={destination.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold">{destination.name}</h3>
                    <p className="text-sm text-muted-foreground">{destination.country}</p>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {destination.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{destination.bestTimeToVisit}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Thermometer className="w-4 h-4 text-accent" />
                        <span>{destination.averageTemperature}</span>
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      'w-5 h-5 transition-transform duration-300',
                      hoveredId === destination.id && 'translate-x-1 text-primary'
                    )} />
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Badge variant="outline" className="text-xs">
                      {destination.popularPlaces} Places to Visit
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
