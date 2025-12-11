import { createClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time errors
let _supabase: ReturnType<typeof createClient> | null = null
let _supabaseAdmin: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return _supabaseAdmin
}

// Legacy named exports - will be initialized at runtime only when accessed
export const supabase = getSupabase()
export const supabaseAdmin = getSupabaseAdmin()
