'use client'

import { useEffect, useState } from 'react'
import EventCard from './EventCard'
import { Event, EventType } from '@/types'

interface TimelineProps {
  selectedRepo: string
  selectedType: EventType | ''
}

export default function Timeline({ selectedRepo, selectedType }: TimelineProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [selectedRepo, selectedType])

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedRepo) params.append('repo', selectedRepo)
      if (selectedType) params.append('type', selectedType)
      
      const url = `/api/events${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url)
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
