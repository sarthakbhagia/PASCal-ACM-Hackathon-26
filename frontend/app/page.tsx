'use client'

import { Header } from '@/components/travel/header'
import { DestinationPicker } from '@/components/travel/destination-picker'
import { PreferencesForm } from '@/components/travel/preferences-form'
import { PlaceDiscovery } from '@/components/travel/place-discovery'
import { ItineraryView } from '@/components/travel/itinerary-view'
import { NavigationView } from '@/components/travel/navigation-view'
import { useTravelStore } from '@/lib/travel-store'

export default function TravelPlannerPage() {
  const { currentStep } = useTravelStore()
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {currentStep === 'destination' && <DestinationPicker />}
        {currentStep === 'preferences' && <PreferencesForm />}
        {currentStep === 'discover' && <PlaceDiscovery />}
        {currentStep === 'itinerary' && <ItineraryView />}
        {currentStep === 'navigation' && <NavigationView />}
      </main>
    </div>
  )
}
