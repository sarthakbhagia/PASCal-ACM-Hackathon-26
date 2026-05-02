'use client'

import { useEffect, useState } from 'react'
import { Star, Clock, MapPin, Check, ArrowRight, ArrowLeft, Filter, Loader2, AlertCircle, RefreshCw, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTravelStore } from '@/lib/travel-store'
import type { Place, PlaceCategory } from '@/lib/travel-types'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const categoryLabels: Record<PlaceCategory, string> = {
  landmark: 'Landmark',
  restaurant: 'Restaurant',
  museum: 'Museum',
  park: 'Park',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  beach: 'Beach',
  nightlife: 'Nightlife',
}

const categoryColors: Record<PlaceCategory, string> = {
  landmark: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  restaurant: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  museum: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  park: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  shopping: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  entertainment: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  beach: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  nightlife: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
}

function PlaceSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur animate-pulse">
      <div className="h-40 bg-secondary/50" />
      <CardContent className="p-4">
        <div className="h-4 bg-secondary/50 rounded w-3/4 mb-3" />
        <div className="h-3 bg-secondary/30 rounded w-full mb-2" />
        <div className="h-3 bg-secondary/30 rounded w-2/3 mb-3" />
        <div className="flex items-center gap-3">
          <div className="h-3 bg-secondary/30 rounded w-12" />
          <div className="h-3 bg-secondary/30 rounded w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export function PlaceDiscovery() {
  const { 
    discoveredPlaces, 
    selectedPlaces, 
    discoverPlaces, 
    togglePlaceSelection, 
    generateItinerary,
    setStep,
    selectedDestination,
    preferences,
    isDiscovering,
    isGenerating,
    error,
    clearError,
  } = useTravelStore()
  
  const [filterCategory, setFilterCategory] = useState<PlaceCategory | 'all'>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  
  useEffect(() => {
    if (discoveredPlaces.length === 0) {
      discoverPlaces()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  const filteredPlaces = filterCategory === 'all' 
    ? discoveredPlaces 
    : discoveredPlaces.filter(p => p.category === filterCategory)
  
  const categories = Array.from(new Set(discoveredPlaces.map(p => p.category)))
  
  const isSelected = (place: Place) => selectedPlaces.some(p => p.id === place.id)
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const handleGenerate = async () => {
    await generateItinerary()
  }
  
  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{selectedDestination}</Badge>
              <Badge variant="outline" className="text-primary border-primary/30">
                {preferences?.pace} pace
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {isDiscovering ? 'Discovering Places...' : 'Discover Amazing Places'}
            </h1>
            <p className="text-muted-foreground">
              {isDiscovering 
                ? 'AI is finding the best spots for your trip. This may take a moment...'
                : 'Select the places you\'d like to visit and we\'ll optimize your route'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-card border border-border/50">
              <span className="text-2xl font-bold text-primary">{selectedPlaces.length}</span>
              <span className="text-muted-foreground ml-2">selected</span>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive flex-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                clearError()
                discoverPlaces()
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        )}
        
        {/* Filters */}
        {!isDiscovering && discoveredPlaces.length > 0 && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 text-muted-foreground mr-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filter:</span>
            </div>
            <button
              onClick={() => setFilterCategory('all')}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border',
                filterCategory === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border/50 hover:border-primary/50'
              )}
            >
              All Places
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border',
                  filterCategory === category
                    ? categoryColors[category]
                    : 'border-border/50 hover:border-primary/50'
                )}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>
        )}
        
        {/* Loading Animation */}
        {isDiscovering && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-xl bg-primary/30 animate-pulse" />
              <div className="w-20 h-20 bg-card rounded-full border-2 border-primary flex items-center justify-center relative z-10 animate-bounce">
                <MapPin className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                Searching for the best spots...
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're scouring the web to find the most amazing landmarks, restaurants, and hidden gems in {selectedDestination}.
              </p>
            </div>
          </div>
        )}


        {/* Places Grid */}
        {!isDiscovering && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {filteredPlaces.map((place) => {
              const selected = isSelected(place)
              
              return (
                <Card
                  key={place.id}
                  className={cn(
                    'group cursor-pointer overflow-hidden transition-all duration-300 border-border/50 bg-card/50 backdrop-blur',
                    selected && 'ring-2 ring-primary border-primary/50',
                    hoveredId === place.id && !selected && 'border-primary/30'
                  )}
                  onClick={() => togglePlaceSelection(place)}
                  onMouseEnter={() => setHoveredId(place.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={place.imageUrl}
                      alt={place.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                    
                    {/* Selection indicator */}
                    <div className={cn(
                      'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all',
                      selected 
                        ? 'bg-primary text-primary-foreground scale-100' 
                        : 'bg-background/80 text-foreground scale-90 opacity-0 group-hover:opacity-100'
                    )}>
                      <Check className="w-4 h-4" />
                    </div>
                    
                    {/* Category badge */}
                    <Badge 
                      className={cn(
                        'absolute top-3 left-3 border',
                        categoryColors[place.category]
                      )}
                    >
                      {categoryLabels[place.category]}
                    </Badge>
                    
                    {/* Place name */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-bold text-lg line-clamp-1">{place.name}</h3>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {place.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{place.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(place.duration)}</span>
                        </div>
                      </div>
                      {place.price && (
                        <span className="text-muted-foreground">{place.price}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{place.address}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-between items-center sticky bottom-4 bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-xl">
          <Button
            variant="outline"
            onClick={() => setStep('preferences')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="text-center hidden sm:block">
            <p className="text-sm text-muted-foreground">
              {selectedPlaces.length === 0 
                ? 'Select places to build your itinerary'
                : `${selectedPlaces.length} place${selectedPlaces.length !== 1 ? 's' : ''} selected`
              }
            </p>
          </div>
          
          <Button
            onClick={handleGenerate}
            className="gap-2"
            disabled={selectedPlaces.length === 0 || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Itinerary
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
