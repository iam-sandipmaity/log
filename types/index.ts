export type EventType = 'commit' | 'release' | 'pr_merge' | 'repo_update' | 'issue'
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
