export interface Place {
  id: string
  name: string
  description: string
  category: PlaceCategory
  coordinates: [number, number]
  rating: number
  duration: number // in minutes
  imageUrl: string
  address: string
  openingHours?: string
  price?: string
}

export type PlaceCategory = 
  | 'landmark'
  | 'restaurant'
  | 'museum'
  | 'park'
  | 'shopping'
  | 'entertainment'
  | 'beach'
  | 'nightlife'

export interface TravelPreferences {
  destination: string
  startDate: Date
  endDate: Date
  pace: 'relaxed' | 'moderate' | 'intensive'
  interests: PlaceCategory[]
  accommodationType: 'hotel' | 'hostel' | 'apartment' | 'resort'
  numPeople: number
  budget: number
  tripIdea: string
}

export interface ItineraryDay {
  date: Date
  places: ItineraryPlace[]
  totalDuration: number
  totalDistance: number
}

export interface ItineraryPlace extends Place {
  startTime: string
  endTime: string
  travelTimeFromPrevious?: number
  notes?: string
}

export interface Itinerary {
  id: string
  destination: string
  startDate: Date
  endDate: Date
  days: ItineraryDay[]
  createdAt: Date
}

export interface Destination {
  id: string
  name: string
  country: string
  coordinates: [number, number]
  description: string
  imageUrl: string
  bestTimeToVisit: string
  averageTemperature: string
  popularPlaces: number
}
