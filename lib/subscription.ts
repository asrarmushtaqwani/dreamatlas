import { createClient } from '@/lib/supabase/server'

/**
 * Check if the current user has Pro access.
 * Used in server components and API routes.
 */
export async function getProStatus(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('profiles')
    .select('is_pro')
    .eq('id', user.id)
    .single()

  return data?.is_pro === true
}

/**
 * Client-side hook to get Pro status from profile data.
 * Pass the profile object you already fetched.
 */
export function isProUser(profile: { is_pro?: boolean } | null): boolean {
  return profile?.is_pro === true
}