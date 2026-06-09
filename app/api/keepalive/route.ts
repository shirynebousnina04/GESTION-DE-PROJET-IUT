import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/keepalive
 *
 * Endpoint de réveil pour éviter la mise en pause automatique de Supabase
 * sur le plan gratuit (pause après 7 jours d'inactivité).
 *
 * À appeler depuis un service cron externe (ex: cron-job.org) toutes les 48h.
 * URL à configurer : https://votre-domaine.vercel.app/api/keepalive
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Requête légère pour maintenir la connexion active
    const { error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })

    if (error) {
      console.error("[keepalive] Erreur Supabase:", error.message)
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "ok",
      message: "Supabase est actif",
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[keepalive] Erreur inattendue:", err)
    return NextResponse.json(
      { status: "error", message: "Erreur inattendue" },
      { status: 500 },
    )
  }
}
