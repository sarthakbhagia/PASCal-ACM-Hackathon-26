'use client'

import { Compass, Map, Calendar, Navigation, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTravelStore } from '@/lib/travel-store'
import { cn } from '@/lib/utils'

const steps = [
  { id: 'destination', label: 'Destination', icon: Compass },
  { id: 'preferences', label: 'Preferences', icon: Calendar },
  { id: 'discover', label: 'Discover', icon: Map },
  { id: 'itinerary', label: 'Itinerary', icon: Navigation },
] as const

export function Header() {
  const { currentStep, resetPlanning, selectedDestination } = useTravelStore()
  
  const currentStepIndex = steps.findIndex(s => s.id === currentStep)
  
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Voyager</h1>
              <p className="text-xs text-muted-foreground">Smart Travel Planner</p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <nav className="hidden md:flex items-center gap-1">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isPast = index < currentStepIndex
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                      isActive && 'bg-primary text-primary-foreground',
                      isPast && 'text-primary',
                      !isActive && !isPast && 'text-muted-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      'w-8 h-0.5 mx-1',
                      index < currentStepIndex ? 'bg-primary' : 'bg-border'
                    )} />
                  )}
                </div>
              )
            })}
          </nav>
          
          <div className="flex items-center gap-3">
            {selectedDestination && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm">
                <span className="text-muted-foreground">Destination:</span>
                <span className="font-medium">{selectedDestination}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetPlanning}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Start Over</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
