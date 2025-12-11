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

    // Create the event
    const eventData = {
      ...normalizedEvent,
      repo_id: repoId,
    }

    const { data: insertedEvent, error: eventError } = await (supabaseAdmin as any)
      .from('events')
      .insert([eventData])
      .select()

    if (eventError) {
      console.error('Failed to create event:', eventError)
      return NextResponse.json(
        { error: 'Failed to create event', details: eventError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, event: insertedEvent }, { status: 201 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}
