import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdminToken } from '@/lib/auth'
import type { Event } from '@/types'

// This ensures the route is not statically generated
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const repo = searchParams.get('repo')
    const type = searchParams.get('type')
    const status = searchParams.get('status') || 'approved'

    // Require authentication for non-approved status queries (admin operations)
    if (status !== 'approved' || status.includes('pending')) {
      if (!verifyAdminToken(request)) {
        return NextResponse.json(
          { error: 'Unauthorized. Admin authentication required.' },
          { status: 401 }
        )
      }
    }

    let query = supabase
      .from('events')
      .select(`
        *,
        repo:repos(*)
      `)
      .eq('status', status)
      .order('pinned', { ascending: false })
      .order('timestamp', { ascending: false })

    if (repo) {
      query = query.eq('repo_id', repo)
    }

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error fetching events:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<Event>

    const { data, error } = await (supabase as any)
      .from('events')
      .insert([body])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
