export type EventType = 'commit' | 'release' | 'pr_merge' | 'pr_closed' | 'repo_update' | 'issue' | 'issue_closed'
export type EventStatus = 'pending' | 'approved' | 'rejected'

export interface Repo {
  id: string
  name: string
  url: string
  icon?: string
  created_at?: string
}

export interface Event {
  id: string
  repo_id: string
  repo?: Repo
  type: EventType
  title: string
  summary: string
  body?: string
  timestamp: string
  source_url: string
  github_delivery_id?: string
  github_event_id?: string
  tags: string[]
  status: EventStatus
  pinned: boolean
  created_at?: string
  updated_at?: string
}

export interface FilterOptions {
  repo?: string
  type?: EventType
  dateFrom?: string
  dateTo?: string
}
