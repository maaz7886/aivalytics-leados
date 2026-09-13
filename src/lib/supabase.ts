// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// NOTE: Replace these placeholder values with your actual Supabase project URL and anon public key.
const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Helper to get the current user with role metadata
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}
