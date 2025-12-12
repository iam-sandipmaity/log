import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { normalizeGitHubEvent } from '@/lib/github-normalizer'

// This ensures the route is not statically generated
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('x-hub-signature-256')
    const event = headersList.get('x-github-event')
    const deliveryId = headersList.get('x-github-delivery')

    // Verify webhook signature
    const secret = process.env.GITHUB_WEBHOOK_SECRET
    if (secret && signature) {
      const hmac = crypto.createHmac('sha256', secret)
      const digest = 'sha256=' + hmac.update(body).digest('hex')
      
      if (signature !== digest) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const payload = JSON.parse(body)

    // Handle ping event (webhook test)
    if (event === 'ping') {
      return NextResponse.json(
        { message: 'Webhook configured successfully! 🎉' },
        { status: 200 }
      )
    }

    // Extract GitHub-specific event ID for deduplication BEFORE normalization
    let githubEventId: string | null = null
    
    if (event === 'release') {
      const releaseId = payload.release?.id
      const tagName = payload.release?.tag_name
      githubEventId = releaseId ? `release-${releaseId}` : (tagName ? `release-tag-${tagName}` : null)
      console.log('Release webhook - releaseId:', releaseId, 'tagName:', tagName, 'githubEventId:', githubEventId)
    } else if (event === 'issues') {
      githubEventId = payload.issue?.id ? `issue-${payload.issue.id}-${payload.action}` : null
    } else if (event === 'pull_request') {
      githubEventId = payload.pull_request?.id ? `pr-${payload.pull_request.id}-${payload.action}` : null
    } else if (event === 'push') {
      githubEventId = payload.after || null
    }

    // Log webhook receipt for debugging
    console.log('Webhook received:', {
      deliveryId,
      event,
      githubEventId,
      repo: payload.repository?.full_name,
      action: payload.action,
      hasPayload: !!payload,
      payloadKeys: Object.keys(payload)
    })

    // Normalize the GitHub event
    const normalizedEvent = normalizeGitHubEvent(event!, payload)

    if (!normalizedEvent) {
      return NextResponse.json(
        { message: 'Event type not supported' },
        { status: 200 }
      )
    }

    // Ensure repository exists
    const repoData = {
      name: payload.repository.full_name,
      url: payload.repository.html_url,
      icon: payload.repository.owner.avatar_url,
    }

    // Check if repo exists (maybeSingle doesn't error if not found)
    const { data: existingRepo, error: repoFindError } = await (supabaseAdmin as any)
      .from('repos')
      .select('id')
      .eq('name', repoData.name)
      .maybeSingle()

    let repoId = existingRepo?.id

    if (!repoId) {
      const { data: newRepo, error: repoError } = await (supabaseAdmin as any)
        .from('repos')
        .insert([repoData])
        .select('id')
        .single()

      if (repoError) {
        console.error('Failed to create repo:', repoError)
        return NextResponse.json(
          { error: 'Failed to create repository', details: repoError.message },
          { status: 500 }
        )
      }

      repoId = newRepo.id
    }

    // Check if event already exists (pre-check for deduplication)
    if (githubEventId) {
      const { data: existingEvent } = await (supabaseAdmin as any)
        .from('events')
        .select('id, title')
        .eq('repo_id', repoId)
        .eq('github_event_id', githubEventId)
        .eq('type', normalizedEvent.type)
        .maybeSingle()

      if (existingEvent) {
        console.log('Duplicate event found, skipping:', { 
          githubEventId, 
          deliveryId,
          existingId: existingEvent.id 
        })
        return NextResponse.json(
          { message: 'Duplicate event, skipped', event: existingEvent },
          { status: 200 }
        )
      }
    }

    // Build event data
    const eventData = {
      ...normalizedEvent,
      repo_id: repoId,
      github_delivery_id: deliveryId,
      github_event_id: githubEventId,
    }

    // Insert the event (DB constraint will prevent duplicates in race conditions)
    const { data: insertedEvent, error: eventError } = await (supabaseAdmin as any)
      .from('events')
      .insert([eventData])
      .select()
      .single()

    if (eventError) {
      // If unique constraint violation, fetch and return existing event
      if (eventError.code === '23505') {
        console.log('Duplicate caught by DB constraint:', githubEventId)
        
        const { data: existingEvent } = await (supabaseAdmin as any)
          .from('events')
          .select('*')
          .eq('repo_id', repoId)
          .eq('github_event_id', githubEventId)
          .eq('type', normalizedEvent.type)
          .maybeSingle()

        return NextResponse.json(
          { message: 'Duplicate event, skipped', event: existingEvent },
          { status: 200 }
        )
      }

      console.error('Failed to create event:', eventError)
      return NextResponse.json(
        { error: 'Failed to create event', details: eventError.message },
        { status: 500 }
      )
    }

    console.log('Event created successfully:', { 
      id: insertedEvent.id, 
      githubEventId, 
      deliveryId 
    })

    return NextResponse.json({ success: true, event: insertedEvent }, { status: 201 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}
