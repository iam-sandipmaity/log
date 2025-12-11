import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminToken } from '@/lib/auth'
import type { Event } from '@/types'

// This ensures the route is not statically generated
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify authentication
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin authentication required.' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const body = await request.json() as Partial<Event>

    const { data, error } = await (supabaseAdmin as any)
      .from('events')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify authentication
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin authentication required.' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
