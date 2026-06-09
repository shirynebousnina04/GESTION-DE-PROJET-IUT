import { updateSession } from "@/lib/supabase/proxy"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Rate limiting basique en mémoire (par IP, fenêtre de 1 minute)
// Note : fonctionne par instance — pour la production, utiliser Upstash Redis
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 10 // max tentatives par fenêtre
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true
  }

  entry.count++
  return false
}

export async function middleware(request: NextRequest) {
  // Rate limiting sur les routes d'authentification
  if (request.nextUrl.pathname.startsWith("/auth")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "unknown"

    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: "Trop de tentatives. Veuillez réessayer dans 1 minute." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
