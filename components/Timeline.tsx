'use client'

import { useEffect, useState } from 'react'
import EventCard from './EventCard'
import { Event } from '@/types'

export default function Timeline() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No events yet. Start pushing to your repositories!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => (
        <div
          key={event.id}
          className="animate-fade-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <EventCard event={event} />
        </div>
      ))}
    </div>
  )
}
