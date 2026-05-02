import { create } from 'zustand'
import type { Place, TravelPreferences, Itinerary, ItineraryDay, ItineraryPlace } from './travel-types'
import { getPlacesForDestination } from './sample-data'
import { addDays, format, differenceInDays } from 'date-fns'

interface TravelState {
  // Current step in the planning flow
  currentStep: 'destination' | 'preferences' | 'discover' | 'itinerary' | 'navigation'
  
  // Selected destination
  selectedDestination: string | null
  
  // Travel preferences
  preferences: TravelPreferences | null
  
  // Discovered places
  discoveredPlaces: Place[]
  selectedPlaces: Place[]
  
  // Generated itinerary
  itinerary: Itinerary | null
  
  // Active day index for navigation
  activeDayIndex: number
  
  // Actions
  setStep: (step: TravelState['currentStep']) => void
  setDestination: (destination: string) => void
  setPreferences: (preferences: TravelPreferences) => void
  discoverPlaces: () => void
  togglePlaceSelection: (place: Place) => void
  generateItinerary: () => void
  setActiveDayIndex: (index: number) => void
  resetPlanning: () => void
}

function calculateTravelTime(from: [number, number], to: [number, number]): number {
  // Simple Haversine distance approximation
  const R = 6371 // Earth's radius in km
  const dLat = ((to[0] - from[0]) * Math.PI) / 180
  const dLon = ((to[1] - from[1]) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from[0] * Math.PI) / 180) *
      Math.cos((to[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  // Assume average speed of 30 km/h in city traffic, return time in minutes
  return Math.round((distance / 30) * 60)
}

function optimizeRoute(places: Place[]): Place[] {
  if (places.length <= 2) return places
  
  // Simple nearest neighbor algorithm for route optimization
  const result: Place[] = []
  const remaining = [...places]
  
  // Start with the first place
  result.push(remaining.shift()!)
  
  while (remaining.length > 0) {
    const lastPlace = result[result.length - 1]
    let nearestIndex = 0
    let nearestDistance = Infinity
    
    remaining.forEach((place, index) => {
      const distance = Math.sqrt(
        Math.pow(place.coordinates[0] - lastPlace.coordinates[0], 2) +
        Math.pow(place.coordinates[1] - lastPlace.coordinates[1], 2)
      )
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }
    })
    
    result.push(remaining.splice(nearestIndex, 1)[0])
  }
  
  return result
}

export const useTravelStore = create<TravelState>((set, get) => ({
  currentStep: 'destination',
  selectedDestination: null,
  preferences: null,
  discoveredPlaces: [],
  selectedPlaces: [],
  itinerary: null,
  activeDayIndex: 0,
  
  setStep: (step) => set({ currentStep: step }),
  
  setDestination: (destination) => set({ 
    selectedDestination: destination,
    currentStep: 'preferences' 
  }),
  
  setPreferences: (preferences) => set({ 
    preferences,
    currentStep: 'discover'
  }),
  
  discoverPlaces: () => {
    const { selectedDestination, preferences } = get()
    if (!selectedDestination) return
    
    let places = getPlacesForDestination(selectedDestination)
    
    // Filter by interests if preferences exist
    if (preferences?.interests.length) {
      places = places.filter(p => preferences.interests.includes(p.category))
    }
    
    // Sort by rating
    places.sort((a, b) => b.rating - a.rating)
    
    set({ discoveredPlaces: places })
  },
  
  togglePlaceSelection: (place) => {
    const { selectedPlaces } = get()
    const isSelected = selectedPlaces.some(p => p.id === place.id)
    
    if (isSelected) {
      set({ selectedPlaces: selectedPlaces.filter(p => p.id !== place.id) })
    } else {
      set({ selectedPlaces: [...selectedPlaces, place] })
    }
  },
  
  generateItinerary: () => {
    const { selectedDestination, preferences, selectedPlaces } = get()
    if (!selectedDestination || !preferences || selectedPlaces.length === 0) return
    
    const startDate = preferences.startDate
    const endDate = preferences.endDate
    const numDays = differenceInDays(endDate, startDate) + 1
    
    // Determine places per day based on pace
    const placesPerDay = preferences.pace === 'relaxed' ? 2 : preferences.pace === 'moderate' ? 3 : 4
    
    // Optimize the overall route
    const optimizedPlaces = optimizeRoute([...selectedPlaces])
    
    // Distribute places across days
    const days: ItineraryDay[] = []
    let placeIndex = 0
    
    for (let i = 0; i < numDays && placeIndex < optimizedPlaces.length; i++) {
      const dayPlaces: ItineraryPlace[] = []
      let currentTime = 9 * 60 // Start at 9:00 AM in minutes
      let totalDuration = 0
      let totalDistance = 0
      
      const dailyPlaceCount = Math.min(placesPerDay, optimizedPlaces.length - placeIndex)
      
      for (let j = 0; j < dailyPlaceCount && placeIndex < optimizedPlaces.length; j++) {
        const place = optimizedPlaces[placeIndex]
        const prevPlace = dayPlaces[dayPlaces.length - 1]
        
        let travelTime = 0
        if (prevPlace) {
          travelTime = calculateTravelTime(prevPlace.coordinates, place.coordinates)
          currentTime += travelTime
          totalDistance += travelTime * 0.5 // Approximate km based on travel time
        }
        
        const startHour = Math.floor(currentTime / 60)
        const startMin = currentTime % 60
        const endTime = currentTime + place.duration
        const endHour = Math.floor(endTime / 60)
        const endMin = endTime % 60
        
        dayPlaces.push({
          ...place,
          startTime: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
          endTime: `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`,
          travelTimeFromPrevious: travelTime > 0 ? travelTime : undefined,
        })
        
        currentTime = endTime + 30 // 30 min buffer between activities
        totalDuration += place.duration + travelTime
        placeIndex++
      }
      
      days.push({
        date: addDays(startDate, i),
        places: dayPlaces,
        totalDuration,
        totalDistance: Math.round(totalDistance),
      })
    }
    
    const itinerary: Itinerary = {
      id: crypto.randomUUID(),
      destination: selectedDestination,
      startDate,
      endDate,
      days,
      totalBudget: preferences.budget === 'budget' ? '$500 - $1,000' : preferences.budget === 'moderate' ? '$1,000 - $2,500' : '$2,500+',
      createdAt: new Date(),
    }
    
    set({ itinerary, currentStep: 'itinerary' })
  },
  
  setActiveDayIndex: (index) => set({ activeDayIndex: index }),
  
  resetPlanning: () => set({
    currentStep: 'destination',
    selectedDestination: null,
    preferences: null,
    discoveredPlaces: [],
    selectedPlaces: [],
    itinerary: null,
    activeDayIndex: 0,
  }),
}))
