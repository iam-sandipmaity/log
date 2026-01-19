import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Repo } from '@/types'

// This ensures the route is not statically generated
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // First, get all unique repo IDs that have events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('repo_id')

    if (eventsError) {
      console.error('Supabase error fetching events:', eventsError)
      return NextResponse.json({ error: eventsError.message }, { status: 500 })
    }

    // Get unique repo IDs
    const repoIdsWithEvents = [...new Set((events as { repo_id: string }[] | null)?.map(e => e.repo_id) || [])]

    // If no events exist, return empty array
    if (repoIdsWithEvents.length === 0) {
      return NextResponse.json([])
    }

    // Fetch only repos that have events
    const { data, error } = await supabase
      .from('repos')
      .select('*')
      .in('id', repoIdsWithEvents)
      .order('name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/repos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<Repo>

    const { data, error } = await (supabase as any)
      .from('repos')
      .insert([body])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create repository' },
      { status: 500 }
    )
  }
}
