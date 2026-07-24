"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Clock } from "lucide-react"

function PendingContent() {
  const params = useSearchParams()
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    setOrderId(params.get("order"))
    try {
      localStorage.removeItem("santa-diabla-cart")
    } catch { /* ignore */ }
  }, [params])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="w-16 h-16 flex items-center justify-center" style={{ backgroundColor: "#000" }}>
        <Clock size={32} color="#fff" />
      </div>
      <div>
        <h1 className="text-2xl font-black uppercase mb-2">Pago en proceso</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          {orderId ? <>Tu pedido <strong>#{orderId}</strong> quedo registrado.</> : "Tu pedido quedo registrado."}
          <br />En cuanto se acredite el pago te confirmamos por WhatsApp.
        </p>
      </div>
      <Link
        href="/"
        className="px-6 py-3 text-xs font-bold uppercase tracking-widest"
        style={{ backgroundColor: "#000", color: "#fff", letterSpacing: "0.1em" }}
      >
        Volver a la tienda
      </Link>
    </div>
  )
}

export default function CheckoutPendingPage() {
  return (
    <Suspense>
      <PendingContent />
    </Suspense>
  )
}
