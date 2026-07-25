import { NextResponse } from "next/server"
import { getPaymentClient } from "@/lib/mercadopago"
import { supabase } from "@/lib/supabase"
import type { PaymentStatus } from "@/lib/orders-store"

function mapStatus(mpStatus: string | undefined): PaymentStatus {
  switch (mpStatus) {
    case "approved": return "aprobado"
    case "rejected": return "rechazado"
    case "in_process":
    case "pending": return "en_proceso"
    default: return "pendiente"
  }
}

async function handleNotification(paymentId: string | null) {
  if (!paymentId) return
  const payment = await getPaymentClient().get({ id: paymentId })
  const externalReference = payment.external_reference
  if (!externalReference) return

  const paymentStatus = mapStatus(payment.status)

  const { error } = await supabase.rpc("confirm_order_payment", {
    p_order_id: externalReference,
    p_payment_status: paymentStatus,
    p_mp_payment_id: String(payment.id),
    p_status: paymentStatus === "aprobado" ? "confirmado" : null,
    p_secret: process.env.MP_DB_SECRET,
  })
  if (error) console.error("Error actualizando pedido tras webhook de Mercado Pago:", error)
}

// Mercado Pago manda la notificacion por query params (IPN clasico) o en el body (webhooks v2).
export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id")
    const topic = url.searchParams.get("type") || url.searchParams.get("topic")

    if (!paymentId) {
      const body = await req.json().catch(() => null)
      if (body?.data?.id) paymentId = String(body.data.id)
      if (body?.type === "payment" || topic === "payment" || !topic) {
        await handleNotification(paymentId)
      }
    } else if (topic === "payment" || !topic) {
      await handleNotification(paymentId)
    }
  } catch (e) {
    console.error("Error procesando webhook de Mercado Pago:", e)
  }
  // Siempre 200: si respondemos error, Mercado Pago reintenta agresivamente.
  return NextResponse.json({ received: true })
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
