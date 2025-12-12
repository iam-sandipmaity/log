'use client'

import { useEffect, useState } from 'react'
import { Event } from '@/types'
import { Trash2, Edit2, Pin, Check, X, Lock } from 'lucide-react'

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem('adminToken')
    if (savedToken) {
      setToken(savedToken)
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents()
    }
  }, [filter, isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.token)
        setIsAuthenticated(true)
        localStorage.setItem('adminToken', data.token)
        setPassword('')
      } else {
        setAuthError(data.error || 'Authentication failed')
      }
    } catch (error) {
      setAuthError('Failed to authenticate')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setToken(null)
    localStorage.removeItem('adminToken')
    setEvents([])
  }

  const fetchEvents = async () => {
    try {
      const url = filter === 'all'
        ? '/api/events?status=pending,approved'
        : `/api/events?status=${filter}`
      const response = await fetch(url)
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    if (!token) return

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (response.status === 401) {
        setAuthError('Session expired. Please login again.')
        handleLogout()
        return
      }

      if (response.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error('Failed to update event:', error)
    }
  }

  const deleteEvent = async (id: string) => {
    if (!token) return
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        setAuthError('Session expired. Please login again.')
        handleLogout()
        return
      }

      if (response.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  // Prevent hydration mismatch by waiting for client-side mount
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Enter admin password"
                required
              />
            </div>
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {authError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-accent text-white py-2 px-4 rounded-md hover:bg-accent/90 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex gap-2">
          {['all', 'pending', 'approved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded ${filter === f
                  ? 'bg-accent text-white'
                  : 'bg-white text-gray-700 border'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white border rounded-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded ${event.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                        {event.status}
                      </span>
                      <span className="text-sm text-gray-500">{event.type}</span>
                      {event.pinned && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          Pinned
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-2">{event.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {event.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateEvent(event.id, { status: 'approved' })}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Approve"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={() => updateEvent(event.id, { status: 'rejected' })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Reject"
                        >
                          <X size={20} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => updateEvent(event.id, { pinned: !event.pinned })}
                      className={`p-2 hover:bg-blue-50 rounded ${event.pinned ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      title="Toggle Pin"
                    >
                      <Pin size={20} />
                    </button>
                    <button
                      onClick={() => {/* TODO: Edit modal */ }}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      title="Edit"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
