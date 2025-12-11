'use client'

import { useState } from 'react'
import { EventType } from '@/types'

export default function Filters() {
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [selectedType, setSelectedType] = useState<EventType | ''>('')

  const eventTypes: { value: EventType | ''; label: string }[] = [
    { value: '', label: 'All Events' },
    { value: 'commit', label: 'Commits' },
    { value: 'release', label: 'Releases' },
    { value: 'pr_merge', label: 'PR Merges' },
    { value: 'repo_update', label: 'Updates' },
  ]

  return (
    <div className="mb-8 flex flex-wrap gap-3">
      <select
        value={selectedRepo}
        onChange={(e) => setSelectedRepo(e.target.value)}
        className="px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
      >
        <option value="">All Repositories</option>
        {/* Repos will be populated dynamically */}
      </select>

      <div className="flex gap-2">
        {eventTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              selectedType === type.value
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  )
}
