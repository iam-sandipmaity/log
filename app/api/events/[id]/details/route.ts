import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get event details
    const { data: event, error } = await (supabase as any)
      .from('events')
      .select(`
        *,
        repo:repos(*)
      `)
      .eq('id', id)
      .single()

    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Extract GitHub info from source_url for any event type
    let commitDetails = null

    // Fetch commit details for any event with a GitHub source URL
    // This includes: commits, PRs (merge/closed), releases, and issues
    if (event.source_url && event.source_url.includes('github.com')) {
      const githubToken = process.env.GITHUB_TOKEN

      // Try to fetch commit details from GitHub API
      if (githubToken) {
        try {
          // Parse owner/repo from source_url
          // Example: https://github.com/owner/repo/compare/abc...def
          // or https://github.com/owner/repo/commit/sha
          // or https://github.com/owner/repo/pull/123
          const urlMatch = event.source_url.match(/github\.com\/([^\/]+)\/([^\/]+)/)

          if (urlMatch) {
            const [, owner, repo] = urlMatch

            // Handle different URL patterns
            // 1. Compare URLs (multiple commits)
            if (event.source_url.includes('/compare/')) {
              // For compare URLs, extract commit range
              const compareMatch = event.source_url.match(/compare\/([^\.]+)\.\.\.([^\/\?#]+)/)
              if (compareMatch) {
                const [, base, head] = compareMatch

                // Fetch compare data
                const compareUrl = `https://api.github.com/repos/${owner}/${repo}/compare/${base}...${head}`
                const compareResponse = await fetch(compareUrl, {
                  headers: {
                    Authorization: `Bearer ${githubToken}`,
                    Accept: 'application/vnd.github.v3+json',
                  },
                })

                if (compareResponse.ok) {
                  const compareData = await compareResponse.json()
                  commitDetails = {
                    commits: compareData.commits.map((c: any) => ({
                      sha: c.sha,
                      message: c.commit.message,
                      author: c.commit.author,
                      url: c.html_url,
                    })),
                    files: compareData.files.map((f: any) => ({
                      filename: f.filename,
                      status: f.status,
                      additions: f.additions,
                      deletions: f.deletions,
                      changes: f.changes,
                      patch: f.patch,
                    })),
                    stats: {
                      total_commits: compareData.commits.length,
                      files_changed: compareData.files.length,
                      additions: compareData.files.reduce((sum: number, f: any) => sum + f.additions, 0),
                      deletions: compareData.files.reduce((sum: number, f: any) => sum + f.deletions, 0),
                    },
                  }
                }
              }
            }
            // 2. Pull request URLs
            else if (event.source_url.includes('/pull/')) {
              const prMatch = event.source_url.match(/pull\/(\d+)/)
              if (prMatch) {
                const prNumber = prMatch[1]

                // Fetch PR commits
                const prUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/commits`
                const prResponse = await fetch(prUrl, {
                  headers: {
                    Authorization: `Bearer ${githubToken}`,
                    Accept: 'application/vnd.github.v3+json',
                  },
                })

                if (prResponse.ok) {
                  const commits = await prResponse.json()

                  // Also fetch PR files
                  const filesUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`
                  const filesResponse = await fetch(filesUrl, {
                    headers: {
                      Authorization: `Bearer ${githubToken}`,
                      Accept: 'application/vnd.github.v3+json',
                    },
                  })

                  let files = []
                  let additions = 0
                  let deletions = 0

                  if (filesResponse.ok) {
                    files = await filesResponse.json()
                    additions = files.reduce((sum: number, f: any) => sum + (f.additions || 0), 0)
                    deletions = files.reduce((sum: number, f: any) => sum + (f.deletions || 0), 0)
                  }

                  commitDetails = {
                    commits: commits.map((c: any) => ({
                      sha: c.sha,
                      message: c.commit.message,
                      author: c.commit.author,
                      url: c.html_url,
                    })),
                    files: files.map((f: any) => ({
                      filename: f.filename,
                      status: f.status,
                      additions: f.additions || 0,
                      deletions: f.deletions || 0,
                      changes: f.changes || 0,
                      patch: f.patch,
                    })),
                    stats: {
                      total_commits: commits.length,
                      files_changed: files.length,
                      additions,
                      deletions,
                    },
                  }
                }
              }
            }
            // 3. Release URLs
            else if (event.source_url.includes('/releases/tag/') || event.source_url.includes('/releases/')) {
              const releaseMatch = event.source_url.match(/releases\/tag\/([^\/\?#]+)/)
              if (releaseMatch) {
                const tagName = releaseMatch[1]

                // Fetch tag information to get the commit SHA
                const tagUrl = `https://api.github.com/repos/${owner}/${repo}/git/refs/tags/${tagName}`
                const tagResponse = await fetch(tagUrl, {
                  headers: {
                    Authorization: `Bearer ${githubToken}`,
                    Accept: 'application/vnd.github.v3+json',
                  },
                })

                if (tagResponse.ok) {
                  const tagData = await tagResponse.json()
                  const commitSha = tagData.object.sha

                  // Fetch the commit details
                  const commitUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`
                  const commitResponse = await fetch(commitUrl, {
                    headers: {
                      Authorization: `Bearer ${githubToken}`,
                      Accept: 'application/vnd.github.v3+json',
                    },
                  })

                  if (commitResponse.ok) {
                    const commitData = await commitResponse.json()
                    commitDetails = {
                      commits: [{
                        sha: commitData.sha,
                        message: commitData.commit.message,
                        author: commitData.commit.author,
                        url: commitData.html_url,
                      }],
                      files: commitData.files?.map((f: any) => ({
                        filename: f.filename,
                        status: f.status,
                        additions: f.additions,
                        deletions: f.deletions,
                        changes: f.changes,
                        patch: f.patch,
                      })) || [],
                      stats: {
                        total_commits: 1,
                        files_changed: commitData.files?.length || 0,
                        additions: commitData.stats?.additions || 0,
                        deletions: commitData.stats?.deletions || 0,
                      },
                    }
                  }
                }
              }
            }
            // 4. Single commit URLs
            else if (event.source_url.includes('/commit/')) {
              const commitMatch = event.source_url.match(/commit\/([a-f0-9]+)/)
              if (commitMatch) {
                const sha = commitMatch[1]

                const commitUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`
                const commitResponse = await fetch(commitUrl, {
                  headers: {
                    Authorization: `Bearer ${githubToken}`,
                    Accept: 'application/vnd.github.v3+json',
                  },
                })

                if (commitResponse.ok) {
                  const commitData = await commitResponse.json()
                  commitDetails = {
                    commits: [{
                      sha: commitData.sha,
                      message: commitData.commit.message,
                      author: commitData.commit.author,
                      url: commitData.html_url,
                    }],
                    files: commitData.files.map((f: any) => ({
                      filename: f.filename,
                      status: f.status,
                      additions: f.additions,
                      deletions: f.deletions,
                      changes: f.changes,
                      patch: f.patch,
                    })),
                    stats: {
                      total_commits: 1,
                      files_changed: commitData.files.length,
                      additions: commitData.stats.additions,
                      deletions: commitData.stats.deletions,
                    },
                  }
                }
              }
            }
          }
        } catch (githubError) {
          console.error('Failed to fetch from GitHub:', githubError)
          // Continue without GitHub details
        }
      }
    }

    return NextResponse.json({
      event,
      details: commitDetails,
    })
  } catch (error) {
    console.error('Failed to fetch event details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event details' },
      { status: 500 }
    )
  }
}
