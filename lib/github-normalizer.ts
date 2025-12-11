import { EventType } from '@/types'

interface GitHubCommit {
  message: string
  url: string
  sha: string
  author: {
    name: string
  }
}

interface GitHubRelease {
  tag_name: string
  name: string
  body: string
  html_url: string
  published_at: string
}

interface GitHubPullRequest {
  title: string
  body: string
  html_url: string
  merged_at: string
  number: number
}

export function normalizeGitHubEvent(event: string, payload: any) {
  switch (event) {
    case 'push':
      return normalizePushEvent(payload)
    case 'release':
      return normalizeReleaseEvent(payload)
    case 'pull_request':
      if (payload.action === 'closed' && payload.pull_request.merged) {
        return normalizePRMergeEvent(payload)
      }
      return null
    case 'issues':
      if (payload.action === 'opened') {
        return normalizeIssueEvent(payload)
      }
      return null
    default:
      return null
  }
}

function normalizePushEvent(payload: any) {
  const commits: GitHubCommit[] = payload.commits || []
  const commitCount = commits.length

  if (commitCount === 0) return null

  const firstCommit = commits[0]
  const branch = payload.ref.replace('refs/heads/', '')

  return {
    type: 'commit' as EventType,
    title: commitCount === 1 
      ? firstCommit.message.split('\n')[0]
      : `${commitCount} new commits to ${branch}`,
    summary: commitCount === 1
      ? firstCommit.message
      : commits.map(c => `• ${c.message.split('\n')[0]}`).join('\n').slice(0, 500),
    body: commits.map(c => c.message).join('\n\n'),
    timestamp: new Date().toISOString(),
    source_url: payload.compare,
    tags: extractTags(commits.map(c => c.message).join(' ')),
    status: 'approved',
    pinned: false,
  }
}

function normalizeReleaseEvent(payload: any) {
  const release: GitHubRelease = payload.release

  return {
    type: 'release' as EventType,
    title: `Release ${release.tag_name}: ${release.name || release.tag_name}`,
    summary: release.body?.slice(0, 300) || 'New release published',
    body: release.body || '',
    timestamp: release.published_at,
    source_url: release.html_url,
    tags: ['release', ...extractTags(release.body || '')],
    status: 'approved',
    pinned: true,
  }
}

function normalizePRMergeEvent(payload: any) {
  const pr: GitHubPullRequest = payload.pull_request

  return {
    type: 'pr_merge' as EventType,
    title: `PR #${pr.number}: ${pr.title}`,
    summary: pr.body?.slice(0, 300) || 'Pull request merged',
    body: pr.body || '',
    timestamp: pr.merged_at,
    source_url: pr.html_url,
    tags: extractTags(`${pr.title} ${pr.body || ''}`),
    status: 'approved',
    pinned: false,
  }
}

function normalizeIssueEvent(payload: any) {
  const issue = payload.issue

  return {
    type: 'issue' as EventType,
    title: `Issue #${issue.number}: ${issue.title}`,
    summary: issue.body?.slice(0, 300) || 'New issue opened',
    body: issue.body || '',
    timestamp: issue.created_at,
    source_url: issue.html_url,
    tags: ['issue', ...extractTags(`${issue.title} ${issue.body || ''}`)],
    status: 'approved',
    pinned: false,
  }
}

function extractTags(text: string): string[] {
  const tags: string[] = []
  const lowerText = text.toLowerCase()

  const tagPatterns = [
    { pattern: /\bfix(es|ed)?\b|\bbug\b/i, tag: 'fix' },
    { pattern: /\bfeat(ure)?\b/i, tag: 'feature' },
    { pattern: /\bdocs?\b|\bdocumentation\b/i, tag: 'docs' },
    { pattern: /\brefactor\b/i, tag: 'refactor' },
    { pattern: /\btest(s|ing)?\b/i, tag: 'test' },
    { pattern: /\bchore\b/i, tag: 'chore' },
    { pattern: /\bperf(ormance)?\b/i, tag: 'performance' },
    { pattern: /\bstyle\b/i, tag: 'style' },
    { pattern: /\bsecurity\b/i, tag: 'security' },
  ]

  for (const { pattern, tag } of tagPatterns) {
    if (pattern.test(lowerText) && !tags.includes(tag)) {
      tags.push(tag)
    }
  }

  return tags.slice(0, 3)
}
