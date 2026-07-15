import { supabase } from "@/lib/supabase"

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}

export async function isAuthenticated(): Promise<boolean> {
  const { data } = await supabase.auth.getSession()
  return !!data.session
}
