'use client'

import { useState } from 'react'
import { Search, MapPin, Thermometer, Calendar, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTravelStore } from '@/lib/travel-store'
import { popularDestinations } from '@/lib/sample-data'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export function DestinationPicker() {
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const { setDestination } = useTravelStore()
  
  const filteredDestinations = popularDestinations.filter(
    d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         d.country.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
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
          Discover amazing destinations and let us create the perfect itinerary 
          tailored to your preferences and travel style.
        </p>
        
        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg bg-card border-border/50 rounded-2xl"
          />
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
                onClick={() => setDestination(destination.name)}
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
