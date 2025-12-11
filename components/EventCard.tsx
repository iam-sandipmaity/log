import { Event } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { GitCommit, GitPullRequest, Tag, Settings, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface EventCardProps {
  event: Event
}

const eventIcons = {
  commit: GitCommit,
  release: Tag,
  pr_merge: GitPullRequest,
  repo_update: Settings,
  issue: AlertCircle,
}

const eventColors = {
  commit: 'text-blue-600',
  release: 'text-green-600',
  pr_merge: 'text-purple-600',
  repo_update: 'text-orange-600',
  issue: 'text-red-600',
}

export default function EventCard({ event }: EventCardProps) {
  const Icon = eventIcons[event.type]
  const iconColor = eventColors[event.type]

  return (
    <article className="border border-gray-200 rounded-lg p-6 bg-white hover:border-accent hover:shadow-md transition-all duration-200 group">
      <Link href={`/events/${event.id}`} className="block">
        <div className="flex items-start gap-4">
          <div className={`mt-1 ${iconColor}`}>
            <Icon size={24} />
          </div>
          
          <div className="flex-grow">
            <div className="flex items-start justify-between mb-2">
              <div>
                {event.repo && (
                  <span className="text-sm text-gray-500 mb-1 inline-block">
                    {event.repo.name}
                  </span>
                )}
                <h3 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
                  {event.title}
                </h3>
              </div>
              {event.pinned && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                  Pinned
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-4">{event.summary}</p>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <time className="text-gray-500">
                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })} • {' '}
                {new Date(event.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>

              {event.tags.length > 0 && (
                <div className="flex gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <span className="ml-auto text-accent group-hover:underline">
                View Details →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
