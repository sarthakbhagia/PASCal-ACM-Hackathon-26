'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { 
  Navigation, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Car,
  CheckCircle2,
  Circle,
  Star,
  Volume2,
  VolumeX,
  Maximize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useTravelStore } from '@/lib/travel-store'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const TravelMap = dynamic(() => import('./travel-map').then(mod => mod.TravelMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-card flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading map...</div>
    </div>
  ),
})

export function NavigationView() {
  const { itinerary, activeDayIndex, setStep } = useTravelStore()
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0)
  const [completedPlaces, setCompletedPlaces] = useState<Set<string>>(new Set())
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  
  if (!itinerary) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <p className="text-muted-foreground">No itinerary to navigate.</p>
      </div>
    )
  }
  
  const activeDay = itinerary.days[activeDayIndex]
  const currentPlace = activeDay.places[currentPlaceIndex]
  const nextPlace = activeDay.places[currentPlaceIndex + 1]
  
  const progress = ((completedPlaces.size) / activeDay.places.length) * 100
  
  const markAsCompleted = () => {
    setCompletedPlaces(new Set([...completedPlaces, currentPlace.id]))
    if (currentPlaceIndex < activeDay.places.length - 1) {
      setCurrentPlaceIndex(currentPlaceIndex + 1)
    }
  }
  
  const goToPrevious = () => {
    if (currentPlaceIndex > 0) {
      setCurrentPlaceIndex(currentPlaceIndex - 1)
    }
  }
  
  const goToNext = () => {
    if (currentPlaceIndex < activeDay.places.length - 1) {
      setCurrentPlaceIndex(currentPlaceIndex + 1)
    } else {
      setIsFinished(true)
    }
  }
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  
  return (
    <div className={cn(
      'min-h-[calc(100vh-80px)] flex flex-col',
      isFullscreen && 'fixed inset-0 z-50 bg-background'
    )}>
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-border/50 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep('itinerary')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" />
                Navigation Mode
              </h1>
              <p className="text-sm text-muted-foreground">
                Day {activeDayIndex + 1} • {format(activeDay.date, 'EEEE, MMM d')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            >
              {isVoiceEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Progress */}
        <div className="container mx-auto mt-4">
          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {completedPlaces.size} / {activeDay.places.length} completed
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Map Section */}
        <div className="flex-1 relative">
          <TravelMap 
            places={activeDay.places}
            center={currentPlace.coordinates}
          />
          
          {/* Current destination overlay */}
          <div className="absolute bottom-4 left-4 right-4 lg:right-auto lg:max-w-md">
            <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={currentPlace.imageUrl}
                      alt={currentPlace.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {currentPlaceIndex + 1}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Badge variant="secondary" className="mb-1">
                      {completedPlaces.has(currentPlace.id) ? 'Completed' : 'Current Stop'}
                    </Badge>
                    <h2 className="font-bold text-lg line-clamp-1">{currentPlace.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {currentPlace.startTime} - {currentPlace.endTime}
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        {currentPlace.rating}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{currentPlace.address}</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    className="flex-1 gap-2"
                    onClick={markAsCompleted}
                    disabled={completedPlaces.has(currentPlace.id)}
                  >
                    {completedPlaces.has(currentPlace.id) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Mark as Done
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Navigation className="w-4 h-4" />
                    Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Sidebar - Place List */}
        <div className="lg:w-80 bg-card border-t lg:border-t-0 lg:border-l border-border/50">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-medium">Today&apos;s Places</h3>
          </div>
          
          <div className="overflow-y-auto max-h-[300px] lg:max-h-[calc(100vh-280px)]">
            {activeDay.places.map((place, index) => {
              const isCompleted = completedPlaces.has(place.id)
              const isCurrent = index === currentPlaceIndex
              
              return (
                <div key={place.id}>
                  {/* Travel time indicator */}
                  {place.travelTimeFromPrevious && (
                    <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground bg-secondary/30">
                      <Car className="w-3 h-3" />
                      <span>{place.travelTimeFromPrevious} min travel</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setCurrentPlaceIndex(index)}
                    className={cn(
                      'w-full flex items-center gap-3 p-4 text-left transition-colors',
                      isCurrent && 'bg-primary/10 border-l-2 border-primary',
                      !isCurrent && 'hover:bg-secondary/50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      isCompleted ? 'bg-emerald-500 text-white' : 'bg-secondary'
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'font-medium line-clamp-1',
                        isCompleted && 'line-through text-muted-foreground'
                      )}>
                        {place.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {place.startTime} • {formatDuration(place.duration)}
                      </p>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="bg-card/80 backdrop-blur-xl border-t border-border/50 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentPlaceIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          {nextPlace && (
            <div className="hidden sm:flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">Next:</span>
              <span className="font-medium">{nextPlace.name}</span>
              {nextPlace.travelTimeFromPrevious && (
                <Badge variant="secondary" className="gap-1">
                  <Car className="w-3 h-3" />
                  {nextPlace.travelTimeFromPrevious} min
                </Badge>
              )}
            </div>
          )}
          
          <Button
            onClick={goToNext}
            className="gap-2"
          >
            {currentPlaceIndex === activeDay.places.length - 1 ? 'Finish Trip' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* End Screen Overlay */}
      {isFinished && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <Card className="max-w-md w-full border-primary/20 shadow-2xl shadow-primary/20">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Trip Completed!</h2>
              <p className="text-muted-foreground mb-8">
                You&apos;ve successfully navigated all stops for today. We hope you had an amazing experience in {itinerary.destination}!
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full h-12 text-lg rounded-xl"
                  onClick={() => setStep('itinerary')}
                >
                  Back to Itinerary
                </Button>
                <Button 
                  variant="outline"
                  className="w-full h-12 text-lg rounded-xl"
                  onClick={() => {
                    setIsFinished(false)
                    setCurrentPlaceIndex(0)
                  }}
                >
                  Restart Navigation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
