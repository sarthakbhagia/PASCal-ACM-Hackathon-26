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
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTravelStore } from '@/lib/travel-store'
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
  const { itinerary, setStep, activeDayIndex, setActiveDayIndex } = useTravelStore()
  const [expandedPlace, setExpandedPlace] = useState<string | null>(null)
  
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
  
  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="container mx-auto">
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
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
        
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
                </div>
              </CardContent>
            </Card>
            
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
                      'border-border/50 bg-card/50 backdrop-blur overflow-hidden transition-all cursor-pointer',
                      expandedPlace === place.id && 'ring-1 ring-primary'
                    )}
                    onClick={() => setExpandedPlace(expandedPlace === place.id ? null : place.id)}
                  >
                    <div className="flex">
                      {/* Time Column */}
                      <div className="w-20 flex-shrink-0 bg-secondary/30 p-4 flex flex-col items-center justify-center border-r border-border/50">
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
                            
                            <h3 className="font-bold text-lg mb-1">{place.name}</h3>
                            
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
                          
                          <Button variant="ghost" size="icon" className="flex-shrink-0">
                            {expandedPlace === place.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
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
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>Hours: {place.openingHours}</span>
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
