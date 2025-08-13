"use client"

import { useState, useCallback } from "react"
import { apiService, type EventDto, type NoteDto } from "@/lib/api"

export interface Event {
  id: string
  claimNumber: string
  eventDate: string
  eventTime: string
  location: string
  city?: string
  postalCode?: string
  country?: string
  weatherConditions?: string
  roadConditions?: string
  trafficConditions?: string
  eventDescription?: string
  causeOfAccident?: string
  policeReportNumber?: string
  policeInvolved: boolean
  injuriesReported: boolean
  injuryDescription?: string
  createdAt: string
  updatedAt: string
  notes?: NoteDto[]
}

// Transform API event to frontend event format
const transformApiEvent = (apiEvent: EventDto): Event => ({
  id: apiEvent.id?.toString() || "",
  claimNumber: apiEvent.claimNumber || "",
  eventDate: apiEvent.damageDate ? new Date(apiEvent.damageDate).toLocaleDateString("pl-PL") : "",
  eventTime: apiEvent.eventTime?.split("T")[1]?.slice(0, 5) || "",
  location: apiEvent.location || "",
  city: apiEvent.location || "",
  postalCode: "",
  country: "PL",
  weatherConditions: "",
  roadConditions: "",
  trafficConditions: "",
  eventDescription: apiEvent.description || "",
  causeOfAccident: "",
  policeReportNumber: "",
  policeInvolved: apiEvent.servicesCalled?.includes("policja") || false,
  injuriesReported: false,
  injuryDescription: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  notes: apiEvent.notes || [],
})

// Transform frontend event to API format
const transformToApiEvent = (event: Partial<Event>): Partial<EventDto> => ({
  claimNumber: event.claimNumber || "",
  damageDate: event.eventDate || new Date().toISOString().split("T")[0],
  eventTime:
    event.eventDate && event.eventTime
      ? new Date(`${event.eventDate}T${event.eventTime}`).toISOString()
      : undefined,
  location: event.location || "",
  description: event.eventDescription,
  servicesCalled: event.policeInvolved ? ["policja"] : [],
  notes: event.notes,
})

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const apiEvents = await apiService.getEvents()
      const transformedEvents = apiEvents.map(transformApiEvent)
      setEvents(transformedEvents)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Błąd podczas pobierania wydarzeń"
      setError(errorMessage)
      console.error("Error fetching events:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const getEventByClaimNumber = async (claimNumber: string): Promise<Event | null> => {
    try {
      setError(null)
      const apiEvent = await apiService.getEventByClaimNumber(claimNumber)
      return transformApiEvent(apiEvent)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Błąd podczas pobierania wydarzenia"
      setError(errorMessage)
      console.error("Error fetching event:", err)
      return null
    }
  }

  const createEvent = async (eventData: Partial<Event>): Promise<Event | null> => {
    try {
      setError(null)
      const apiEventData = transformToApiEvent(eventData)
      const apiEvent = await apiService.createEvent(apiEventData)
      const newEvent = transformApiEvent(apiEvent)
      setEvents((prev) => [...prev, newEvent])
      return newEvent
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Błąd podczas tworzenia wydarzenia"
      setError(errorMessage)
      console.error("Error creating event:", err)
      return null
    }
  }

  const updateEvent = async (id: string, eventData: Partial<Event>): Promise<Event | null> => {
    try {
      setError(null)
      const apiEventData = transformToApiEvent(eventData)
      const apiEvent = await apiService.updateEvent(id, apiEventData)
      const existingEvent = events.find((event) => event.id === id)

      const updatedEvent: Event = apiEvent
        ? transformApiEvent(apiEvent)
        : { ...(existingEvent || {}), ...eventData } as Event

      setEvents((prev) => prev.map((event) => (event.id === id ? updatedEvent : event)))
      return updatedEvent
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Błąd podczas aktualizacji wydarzenia"
      setError(errorMessage)
      console.error("Error updating event:", err)
      return null
    }
  }

  const deleteEvent = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      await apiService.deleteEvent(id)
      setEvents((prev) => prev.filter((event) => event.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Błąd podczas usuwania wydarzenia"
      setError(errorMessage)
      console.error("Error deleting event:", err)
      return false
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    events,
    loading,
    error,
    fetchEvents,
    getEventByClaimNumber,
    createEvent,
    updateEvent,
    deleteEvent,
    clearError,
  }
}
