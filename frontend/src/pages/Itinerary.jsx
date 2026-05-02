import { useState, useMemo, useRef, useEffect } from 'react'
import { DndContext, closestCenter, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import EventBlock from '../components/EventBlock'
import EventDetail from '../components/EventDetail'
import mockItinerary from '../data/mockItinerary'

function Itinerary() {
  const [events, setEvents] = useState(mockItinerary)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [activeDay, setActiveDay] = useState(1)
  const sectionRefs = useRef({})

  const days = useMemo(() => {
    const maxDay = Math.max(...events.map((e) => e.day))
    return Array.from({ length: maxDay }, (_, i) => i + 1)
  }, [events])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  useEffect(() => {
    if (selectedEvent) {
      const updated = events.find((e) => e.id === selectedEvent.id)
      if (updated) setSelectedEvent(updated)
    }
  }, [events, selectedEvent])

  function handleDragStart(event) {
    setActiveId(event.active.id)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const activeEvent = events.find((e) => e.id === active.id)
    if (!activeEvent) return

    const dayEvents = events.filter((e) => e.day === activeEvent.day)
    const activeIndex = dayEvents.findIndex((e) => e.id === active.id)
    const overIndex = dayEvents.findIndex((e) => e.id === over.id)

    if (activeIndex === -1 || overIndex === -1) return

    const newDayEvents = [...dayEvents]
    const [removed] = newDayEvents.splice(activeIndex, 1)
    newDayEvents.splice(overIndex, 0, removed)

    const otherEvents = events.filter((e) => e.day !== activeEvent.day)
    setEvents([...otherEvents, ...newDayEvents].sort((a, b) => a.day - b.day))
  }

  function scrollToDay(day) {
    setActiveDay(day)
    sectionRefs.current[day]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function getDayEvents(day) {
    return events.filter((e) => e.day === day)
  }

  const activeEvent = activeId ? events.find((e) => e.id === activeId) : null

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-3">
      <div className="w-[60%] flex flex-col rounded-xl bg-surface border border-border overflow-hidden">
        <div className="flex items-center gap-1 px-4 py-3 border-b border-border">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => scrollToDay(day)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeDay === day
                  ? 'bg-blue-500 text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {days.map((day) => (
            <div key={day} ref={(el) => (sectionRefs.current[day] = el)}>
              <h3 className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-3 sticky top-0 bg-surface py-1 z-10">
                Day {day}
              </h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={getDayEvents(day).map((e) => e.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {getDayEvents(day).map((event) => (
                      <EventBlock
                        key={event.id}
                        event={event}
                        onClick={setSelectedEvent}
                        isSelected={selectedEvent?.id === event.id}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeEvent && (
                    <EventBlock
                      event={activeEvent}
                      onClick={() => {}}
                      isSelected={false}
                    />
                  )}
                </DragOverlay>
              </DndContext>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 rounded-xl bg-surface border border-border overflow-hidden flex flex-col">
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-text-primary text-sm font-semibold">Event Details</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <EventDetail event={selectedEvent} />
        </div>
      </div>
    </div>
  )
}

export default Itinerary
