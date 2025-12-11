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

    // Extract GitHub info from source_url
    let commitDetails = null

    if (event.type === 'commit' && event.source_url) {
      const githubToken = process.env.GITHUB_TOKEN

      // Try to fetch commit details from GitHub API
      if (githubToken) {
        try {
          // Parse owner/repo from source_url
          // Example: https://github.com/owner/repo/compare/abc...def
          // or https://github.com/owner/repo/commit/sha
          const urlMatch = event.source_url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
          
          if (urlMatch) {
            const [, owner, repo] = urlMatch
            
            // Check if it's a compare URL (multiple commits) or single commit
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
            } else if (event.source_url.includes('/commit/')) {
              // Single commit URL
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
