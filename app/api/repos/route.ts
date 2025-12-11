import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Repo } from '@/types'

// This ensures the route is not statically generated
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('repos')
      .select('*')
      .order('name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
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
