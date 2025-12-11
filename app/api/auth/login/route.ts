import { NextRequest, NextResponse } from 'next/server'
import { createAdminToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    console.log('Login attempt - Password received:', password ? 'Yes' : 'No')
    console.log('ADMIN_PASSWORD set:', process.env.ADMIN_PASSWORD ? 'Yes' : 'No')

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const token = createAdminToken(password)

    if (!token) {
      console.log('Authentication failed - Invalid password')
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    console.log('Authentication successful')
    return NextResponse.json({
      success: true,
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
