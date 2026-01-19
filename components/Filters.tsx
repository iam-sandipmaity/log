'use client'

import { EventType, Repo } from '@/types'

interface FiltersProps {
  selectedRepo: string
  selectedType: EventType | ''
  repos: Repo[]
  onRepoChange: (repo: string) => void
  onTypeChange: (type: EventType | '') => void
}

export default function Filters({
  selectedRepo,
  selectedType,
  repos,
  onRepoChange,
  onTypeChange,
}: FiltersProps) {
  const eventTypes: { value: EventType | ''; label: string }[] = [
    { value: '', label: 'All Events' },
    { value: 'commit', label: 'Commits' },
    { value: 'release', label: 'Releases' },
    { value: 'pr_merge', label: 'PR Merges' },
    { value: 'repo_update', label: 'Updates' },
    { value: 'issue', label: 'Issues' },
  ]

  return (
    <div className="mb-8 flex flex-wrap gap-3">
      <select
        value={selectedRepo}
        onChange={(e) => onRepoChange(e.target.value)}
        className="px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
      >
        <option value="">All Repositories</option>
        {Array.isArray(repos) && repos.map((repo) => (
          <option key={repo.id} value={repo.id}>
            {repo.name}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-2">
        {eventTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onTypeChange(type.value)}
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
