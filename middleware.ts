import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rate limit liviano en memoria por instancia de Edge (sin dependencias externas).
// No es un contador global perfecto entre regiones/instancias, pero frena
// scripts que pegan muchos requests seguidos a /admin y /api/instagram.
const WINDOW_MS = 60_000
const LIMITS: Record<string, number> = {
  "/admin/login": 20,
  "/admin": 60,
  "/api/instagram": 30,
  "/api/mercadopago/create-preference": 15,
}

const hits = new Map<string, { count: number; resetAt: number }>()

function limitFor(pathname: string): { key: string; max: number } | null {
  for (const prefix of Object.keys(LIMITS)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return { key: prefix, max: LIMITS[prefix] }
    }
  }
  return null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const rule = limitFor(pathname)
  if (!rule) return NextResponse.next()

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown"
  const key = `${rule.key}:${ip}`
  const now = Date.now()

  const entry = hits.get(key)
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return NextResponse.next()
  }

  entry.count += 1
  if (entry.count > rule.max) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Probá de nuevo en un minuto." },
      { status: 429, headers: { "Retry-After": "60" } }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/instagram/:path*", "/api/mercadopago/create-preference"],
}
