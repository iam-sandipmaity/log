'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DiffViewer from '@/components/DiffViewer'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import type { Event } from '@/types'

interface CommitDetails {
  commits: Array<{
    sha: string
    message: string
    author: {
      name: string
      email: string
      date: string
    }
    url: string
  }>
  files: Array<{
    filename: string
    status: string
    additions: number
    deletions: number
    changes: number
    patch?: string
  }>
  stats: {
    total_commits: number
    files_changed: number
    additions: number
    deletions: number
  }
}

interface EventDetailsData {
  event: Event
  details: CommitDetails | null
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<EventDetailsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!params.id) return

    fetch(`/api/events/${params.id}/details`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setData(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        setError('Failed to load event details')
        setLoading(false)
      })
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Event Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Timeline
          </button>
        </div>
      </div>
    )
  }

  const { event, details } = data

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Timeline
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {event.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-2">
                  {event.repo?.name}
                </span>
                <span>•</span>
                <span>{new Date(event.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
            {event.pinned && (
              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                Pinned
              </div>
            )}
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Summary</h2>
          <MarkdownRenderer
            content={event.summary}
            className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none"
          />
          {event.body && event.body !== event.summary && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">Details</h3>
              <MarkdownRenderer
                content={event.body}
                className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none"
              />
            </>
          )}
        </div>

        {/* Commit Details - Only show for commit types (not releases, PRs, or issues) */}
        {details && !['release', 'pr_merge', 'pr_closed', 'issue', 'issue_closed'].includes(event.type) && (
          <>
            {/* Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Changes</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {details.stats.total_commits}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {details.stats.total_commits === 1 ? 'Commit' : 'Commits'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {details.stats.files_changed}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Files Changed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    +{details.stats.additions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Additions
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    -{details.stats.deletions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Deletions
                  </div>
                </div>
              </div>
            </div>

            {/* Commits List */}
            {details.commits.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Commits {details.commits.length > 1 && `(${details.commits.length})`}
                </h2>
                <div className="space-y-4">
                  {details.commits.map((commit) => (
                    <div key={commit.sha} className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <a
                          href={commit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          title="View commit on GitHub"
                        >
                          {commit.sha.substring(0, 7)}
                        </a>
                      </div>
                      <MarkdownRenderer
                        content={commit.message.split('\n')[0]}
                        className="text-gray-900 dark:text-white font-medium prose prose-sm dark:prose-invert max-w-none [&>*]:inline [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 mb-2"
                      />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {commit.author.name} • {new Date(commit.author.date).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Changes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Files Changed ({details.files.length})
              </h2>
              <div className="space-y-2">
                {details.files.map((file, idx) => (
                  <DiffViewer
                    key={idx}
                    filename={file.filename}
                    patch={file.patch}
                    status={file.status}
                    additions={file.additions}
                    deletions={file.deletions}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Pull Request Information - Only for PR events */}
        {(event.type === 'pr_merge' || event.type === 'pr_closed') && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pull Request Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">PR Number:</span>
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-lg text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  #{event.source_url.match(/pull\/(\d+)/)?.[1] || 'View PR'}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Status:</span>
                <span className={`px-3 py-1 text-sm rounded-full ${event.type === 'pr_merge'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                  {event.type === 'pr_merge' ? 'Merged' : 'Closed'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Date:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Issue Information - Only for issue events */}
        {(event.type === 'issue' || event.type === 'issue_closed') && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Issue Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Issue Number:</span>
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-lg text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  #{event.source_url.match(/issues\/(\d+)/)?.[1] || 'View Issue'}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Status:</span>
                <span className={`px-3 py-1 text-sm rounded-full ${event.type === 'issue_closed'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                  }`}>
                  {event.type === 'issue_closed' ? 'Closed' : 'Open'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Date:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Release Information - Only for release events */}
        {event.type === 'release' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Release Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Release Tag:</span>
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-lg text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  {event.source_url.split('/').pop() || 'View Release'}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Date:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* View on GitHub */}
        <div className="mt-6 text-center">
          <a
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            View on GitHub
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
