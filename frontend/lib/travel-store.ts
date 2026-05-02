import { create } from 'zustand'
import type { Place, TravelPreferences, Itinerary, ItineraryDay, ItineraryPlace } from './travel-types'
import { popularDestinations } from './sample-data'
import { supabase } from './supabase'
import { format, differenceInDays } from 'date-fns'

interface TravelState {
  // Current step in the planning flow
  currentStep: 'destination' | 'preferences' | 'discover' | 'itinerary' | 'navigation'
  
  // Selected destination
  selectedDestination: string | null
  destinationCoordinates: [number, number] | null
  
  // Travel preferences
  preferences: TravelPreferences | null
  
  // Discovered places
  discoveredPlaces: Place[]
  selectedPlaces: Place[]
  
  // Generated itinerary
  itinerary: Itinerary | null
  
  // Active day index for navigation
  activeDayIndex: number
  
  // Loading & error states
  isDiscovering: boolean
  isGenerating: boolean
  isEnhancing: boolean
  error: string | null
  
  // Actions
  setStep: (step: TravelState['currentStep']) => void
  setDestination: (destination: string, coordinates?: [number, number]) => void
  setPreferences: (preferences: TravelPreferences) => void
  discoverPlaces: () => Promise<void>
  togglePlaceSelection: (place: Place) => void
  generateItinerary: () => Promise<void>
  enhanceItinerary: () => Promise<void>
  setActiveDayIndex: (index: number) => void
  resetPlanning: () => void
  clearError: () => void
  
  // Itinerary editing actions
  removePlaceFromDay: (dayIndex: number, placeId: string) => void
  movePlaceToDay: (fromDayIndex: number, toDayIndex: number, placeId: string) => void
  reorderPlaceInDay: (dayIndex: number, fromIndex: number, toIndex: number) => void
  addPlaceToDay: (dayIndex: number, place: Place) => void
  setItinerary: (itinerary: Itinerary) => void
}

export const useTravelStore = create<TravelState>((set, get) => ({
  currentStep: 'destination',
  selectedDestination: null,
  destinationCoordinates: null,
  preferences: null,
  discoveredPlaces: [],
  selectedPlaces: [],
  itinerary: null,
  activeDayIndex: 0,
  isDiscovering: false,
  isGenerating: false,
  isEnhancing: false,
  error: null,
  
  setStep: (step) => set({ currentStep: step }),
  
  setDestination: (destination, coordinates) => {
    // Try to match to known destinations for coordinates
    const known = popularDestinations.find(
      d => d.name.toLowerCase() === destination.toLowerCase()
    )
    set({ 
      selectedDestination: destination,
      destinationCoordinates: coordinates || known?.coordinates || null,
      currentStep: 'preferences' 
    })
  },
  
  setPreferences: (preferences) => set({ 
    preferences,
    currentStep: 'discover'
  }),
  
  discoverPlaces: async () => {
    const { selectedDestination, destinationCoordinates, preferences } = get()
    if (!selectedDestination) return
    
    set({ isDiscovering: true, error: null, discoveredPlaces: [] })
    
    try {
      // If we don't have coordinates, try to geocode using LocationIQ
      let coords = destinationCoordinates
      if (!coords) {
        const locationiqKey = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY
        if (locationiqKey) {
          const geoRes = await fetch(
            `https://us1.locationiq.com/v1/search?key=${locationiqKey}&q=${encodeURIComponent(selectedDestination)}&format=json&limit=1`
          )
          if (geoRes.ok) {
            const geoData = await geoRes.json()
            if (geoData.length > 0) {
              coords = [parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)]
              set({ destinationCoordinates: coords })
            }
          }
        }
      }
      
      const { data, error } = await supabase.functions.invoke('discover-places', {
        body: {
          destination: selectedDestination,
          coordinates: coords || [0, 0],
          interests: preferences?.interests || ['landmark', 'restaurant'],
          budget: preferences?.budget || 'moderate',
          pace: preferences?.pace || 'moderate',
        },
      })
      
      if (error) throw new Error(error.message || 'Failed to discover places')
      
      let places: Place[] = data?.places || []
      
      // Filter by interests if preferences exist
      if (preferences?.interests.length) {
        places = places.filter(p => preferences.interests.includes(p.category))
      }
      
      // Sort by rating
      places.sort((a, b) => b.rating - a.rating)
      
      set({ discoveredPlaces: places, isDiscovering: false })
    } catch (err) {
      console.error('Error discovering places:', err)
      set({ 
        error: err instanceof Error ? err.message : 'Failed to discover places',
        isDiscovering: false 
      })
    }
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
  
  generateItinerary: async () => {
    const { selectedDestination, preferences, selectedPlaces } = get()
    if (!selectedDestination || !preferences || selectedPlaces.length === 0) return
    
    set({ isGenerating: true, error: null })
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-itinerary', {
        body: {
          destination: selectedDestination,
          places: selectedPlaces,
          preferences: {
            budget: preferences.budget,
            pace: preferences.pace,
            interests: preferences.interests,
            accommodationType: preferences.accommodationType,
          },
          startDate: format(preferences.startDate, 'yyyy-MM-dd'),
          endDate: format(preferences.endDate, 'yyyy-MM-dd'),
        },
      })
      
      if (error) throw new Error(error.message || 'Failed to generate itinerary')
      
      const itinerary = data?.itinerary
      if (!itinerary) throw new Error('No itinerary returned')
      
      // Convert date strings to Date objects for the frontend
      itinerary.startDate = new Date(itinerary.startDate)
      itinerary.endDate = new Date(itinerary.endDate)
      itinerary.createdAt = new Date(itinerary.createdAt || new Date())
      if (itinerary.days) {
        itinerary.days = itinerary.days.map((day: any) => ({
          ...day,
          date: new Date(day.date),
        }))
      }
      
      set({ itinerary, currentStep: 'itinerary', isGenerating: false })
    } catch (err) {
      console.error('Error generating itinerary:', err)
      set({ 
        error: err instanceof Error ? err.message : 'Failed to generate itinerary',
        isGenerating: false 
      })
    }
  },
  
  enhanceItinerary: async () => {
    const { itinerary } = get()
    if (!itinerary) return
    
    set({ isEnhancing: true, error: null })
    
    try {
      // Serialize dates for the API
      const serialized = {
        ...itinerary,
        startDate: itinerary.startDate instanceof Date 
          ? format(itinerary.startDate, 'yyyy-MM-dd') 
          : itinerary.startDate,
        endDate: itinerary.endDate instanceof Date 
          ? format(itinerary.endDate, 'yyyy-MM-dd') 
          : itinerary.endDate,
        createdAt: itinerary.createdAt instanceof Date 
          ? itinerary.createdAt.toISOString() 
          : itinerary.createdAt,
        days: itinerary.days.map(day => ({
          ...day,
          date: day.date instanceof Date 
            ? format(day.date, 'yyyy-MM-dd') 
            : day.date,
        })),
      }
      
      const { data, error } = await supabase.functions.invoke('enhance-itinerary', {
        body: { itinerary: serialized },
      })
      
      if (error) throw new Error(error.message || 'Failed to enhance itinerary')
      
      const enhanced = data?.itinerary
      if (!enhanced) throw new Error('No enhanced itinerary returned')
      
      // Convert dates back
      enhanced.startDate = new Date(enhanced.startDate)
      enhanced.endDate = new Date(enhanced.endDate)
      enhanced.createdAt = new Date(enhanced.createdAt || new Date())
      if (enhanced.days) {
        enhanced.days = enhanced.days.map((day: any) => ({
          ...day,
          date: new Date(day.date),
        }))
      }
      
      set({ itinerary: enhanced, isEnhancing: false })
    } catch (err) {
      console.error('Error enhancing itinerary:', err)
      set({ 
        error: err instanceof Error ? err.message : 'Failed to enhance itinerary',
        isEnhancing: false 
      })
    }
  },
  
  // Itinerary editing actions
  removePlaceFromDay: (dayIndex, placeId) => {
    const { itinerary } = get()
    if (!itinerary) return
    
    const newDays = [...itinerary.days]
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      places: newDays[dayIndex].places.filter(p => p.id !== placeId),
    }
    
    set({ itinerary: { ...itinerary, days: newDays } })
  },
  
  movePlaceToDay: (fromDayIndex, toDayIndex, placeId) => {
    const { itinerary } = get()
    if (!itinerary) return
    
    const newDays = [...itinerary.days]
    const place = newDays[fromDayIndex].places.find(p => p.id === placeId)
    if (!place) return
    
    newDays[fromDayIndex] = {
      ...newDays[fromDayIndex],
      places: newDays[fromDayIndex].places.filter(p => p.id !== placeId),
    }
    newDays[toDayIndex] = {
      ...newDays[toDayIndex],
      places: [...newDays[toDayIndex].places, place],
    }
    
    set({ itinerary: { ...itinerary, days: newDays } })
  },
  
  reorderPlaceInDay: (dayIndex, fromIndex, toIndex) => {
    const { itinerary } = get()
    if (!itinerary) return
    
    const newDays = [...itinerary.days]
    const places = [...newDays[dayIndex].places]
    const [movedPlace] = places.splice(fromIndex, 1)
    places.splice(toIndex, 0, movedPlace)
    
    newDays[dayIndex] = { ...newDays[dayIndex], places }
    set({ itinerary: { ...itinerary, days: newDays } })
  },
  
  addPlaceToDay: (dayIndex, place) => {
    const { itinerary } = get()
    if (!itinerary) return
    
    const newDays = [...itinerary.days]
    const lastPlace = newDays[dayIndex].places[newDays[dayIndex].places.length - 1]
    
    const itineraryPlace: ItineraryPlace = {
      ...place,
      startTime: lastPlace ? lastPlace.endTime : '09:00',
      endTime: lastPlace 
        ? `${String(parseInt(lastPlace.endTime.split(':')[0]) + Math.ceil(place.duration / 60)).padStart(2, '0')}:${lastPlace.endTime.split(':')[1]}` 
        : `${String(9 + Math.ceil(place.duration / 60)).padStart(2, '0')}:00`,
      travelTimeFromPrevious: lastPlace ? 15 : undefined,
    }
    
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      places: [...newDays[dayIndex].places, itineraryPlace],
    }
    
    set({ itinerary: { ...itinerary, days: newDays } })
  },
  
  setItinerary: (itinerary) => set({ itinerary }),
  
  setActiveDayIndex: (index) => set({ activeDayIndex: index }),
  
  clearError: () => set({ error: null }),
  
  resetPlanning: () => set({
    currentStep: 'destination',
    selectedDestination: null,
    destinationCoordinates: null,
    preferences: null,
    discoveredPlaces: [],
    selectedPlaces: [],
    itinerary: null,
    activeDayIndex: 0,
    isDiscovering: false,
    isGenerating: false,
    isEnhancing: false,
    error: null,
  }),
}))
