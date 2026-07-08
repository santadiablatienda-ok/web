// Credenciales del administrador
const ADMIN_USER = "SANTADIABLA.2026"
const ADMIN_PASSWORD = "SANTADIABLA.2026"
const AUTH_KEY = "sd_admin_session"

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function login(username: string, password: string): boolean {
  if (!isBrowser()) return false
  if (username.trim() === ADMIN_USER && password.trim() === ADMIN_PASSWORD) {
    const session = {
      user: username,
      expires: Date.now() + 1000 * 60 * 60 * 8, // 8 horas
    }
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(session))
      return true
    } catch {
      return false
    }
  }
  return false
}

export function logout(): void {
  if (!isBrowser()) return
  try { localStorage.removeItem(AUTH_KEY) } catch { /* noop */ }
}

export function isAuthenticated(): boolean {
  if (!isBrowser()) return false
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return false
    const session = JSON.parse(raw)
    if (!session?.expires || Date.now() > session.expires) {
      localStorage.removeItem(AUTH_KEY)
      return false
    }
    return true
  } catch {
    return false
  }
}
