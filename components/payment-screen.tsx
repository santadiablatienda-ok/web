"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronLeft, Minus, Plus, User, Package, CreditCard,
  Truck, Store, Banknote, Wallet, MessageCircle, Loader2, Hash,
} from "lucide-react"
import { type Product, formatPrice, finalPrice } from "@/lib/products"
import { saveOrder, type Order } from "@/lib/orders-store"

interface PaymentScreenProps {
  product: Product
  initialSize?: string
  initialColor?: string
}

type ShippingType = "envio" | "retiro"
type PaymentType = "transferencia" | "mercadopago"

interface OrderForm {
  nombre: string
  telefono: string
  email: string
  shippingType: ShippingType
  direccion: string
  localidad: string
  provincia: string
  codigoPostal: string
  paymentType: PaymentType
  nota: string
}

const PAYMENT_LABELS: Record<PaymentType, string> = {
  transferencia: "Transferencia (coordino por WhatsApp)",
  mercadopago: "Mercado Pago (pago online)",
}

const defaultForm: OrderForm = {
  nombre: "", telefono: "", email: "",
  shippingType: "envio",
  direccion: "", localidad: "", provincia: "", codigoPostal: "",
  paymentType: "mercadopago",
  nota: "",
}

function generateOrderId() {
  const now = new Date()
  const date = `${String(now.getDate()).padStart(2, "0")}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getFullYear()).slice(2)}`
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `SD-${date}-${rand}`
}

const border = "#E0E0E0"
const textPrimary = "#000"
const textSecondary = "#5C5C5C"
const textMuted = "#9E9E9E"

export function PaymentScreen({ product, initialSize, initialColor }: PaymentScreenProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(initialSize || "")
  const [selectedColor, setSelectedColor] = useState(initialColor || "")
  const [form, setForm] = useState<OrderForm>(defaultForm)
  const [orderId] = useState(generateOrderId)
  const [errors, setErrors] = useState<Partial<Record<keyof OrderForm, string>>>({})
  const [variantError, setVariantError] = useState(false)
  const [mpLoading, setMpLoading] = useState(false)
  const [mpError, setMpError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const hasSizes = product.sizes && product.sizes.length > 0
  const hasColors = product.colors && product.colors.length > 1
  const singleColor = product.colors && product.colors.length === 1 ? product.colors[0] : undefined
  const effectiveColor = selectedColor || singleColor

  const unitPrice = finalPrice(product)
  const lineTotal = unitPrice * quantity

  function setField<K extends keyof OrderForm>(key: K, value: OrderForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<Record<keyof OrderForm, string>> = {}
    if (!form.nombre.trim()) e.nombre = "Ingresa tu nombre completo"
    if (!form.telefono.trim()) e.telefono = "Ingresa tu telefono"
    if (form.shippingType === "envio") {
      if (!form.direccion.trim()) e.direccion = "Ingresa tu direccion"
      if (!form.localidad.trim()) e.localidad = "Ingresa tu localidad"
      if (!form.provincia.trim()) e.provincia = "Ingresa tu provincia"
    }
    let variantOk = true
    if ((hasSizes && !selectedSize) || (hasColors && !selectedColor)) {
      setVariantError(true)
      setTimeout(() => setVariantError(false), 2500)
      variantOk = false
    }
    setErrors(e)
    return Object.keys(e).length === 0 && variantOk
  }

  function buildWhatsAppMessage(): string {
    const variant = [selectedSize ? `Talle ${selectedSize}` : null, effectiveColor].filter(Boolean).join(" - ")
    const shipping =
      form.shippingType === "envio"
        ? `Envio a domicilio\n  ${form.direccion}, ${form.localidad}, ${form.provincia}${form.codigoPostal ? ` CP ${form.codigoPostal}` : ""}`
        : "Retiro coordinado por WhatsApp"

    const lines = [
      `Nuevo pedido #${orderId}`,
      ``,
      `Cliente`,
      `  Nombre: ${form.nombre}`,
      `  Telefono: ${form.telefono}`,
      form.email ? `  Email: ${form.email}` : null,
      ``,
      `Producto`,
      `  ${product.name}${variant ? ` (${variant})` : ""} x${quantity}  ${formatPrice(lineTotal)}`,
      ``,
      `Total: ${formatPrice(lineTotal)}`,
      ``,
      `Entrega`,
      `  ${shipping}`,
      ``,
      `Forma de pago`,
      `  ${PAYMENT_LABELS[form.paymentType]}`,
      form.nota.trim() ? `\nNota: ${form.nota}` : null,
      ``,
      `Pedido enviado desde santadiabla.com`,
    ]
    return lines.filter((l) => l !== null).join("\n")
  }

  async function handleWhatsAppPay() {
    if (!validate()) return
    const order: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      nombre: form.nombre,
      telefono: form.telefono,
      email: form.email || undefined,
      items: [{
        name: product.name,
        size: selectedSize || undefined,
        color: effectiveColor || undefined,
        quantity,
        price: unitPrice,
        category: product.category,
      }],
      total: lineTotal,
      depositDue: lineTotal,
      shippingType: form.shippingType,
      direccion: form.shippingType === "envio" ? form.direccion : undefined,
      localidad: form.shippingType === "envio" ? form.localidad : undefined,
      provincia: form.shippingType === "envio" ? form.provincia : undefined,
      paymentType: PAYMENT_LABELS.transferencia,
      nota: form.nota || undefined,
      status: "pendiente",
    }
    try {
      await saveOrder(order)
    } catch (e) {
      console.error("No se pudo registrar el pedido:", e)
    }
    setSent(true)
    window.open(`https://wa.me/5493456623935?text=${encodeURIComponent(buildWhatsAppMessage())}`, "_blank")
  }

  async function handleMercadoPagoPay() {
    if (!validate()) return
    setMpLoading(true)
    setMpError(null)
    try {
      const res = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          items: [{
            productId: product.id,
            quantity,
            selectedSize: selectedSize || undefined,
            selectedColor: effectiveColor || undefined,
            isBackorder: false,
          }],
          nombre: form.nombre,
          telefono: form.telefono,
          email: form.email || undefined,
          shippingType: form.shippingType,
          direccion: form.direccion,
          localidad: form.localidad,
          provincia: form.provincia,
          nota: form.nota || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.initPoint) {
        throw new Error(data.error || "No se pudo iniciar el pago")
      }
      window.location.href = data.initPoint
    } catch (e) {
      setMpError(e instanceof Error ? e.message : "No se pudo iniciar el pago con Mercado Pago")
      setMpLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="w-16 h-16 flex items-center justify-center" style={{ backgroundColor: "#000" }}>
          <MessageCircle size={32} color="#fff" />
        </div>
        <div>
          <h1 className="text-xl font-black uppercase mb-2">Pedido enviado</h1>
          <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
            Tu pedido <strong>#{orderId}</strong> se envio por WhatsApp. Te confirmamos disponibilidad y coordinamos el pago y la entrega.
          </p>
        </div>
        <Link href="/" className="px-6 py-3 text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: "#000", color: "#fff", letterSpacing: "0.1em" }}>
          Volver a la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F5F5F5" }}>
      <header className="border-b shrink-0" style={{ backgroundColor: "#fff", borderColor: border }}>
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href={`/producto/${product.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-60" style={{ color: textSecondary, letterSpacing: "0.08em" }}>
            <ChevronLeft size={14} /> Volver
          </Link>
          <p className="text-sm font-black uppercase tracking-wider" style={{ letterSpacing: "0.08em" }}>Santa Diabla.</p>
          <span className="w-12" />
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-5">

          {/* Resumen del producto */}
          <section className="p-4 flex gap-4" style={{ backgroundColor: "#fff", border: `1px solid ${border}` }}>
            {product.image ? (
              <img src={product.image} alt={product.imageAlt} className="w-20 h-20 object-cover flex-shrink-0" style={{ backgroundColor: "#F5F5F5" }} />
            ) : (
              <div className="w-20 h-20 flex-shrink-0" style={{ backgroundColor: "#F5F5F5" }} />
            )}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <p className="text-sm font-bold leading-snug" style={{ color: textPrimary }}>{product.name}</p>
              <p className="text-sm font-black" style={{ color: textPrimary }}>{formatPrice(unitPrice)} <span className="text-xs font-semibold" style={{ color: textMuted }}>c/u</span></p>

              {hasColors && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {product.colors!.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="px-2.5 py-1 text-xs font-semibold border transition-all"
                      style={{
                        borderColor: selectedColor === color ? "#000" : variantError ? "#E63946" : "#E0E0E0",
                        backgroundColor: selectedColor === color ? "#000" : "transparent",
                        color: selectedColor === color ? "#fff" : "#000",
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              )}
              {hasSizes && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {product.sizes!.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className="px-2.5 py-1 text-xs font-semibold border transition-all"
                      style={{
                        borderColor: selectedSize === size ? "#000" : variantError ? "#E63946" : "#E0E0E0",
                        backgroundColor: selectedSize === size ? "#000" : "transparent",
                        color: selectedSize === size ? "#fff" : "#000",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
              {variantError && <p className="text-xs font-semibold" style={{ color: "#E63946" }}>Selecciona talle/color antes de continuar</p>}

              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center overflow-hidden border" style={{ borderColor: border }}>
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} className="px-2 py-1 disabled:opacity-30 hover:bg-gray-50" aria-label="Reducir">
                    <Minus size={12} />
                  </button>
                  <span className="px-3 py-1 text-xs font-bold border-x" style={{ borderColor: border }}>{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="px-2 py-1 hover:bg-gray-50" aria-label="Aumentar">
                    <Plus size={12} />
                  </button>
                </div>
                <span className="text-sm font-black ml-auto" style={{ color: textPrimary }}>{formatPrice(lineTotal)}</span>
              </div>
            </div>
          </section>

          {/* Datos personales */}
          <section className="p-4 flex flex-col gap-3" style={{ backgroundColor: "#fff", border: `1px solid ${border}` }}>
            <div className="flex items-center gap-2">
              <User size={13} />
              <p className="text-xs font-bold uppercase tracking-wider" style={{ letterSpacing: "0.1em" }}>Datos personales</p>
            </div>
            <FormField label="Nombre completo *" value={form.nombre} onChange={(v) => setField("nombre", v)} placeholder="Nombre y apellido" error={errors.nombre} />
            <FormField label="Telefono / WhatsApp *" value={form.telefono} onChange={(v) => setField("telefono", v)} placeholder="345 412-3456" type="tel" error={errors.telefono} />
            <FormField label="Email (opcional)" value={form.email} onChange={(v) => setField("email", v)} placeholder="tu@email.com" type="email" />
          </section>

          {/* Entrega */}
          <section className="p-4 flex flex-col gap-3" style={{ backgroundColor: "#fff", border: `1px solid ${border}` }}>
            <div className="flex items-center gap-2">
              <Package size={13} />
              <p className="text-xs font-bold uppercase tracking-wider" style={{ letterSpacing: "0.1em" }}>Tipo de entrega</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["envio", "retiro"] as ShippingType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setField("shippingType", type)}
                  className="flex flex-col items-center gap-1.5 p-3 border-2 text-xs font-bold uppercase tracking-wider transition-all"
                  style={{
                    borderColor: form.shippingType === type ? "#000" : "#E0E0E0",
                    backgroundColor: form.shippingType === type ? "#000" : "#fff",
                    color: form.shippingType === type ? "#fff" : "#5C5C5C",
                    letterSpacing: "0.06em",
                  }}
                >
                  {type === "envio" ? <Truck size={16} /> : <Store size={16} />}
                  {type === "envio" ? "Envio a domicilio" : "Retiro"}
                </button>
              ))}
            </div>
            {form.shippingType === "envio" && (
              <div className="flex flex-col gap-2.5 p-3 border" style={{ borderColor: border, backgroundColor: "#fff" }}>
                <FormField label="Direccion *" value={form.direccion} onChange={(v) => setField("direccion", v)} placeholder="Calle y numero" error={errors.direccion} />
                <div className="grid grid-cols-2 gap-2">
                  <FormField label="Localidad *" value={form.localidad} onChange={(v) => setField("localidad", v)} placeholder="Ciudad" error={errors.localidad} />
                  <FormField label="CP" value={form.codigoPostal} onChange={(v) => setField("codigoPostal", v)} placeholder="3200" />
                </div>
                <FormField label="Provincia *" value={form.provincia} onChange={(v) => setField("provincia", v)} placeholder="Entre Rios" error={errors.provincia} />
              </div>
            )}
            {form.shippingType === "retiro" && (
              <div className="p-3 text-xs leading-relaxed border" style={{ borderColor: border, backgroundColor: "#fff", color: textSecondary }}>
                Coordinaremos el punto de retiro por WhatsApp.
              </div>
            )}
          </section>

          {/* Pago */}
          <section className="p-4 flex flex-col gap-3" style={{ backgroundColor: "#fff", border: `1px solid ${border}` }}>
            <div className="flex items-center gap-2">
              <CreditCard size={13} />
              <p className="text-xs font-bold uppercase tracking-wider" style={{ letterSpacing: "0.1em" }}>Forma de pago</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PAYMENT_LABELS) as PaymentType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setField("paymentType", type)}
                  className="flex items-center gap-2 px-3 py-2.5 border-2 text-xs font-semibold text-left transition-all"
                  style={{
                    borderColor: form.paymentType === type ? "#000" : "#E0E0E0",
                    backgroundColor: form.paymentType === type ? "#000" : "#fff",
                    color: form.paymentType === type ? "#fff" : "#5C5C5C",
                  }}
                >
                  {type === "mercadopago" ? <Wallet size={15} /> : <Banknote size={15} />}
                  {PAYMENT_LABELS[type]}
                </button>
              ))}
            </div>

            <label className="text-xs font-semibold mt-1" style={{ color: textSecondary }}>Nota adicional (opcional)</label>
            <textarea
              value={form.nota}
              onChange={(e) => setField("nota", e.target.value)}
              placeholder="Aclaracion sobre el pedido, horario preferido..."
              rows={3}
              className="w-full border px-3 py-2 text-xs resize-none outline-none"
              style={{ borderColor: border, backgroundColor: "#fff", color: textPrimary }}
            />

            {mpError && <p className="text-xs text-center font-semibold" style={{ color: "#E63946" }}>{mpError}</p>}
          </section>
        </div>
      </main>

      {/* Footer / accion final */}
      <div className="px-4 py-4 border-t flex flex-col gap-3 shrink-0" style={{ borderColor: border, backgroundColor: "#fff" }}>
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: textMuted, letterSpacing: "0.1em" }}>Total a pagar</span>
            <span className="text-xl font-black" style={{ color: textPrimary }}>{formatPrice(lineTotal)}</span>
          </div>
          {form.paymentType === "mercadopago" ? (
            <button
              onClick={handleMercadoPagoPay}
              disabled={mpLoading}
              className="flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-60"
              style={{ backgroundColor: "#009EE3", color: "#fff", letterSpacing: "0.08em" }}
            >
              {mpLoading ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
              {mpLoading ? "Redirigiendo..." : "Pagar con Mercado Pago"}
            </button>
          ) : (
            <button
              onClick={handleWhatsAppPay}
              className="flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#25D366", color: "#fff", letterSpacing: "0.08em" }}
            >
              <MessageCircle size={16} /> Enviar pedido por WhatsApp
            </button>
          )}
          <p className="flex items-center justify-center gap-1.5 text-xs" style={{ color: textMuted }}>
            <Hash size={11} /> Pedido {orderId}
          </p>
        </div>
      </div>
    </div>
  )
}

function FormField({
  label, value, onChange, placeholder, type = "text", error,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; error?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold" style={{ color: "#5C5C5C" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border px-3 py-2 text-xs outline-none transition-all focus:border-black"
        style={{ borderColor: error ? "#E63946" : "#E0E0E0", backgroundColor: "#fff", color: "#000" }}
      />
      {error && <p className="text-xs font-semibold" style={{ color: "#E63946" }}>{error}</p>}
    </div>
  )
}
