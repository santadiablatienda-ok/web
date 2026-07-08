"use client"

import { Banknote, CreditCard, Building2, Wallet } from "lucide-react"

const methods = [
  {
    icon: Banknote,
    title: "Transferencia bancaria",
    description: "Transferi desde cualquier banco o billetera virtual al instante.",
  },
  {
    icon: Building2,
    title: "Deposito bancario",
    description: "Realizá un deposito en efectivo en cualquier sucursal bancaria.",
  },
  {
    icon: CreditCard,
    title: "Tarjeta credito / debito",
    description: "Visa, Mastercard, Cabal y mas. Cuotas disponibles.",
  },
  {
    icon: Wallet,
    title: "Billeteras virtuales",
    description: "Mercado Pago, Uala, Naranja X y otras billeteras aceptadas.",
  },
]

export function PaymentMethods() {
  return (
    <section id="pagos" className="py-16 px-6 md:px-8" style={{ backgroundColor: "#fff" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#9E9E9E", letterSpacing: "0.2em" }}
          >
            Pagos
          </p>
          <h2
            className="text-2xl md:text-3xl font-black uppercase"
            style={{ color: "#000", letterSpacing: "-0.02em" }}
          >
            Medios de pago
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {methods.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="p-6 flex flex-col gap-4 border transition-all hover:-translate-y-1"
              style={{ border: "1px solid #E0E0E0" }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{ backgroundColor: "#000" }}
              >
                <Icon size={18} style={{ color: "#fff" }} />
              </div>
              <div>
                <p className="text-sm font-bold mb-1" style={{ color: "#000" }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "#9E9E9E" }}>{description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs mt-8" style={{ color: "#9E9E9E" }}>
          Para coordinar el pago escribinos por{" "}
          <a
            href="https://wa.me/5493456623935"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline"
            style={{ color: "#000" }}
          >
            WhatsApp
          </a>
          .
        </p>
      </div>
    </section>
  )
}
