'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Navigation, 
  ArrowRight, 
  ArrowLeft,
  Car,
  DollarSign,
  Star,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Sparkles,
  Trash2,
  ArrowUpDown,
  Plus,
  GripVertical,
  Loader2,
  X,
  MoveRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTravelStore } from '@/lib/travel-store'
import { exportItineraryToPDF } from '@/lib/pdf-generator'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const TravelMap = dynamic(() => import('./travel-map').then(mod => mod.TravelMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-card rounded-xl flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading map...</div>
    </div>
  ),
})

export function ItineraryView() {
  const { 
    itinerary, setStep, activeDayIndex, setActiveDayIndex,
    removePlaceFromDay, movePlaceToDay, reorderPlaceInDay, addPlaceToDay,
    enhanceItinerary, isEnhancing, discoveredPlaces, selectedPlaces,
    error, clearError,
  } = useTravelStore()
  const [expandedPlace, setExpandedPlace] = useState<string | null>(null)
  const [showMoveMenu, setShowMoveMenu] = useState<string | null>(null)
  const [showAddPanel, setShowAddPanel] = useState(false)
  
  if (!itinerary) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <p className="text-muted-foreground">No itinerary generated yet.</p>
      </div>
    )
  }
  
  const activeDay = itinerary.days[activeDayIndex]
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  // Places available to add (discovered but not in current itinerary)
  const allItineraryPlaceIds = new Set(
    itinerary.days.flatMap(d => d.places.map(p => p.id))
  )
  const availablePlaces = discoveredPlaces.filter(p => !allItineraryPlaceIds.has(p.id))

  const handleMoveUp = (dayIndex: number, placeIndex: number) => {
    if (placeIndex > 0) {
      reorderPlaceInDay(dayIndex, placeIndex, placeIndex - 1)
    }
  }

  const handleMoveDown = (dayIndex: number, placeIndex: number) => {
    if (placeIndex < activeDay.places.length - 1) {
      reorderPlaceInDay(dayIndex, placeIndex, placeIndex + 1)
    }
  }
  
  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="container mx-auto">
        {/* Enhancing Overlay */}
        {isEnhancing && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center p-8">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold mb-2">Enhancing Your Itinerary</h2>
              <p className="text-muted-foreground">AI is optimizing timings, routes, and adding travel tips...</p>
              <Loader2 className="w-6 h-6 text-primary mx-auto mt-4 animate-spin" />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <Badge variant="secondary" className="mb-2">
              {itinerary.destination}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              Your Optimized Itinerary
            </h1>
            <p className="text-muted-foreground flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(itinerary.startDate, 'MMM d')} - {format(itinerary.endDate, 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Est. Budget: {itinerary.totalBudget}
              </span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => enhanceItinerary()}
              disabled={isEnhancing}
            >
              <Sparkles className="w-4 h-4" />
              Review & Enhance
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => exportItineraryToPDF(itinerary)}
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-3">
            <p className="text-sm text-destructive flex-1">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Day Selector & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Day Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {itinerary.days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setActiveDayIndex(index)}
                  className={cn(
                    'flex-shrink-0 px-4 py-3 rounded-xl border transition-all',
                    activeDayIndex === index
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border/50 hover:border-primary/50'
                  )}
                >
                  <div className="text-xs opacity-80">Day {index + 1}</div>
                  <div className="font-medium">{format(day.date, 'EEE, MMM d')}</div>
                </button>
              ))}
            </div>
            
            {/* Day Summary */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground">Places</div>
                      <div className="text-2xl font-bold text-primary">{activeDay.places.length}</div>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="text-2xl font-bold">{formatDuration(activeDay.totalDuration)}</div>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div>
                      <div className="text-sm text-muted-foreground">Distance</div>
                      <div className="text-2xl font-bold">{activeDay.totalDistance} km</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowAddPanel(!showAddPanel)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Place
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Add Place Panel */}
            {showAddPanel && (
              <Card className="border-primary/30 bg-card/50 backdrop-blur">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plus className="w-5 h-5 text-primary" />
                      Add a Place to Day {activeDayIndex + 1}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowAddPanel(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {availablePlaces.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      All discovered places are already in your itinerary.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {availablePlaces.map((place) => (
                        <button
                          key={place.id}
                          onClick={() => {
                            addPlaceToDay(activeDayIndex, place)
                            setShowAddPanel(false)
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-all text-left"
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={place.imageUrl} alt={place.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{place.name}</p>
                            <p className="text-xs text-muted-foreground">{formatDuration(place.duration)}</p>
                          </div>
                          <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Timeline */}
            <div className="space-y-4">
              {activeDay.places.map((place, index) => (
                <div key={place.id} className="relative">
                  {/* Travel time indicator */}
                  {place.travelTimeFromPrevious && (
                    <div className="flex items-center gap-3 ml-6 mb-2 text-sm text-muted-foreground">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <Car className="w-4 h-4" />
                      </div>
                      <span>{place.travelTimeFromPrevious} min travel</span>
                    </div>
                  )}
                  
                  <Card 
                    className={cn(
                      'border-border/50 bg-card/50 backdrop-blur overflow-hidden transition-all',
                      expandedPlace === place.id && 'ring-1 ring-primary'
                    )}
                  >
                    <div className="flex">
                      {/* Drag Handle + Time Column */}
                      <div className="w-24 flex-shrink-0 bg-secondary/30 p-4 flex flex-col items-center justify-center border-r border-border/50">
                        <div className="flex gap-1 mb-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMoveUp(activeDayIndex, index) }}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-secondary disabled:opacity-30"
                            title="Move up"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMoveDown(activeDayIndex, index) }}
                            disabled={index === activeDay.places.length - 1}
                            className="p-1 rounded hover:bg-secondary disabled:opacity-30"
                            title="Move down"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-lg font-bold">{place.startTime}</div>
                        <div className="text-xs text-muted-foreground">to</div>
                        <div className="text-sm text-muted-foreground">{place.endTime}</div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start gap-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={place.imageUrl}
                              alt={place.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                #{index + 1}
                              </Badge>
                              <div className="flex items-center gap-1 text-amber-400 text-sm">
                                <Star className="w-3 h-3 fill-current" />
                                {place.rating}
                              </div>
                            </div>
                            
                            <h3 className="font-bold text-lg mb-1 cursor-pointer" onClick={() => setExpandedPlace(expandedPlace === place.id ? null : place.id)}>{place.name}</h3>
                            
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(place.duration)}
                              </span>
                              {place.price && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {place.price}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {/* Move to day button */}
                            <div className="relative">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={(e) => { 
                                  e.stopPropagation()
                                  setShowMoveMenu(showMoveMenu === place.id ? null : place.id) 
                                }}
                                title="Move to another day"
                              >
                                <MoveRight className="w-4 h-4" />
                              </Button>
                              
                              {showMoveMenu === place.id && (
                                <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border/50 rounded-lg shadow-xl p-1 min-w-[120px]">
                                  {itinerary.days.map((_, dayIdx) => (
                                    dayIdx !== activeDayIndex && (
                                      <button
                                        key={dayIdx}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          movePlaceToDay(activeDayIndex, dayIdx, place.id)
                                          setShowMoveMenu(null)
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                                      >
                                        Day {dayIdx + 1}
                                      </button>
                                    )
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Remove button */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={(e) => { 
                                e.stopPropagation()
                                removePlaceFromDay(activeDayIndex, place.id) 
                              }}
                              title="Remove from itinerary"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>

                            {/* Expand button */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setExpandedPlace(expandedPlace === place.id ? null : place.id)}
                            >
                              {expandedPlace === place.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Expanded Content */}
                        {expandedPlace === place.id && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <p className="text-muted-foreground mb-3">
                              {place.description}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                              <MapPin className="w-4 h-4" />
                              <span>{place.address}</span>
                            </div>
                            {place.openingHours && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                                <Clock className="w-4 h-4" />
                                <span>Hours: {place.openingHours}</span>
                              </div>
                            )}
                            {place.notes && (
                              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 mt-3">
                                <p className="text-sm text-primary flex items-start gap-2">
                                  <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  {place.notes}
                                </p>
                              </div>
                            )}
                            <div className="mt-4 flex gap-2">
                              <Button size="sm" variant="secondary" className="gap-2">
                                <Navigation className="w-3 h-3" />
                                Get Directions
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ))}

              {activeDay.places.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-2">No places scheduled for this day</p>
                  <Button variant="outline" className="gap-2" onClick={() => setShowAddPanel(true)}>
                    <Plus className="w-4 h-4" />
                    Add a Place
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Map */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Route Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <TravelMap 
                    places={activeDay.places}
                    center={activeDay.places[0]?.coordinates || [35.6762, 139.6503]}
                  />
                </CardContent>
              </Card>
              
              {/* Legend */}
              <Card className="border-border/50 bg-card/50 backdrop-blur mt-4">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Today&apos;s Route</h4>
                  <div className="space-y-2">
                    {activeDay.places.map((place, index) => (
                      <div key={place.id} className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {index + 1}
                        </div>
                        <span className="text-muted-foreground line-clamp-1">{place.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep('discover')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Modify Places
          </Button>
          <Button
            onClick={() => setStep('navigation')}
            className="gap-2"
          >
            Start Navigation
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
