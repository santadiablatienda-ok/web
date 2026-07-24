"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { XCircle, MessageCircle } from "lucide-react"

function FailureContent() {
  const params = useSearchParams()
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    setOrderId(params.get("order"))
  }, [params])

  const whatsappUrl = `https://wa.me/5493456623935?text=${encodeURIComponent(
    orderId ? `Hola! Intente pagar el pedido #${orderId} con Mercado Pago pero no se pudo procesar. Me ayudan a coordinarlo?` : "Hola! Intente pagar un pedido con Mercado Pago pero no se pudo procesar."
  )}`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="w-16 h-16 flex items-center justify-center" style={{ backgroundColor: "#000" }}>
        <XCircle size={32} color="#fff" />
      </div>
      <div>
        <h1 className="text-2xl font-black uppercase mb-2">No se pudo procesar el pago</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          {orderId && <>Pedido <strong>#{orderId}</strong>.<br /></>}
          Podes volver a intentarlo o coordinar el pago por WhatsApp.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Link
          href="/"
          className="px-6 py-3 text-xs font-bold uppercase tracking-widest"
          style={{ backgroundColor: "#000", color: "#fff", letterSpacing: "0.1em" }}
        >
          Volver a la tienda
        </Link>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest border"
          style={{ borderColor: "#000", color: "#000", letterSpacing: "0.1em" }}
        >
          <MessageCircle size={15} />
          Coordinar por WhatsApp
        </a>
      </div>
    </div>
  )
}

export default function CheckoutFailurePage() {
  return (
    <Suspense>
      <FailureContent />
    </Suspense>
  )
}
