'use client'

import { useState } from 'react'
import { Calendar, DollarSign, Zap, Heart, Building, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { useTravelStore } from '@/lib/travel-store'
import type { PlaceCategory, TravelPreferences } from '@/lib/travel-types'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'


const paceOptions = [
  { value: 'relaxed', label: 'Relaxed', description: '2-3 activities per day', icon: '🌴' },
  { value: 'moderate', label: 'Moderate', description: '3-4 activities per day', icon: '⚡' },
  { value: 'intensive', label: 'Intensive', description: '4-5 activities per day', icon: '🚀' },
] as const

const interestOptions: { value: PlaceCategory; label: string; icon: string }[] = [
  { value: 'landmark', label: 'Landmarks', icon: '🏛️' },
  { value: 'museum', label: 'Museums', icon: '🎨' },
  { value: 'restaurant', label: 'Food & Dining', icon: '🍜' },
  { value: 'park', label: 'Parks & Nature', icon: '🌳' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
  { value: 'beach', label: 'Beaches', icon: '🏖️' },
  { value: 'nightlife', label: 'Nightlife', icon: '🌙' },
]

const accommodationOptions = [
  { value: 'hostel', label: 'Hostel', icon: '🏠' },
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'apartment', label: 'Apartment', icon: '🏢' },
  { value: 'resort', label: 'Resort', icon: '🏝️' },
] as const

export function PreferencesForm() {
  const { selectedDestination, setPreferences, setStep } = useTravelStore()
  
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: addDays(new Date(), 5),
  })
  const [pace, setPace] = useState<TravelPreferences['pace']>('moderate')
  const [interests, setInterests] = useState<PlaceCategory[]>(['landmark', 'restaurant'])
  const [accommodation, setAccommodation] = useState<TravelPreferences['accommodationType']>('hotel')
  
  const toggleInterest = (interest: PlaceCategory) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest))
    } else {
      setInterests([...interests, interest])
    }
  }
  
  const handleSubmit = () => {
    if (!selectedDestination) return
    
    setPreferences({
      destination: selectedDestination,
      startDate: dateRange.from,
      endDate: dateRange.to,
      pace,
      interests,
      accommodationType: accommodation,
    })
  }
  
  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4">{selectedDestination}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Tell us about your trip
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Customize your travel experience so we can create the perfect itinerary for you.
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Dates */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-primary" />
                Travel Dates
              </CardTitle>
              <CardDescription>When are you planning to visit?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal min-w-[200px]">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(dateRange.from, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <span className="self-center text-muted-foreground">to</span>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal min-w-[200px]">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(dateRange.to, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                      disabled={(date) => date < dateRange.from}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
          
          
          {/* Pace */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-primary" />
                Travel Pace
              </CardTitle>
              <CardDescription>How busy do you want your days to be?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPace(option.value)}
                    className={cn(
                      'p-4 rounded-xl border text-left transition-all',
                      pace === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/50'
                    )}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Interests */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5 text-primary" />
                Interests
              </CardTitle>
              <CardDescription>What experiences are you looking for?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {interestOptions.map((interest) => (
                  <button
                    key={interest.value}
                    onClick={() => toggleInterest(interest.value)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full border transition-all',
                      interests.includes(interest.value)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/50 hover:border-primary/50'
                    )}
                  >
                    <span>{interest.icon}</span>
                    <span className="text-sm font-medium">{interest.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Accommodation */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="w-5 h-5 text-primary" />
                Accommodation
              </CardTitle>
              <CardDescription>Where would you like to stay?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {accommodationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAccommodation(option.value)}
                    className={cn(
                      'p-4 rounded-xl border text-center transition-all',
                      accommodation === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/50'
                    )}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-medium text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep('destination')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            className="gap-2"
            disabled={interests.length === 0}
          >
            Discover Places
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
