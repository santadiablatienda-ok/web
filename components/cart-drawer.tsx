"use client"

import { useState } from "react"
import {
  X, Trash2, Plus, Minus, ShoppingBag, MessageCircle,
  ArrowRight, ArrowLeft, User, Package, CheckCircle2,
  Truck, Store, CreditCard, Banknote, Wallet, Hash
} from "lucide-react"
import { type CartItem, DEPOSIT_PERCENT } from "@/hooks/use-cart"
import { formatPrice, finalPrice } from "@/lib/products"
import { saveOrder, type Order } from "@/lib/orders-store"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  items: CartItem[]
  totalPrice: number
  depositTotal: number
  onUpdateQuantity: (id: string, qty: number, size?: string, isBackorder?: boolean, color?: string) => void
  onRemove: (id: string, size?: string, isBackorder?: boolean, color?: string) => void
  onClear: () => void
}

type Step = "cart" | "form" | "confirm" | "sent"
type ShippingType = "envio" | "retiro"
type PaymentType = "transferencia" | "billetera"

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
  transferencia: "Transferencia bancaria",
  billetera: "Mercado Pago / billetera virtual",
}

const PAYMENT_ICONS: Record<PaymentType, React.ReactNode> = {
  transferencia: <Banknote size={15} />,
  billetera: <Wallet size={15} />,
}

const defaultForm: OrderForm = {
  nombre: "", telefono: "", email: "",
  shippingType: "envio",
  direccion: "", localidad: "", provincia: "", codigoPostal: "",
  paymentType: "transferencia",
  nota: "",
}

function generateOrderId() {
  const now = new Date()
  const date = `${String(now.getDate()).padStart(2, "0")}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getFullYear()).slice(2)}`
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `SD-${date}-${rand}`
}

const accent = "#000"
const accentLight = "#F5F5F5"
const border = "#E0E0E0"
const textPrimary = "#000"
const textSecondary = "#5C5C5C"
const textMuted = "#9E9E9E"

export function CartDrawer({
  open, onClose, items, totalPrice, depositTotal, onUpdateQuantity, onRemove, onClear,
}: CartDrawerProps) {
  const [step, setStep] = useState<Step>("cart")
  const [form, setForm] = useState<OrderForm>(defaultForm)
  const [orderId, setOrderId] = useState(generateOrderId)
  const [errors, setErrors] = useState<Partial<Record<keyof OrderForm, string>>>({})

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  function handleClose() {
    onClose()
    setTimeout(() => {
      setStep("cart")
      setForm(defaultForm)
      setErrors({})
      setOrderId(generateOrderId())
    }, 300)
  }

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
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function buildWhatsAppMessage(): string {
    const productLines = items
      .map((i) => {
        const size = i.selectedSize ? ` (Talle: ${i.selectedSize})` : ""
        const color = i.selectedColor ? ` (Color: ${i.selectedColor})` : ""
        const tag = i.isBackorder ? ` [POR ENCARGO - seña ${DEPOSIT_PERCENT}%]` : ""
        return `  - ${i.product.name}${size}${color}${tag} x${i.quantity}  ${formatPrice(finalPrice(i.product) * i.quantity)}`
      })
      .join("\n")

    const shipping =
      form.shippingType === "envio"
        ? `Envio a domicilio\n  ${form.direccion}, ${form.localidad}, ${form.provincia}${form.codigoPostal ? ` CP ${form.codigoPostal}` : ""}`
        : "Retiro coordinado por WhatsApp"

    const hasBackorder = items.some((i) => i.isBackorder)

    const lines = [
      `Nuevo pedido #${orderId}`,
      ``,
      `Cliente`,
      `  Nombre: ${form.nombre}`,
      `  Telefono: ${form.telefono}`,
      form.email ? `  Email: ${form.email}` : null,
      ``,
      `Productos`,
      productLines,
      ``,
      `Total del pedido: ${formatPrice(totalPrice)}`,
      hasBackorder ? `A abonar ahora (incluye seña ${DEPOSIT_PERCENT}% en items por encargo): ${formatPrice(depositTotal)}` : null,
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

  function handleSendOrder() {
    const order: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      nombre: form.nombre,
      telefono: form.telefono,
      email: form.email || undefined,
      items: items.map((i) => ({
        name: i.product.name,
        size: i.selectedSize,
        color: i.selectedColor,
        quantity: i.quantity,
        price: finalPrice(i.product),
        category: i.product.category,
        isBackorder: i.isBackorder || undefined,
      })),
      total: totalPrice,
      depositDue: depositTotal,
      shippingType: form.shippingType,
      direccion: form.shippingType === "envio" ? form.direccion : undefined,
      localidad: form.shippingType === "envio" ? form.localidad : undefined,
      provincia: form.shippingType === "envio" ? form.provincia : undefined,
      paymentType: PAYMENT_LABELS[form.paymentType],
      nota: form.nota || undefined,
      status: "pendiente",
    }
    saveOrder(order)
    onClear()
    setStep("sent")
  }

  const whatsappUrl = `https://wa.me/5493456623935?text=${encodeURIComponent(buildWhatsAppMessage())}`

  const steps: { id: Step; label: string }[] = [
    { id: "cart", label: "Carrito" },
    { id: "form", label: "Tus datos" },
    { id: "confirm", label: "Confirmar" },
  ]
  const stepIndex = steps.findIndex((s) => s.id === step)

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm flex flex-col shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ backgroundColor: "#fff" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: border }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} style={{ color: textPrimary }} />
            <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: textPrimary, letterSpacing: "0.08em" }}>
              {step === "cart" && "Mi carrito"}
              {step === "form" && "Datos del pedido"}
              {step === "confirm" && "Confirmar pedido"}
            </h2>
            {step === "cart" && items.length > 0 && (
              <span
                className="rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "#000", color: "#fff" }}
              >
                {totalItems}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step === "cart" && items.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs font-semibold transition-opacity hover:opacity-50"
                style={{ color: textMuted }}
              >
                Vaciar
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 transition-opacity hover:opacity-50"
              style={{ color: textPrimary }}
              aria-label="Cerrar carrito"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Step indicator */}
        {items.length > 0 && step !== "sent" && (
          <div className="flex items-center px-5 py-3 gap-0 shrink-0 border-b" style={{ borderColor: border }}>
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-6 h-6 flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      backgroundColor: idx <= stepIndex ? "#000" : "#E0E0E0",
                      color: idx <= stepIndex ? "#fff" : "#9E9E9E",
                    }}
                  >
                    {idx < stepIndex ? <CheckCircle2 size={13} /> : idx + 1}
                  </div>
                  <span className="text-xs font-medium" style={{ color: idx <= stepIndex ? "#000" : textMuted }}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className="h-0.5 flex-1 mb-4 mx-1 rounded transition-all"
                    style={{ backgroundColor: idx < stepIndex ? "#000" : "#E0E0E0" }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#F5F5F5" }}>

          {/* STEP 1: CARRITO */}
          {step === "cart" && (
            <div className="px-4 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                  <ShoppingBag size={36} style={{ color: "#E0E0E0" }} />
                  <p className="font-bold text-sm" style={{ color: textPrimary }}>Tu carrito esta vacio</p>
                  <p className="text-xs" style={{ color: textMuted }}>Agrega productos desde el catalogo</p>
                  <button
                    onClick={handleClose}
                    className="mt-2 px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
                    style={{ backgroundColor: "#000", color: "#fff", letterSpacing: "0.1em" }}
                  >
                    Ver productos
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {items.map(({ product, quantity, selectedSize, selectedColor, isBackorder }) => (
                    <li
                      key={`${product.id}-${selectedSize || ""}-${selectedColor || ""}-${isBackorder ? "encargo" : "stock"}`}
                      className="flex gap-3 p-3"
                      style={{ backgroundColor: "#fff", border: "1px solid #E0E0E0" }}
                    >
                      <img
                        src={product.image}
                        alt={product.imageAlt}
                        className="w-16 h-16 object-cover flex-shrink-0"
                        style={{ backgroundColor: "#F5F5F5" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold leading-snug" style={{ color: textPrimary }}>
                          {product.name}
                        </p>
                        {(selectedSize || selectedColor) && (
                          <p className="text-xs font-semibold mt-0.5" style={{ color: textMuted }}>
                            {selectedSize ? `Talle: ${selectedSize}` : ""}
                            {selectedSize && selectedColor ? " · " : ""}
                            {selectedColor ? `Color: ${selectedColor}` : ""}
                          </p>
                        )}
                        <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                          {formatPrice(finalPrice(product))} c/u
                        </p>
                        {isBackorder && (
                          <p className="text-xs font-bold mt-0.5" style={{ color: "#E63946" }}>
                            Por encargo · seña {DEPOSIT_PERCENT}% ({formatPrice(Math.round(finalPrice(product) * quantity * DEPOSIT_PERCENT / 100))})
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div
                            className="flex items-center overflow-hidden border"
                            style={{ borderColor: "#E0E0E0" }}
                          >
                            <button
                              onClick={() => onUpdateQuantity(product.id, quantity - 1, selectedSize, isBackorder, selectedColor)}
                              disabled={quantity <= 1}
                              className="px-2 py-1 transition-opacity disabled:opacity-30 hover:bg-gray-50"
                              style={{ color: textPrimary }}
                              aria-label="Reducir"
                            >
                              <Minus size={12} />
                            </button>
                            <span
                              className="px-3 py-1 text-xs font-bold border-x"
                              style={{ borderColor: "#E0E0E0", color: textPrimary }}
                            >
                              {quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(product.id, quantity + 1, selectedSize, isBackorder, selectedColor)}
                              className="px-2 py-1 transition-opacity hover:bg-gray-50"
                              style={{ color: textPrimary }}
                              aria-label="Aumentar"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black" style={{ color: textPrimary }}>
                              {formatPrice(finalPrice(product) * quantity)}
                            </span>
                            <button
                              onClick={() => onRemove(product.id, selectedSize, isBackorder, selectedColor)}
                              className="p-1 transition-opacity hover:opacity-50"
                              style={{ color: "#E63946" }}
                              aria-label={`Eliminar ${product.name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* STEP 2: FORMULARIO */}
          {step === "form" && (
            <div className="px-4 py-4 flex flex-col gap-5">
              <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <User size={13} style={{ color: textPrimary }} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: textPrimary, letterSpacing: "0.1em" }}>
                    Datos personales
                  </p>
                </div>
                <FormField label="Nombre completo *" value={form.nombre} onChange={(v) => setField("nombre", v)} placeholder="Nombre y apellido" error={errors.nombre} />
                <FormField label="Telefono / WhatsApp *" value={form.telefono} onChange={(v) => setField("telefono", v)} placeholder="345 412-3456" type="tel" error={errors.telefono} />
                <FormField label="Email (opcional)" value={form.email} onChange={(v) => setField("email", v)} placeholder="tu@email.com" type="email" />
              </section>

              <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Package size={13} style={{ color: textPrimary }} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: textPrimary, letterSpacing: "0.1em" }}>
                    Tipo de entrega
                  </p>
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
                  <div className="flex flex-col gap-2.5 p-3 border" style={{ borderColor: "#E0E0E0", backgroundColor: "#fff" }}>
                    <FormField label="Direccion *" value={form.direccion} onChange={(v) => setField("direccion", v)} placeholder="Calle y numero" error={errors.direccion} />
                    <div className="grid grid-cols-2 gap-2">
                      <FormField label="Localidad *" value={form.localidad} onChange={(v) => setField("localidad", v)} placeholder="Ciudad" error={errors.localidad} />
                      <FormField label="CP" value={form.codigoPostal} onChange={(v) => setField("codigoPostal", v)} placeholder="3200" />
                    </div>
                    <FormField label="Provincia *" value={form.provincia} onChange={(v) => setField("provincia", v)} placeholder="Entre Rios" error={errors.provincia} />
                  </div>
                )}

                {form.shippingType === "retiro" && (
                  <div className="p-3 text-xs leading-relaxed border" style={{ borderColor: "#E0E0E0", backgroundColor: "#fff", color: textSecondary }}>
                    Coordinaremos el punto de retiro por WhatsApp.
                  </div>
                )}

              </section>

              <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <CreditCard size={13} style={{ color: textPrimary }} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: textPrimary, letterSpacing: "0.1em" }}>
                    Forma de pago
                  </p>
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
                      {PAYMENT_ICONS[type]}
                      {PAYMENT_LABELS[type]}
                    </button>
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-2">
                <label className="text-xs font-semibold" style={{ color: textSecondary }}>
                  Nota adicional (opcional)
                </label>
                <textarea
                  value={form.nota}
                  onChange={(e) => setField("nota", e.target.value)}
                  placeholder="Aclaracion sobre el pedido, horario preferido..."
                  rows={3}
                  className="w-full border px-3 py-2 text-xs resize-none outline-none"
                  style={{ borderColor: "#E0E0E0", backgroundColor: "#fff", color: textPrimary }}
                />
              </section>
            </div>
          )}

          {/* STEP 3: CONFIRMAR */}
          {step === "confirm" && (
            <div className="px-4 py-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 p-3 border" style={{ backgroundColor: "#fff", borderColor: "#E0E0E0" }}>
                <Hash size={13} style={{ color: textMuted }} />
                <div>
                  <p className="text-xs" style={{ color: textMuted }}>Numero de pedido</p>
                  <p className="text-sm font-black tracking-wider" style={{ color: textPrimary }}>{orderId}</p>
                </div>
              </div>

              <SummaryBlock title="Productos">
                {items.map((i) => (
                  <div key={`${i.product.id}-${i.selectedSize || ""}-${i.selectedColor || ""}-${i.isBackorder ? "encargo" : "stock"}`} className="flex justify-between text-xs">
                    <span style={{ color: textSecondary }}>
                      {i.product.name}{i.selectedSize ? ` (T. ${i.selectedSize})` : ""}{i.selectedColor ? ` (${i.selectedColor})` : ""} x{i.quantity}
                      {i.isBackorder && <span style={{ color: "#E63946", fontWeight: 700 }}> · Por encargo</span>}
                    </span>
                    <span className="font-semibold" style={{ color: textPrimary }}>
                      {formatPrice(finalPrice(i.product) * i.quantity)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-black pt-2 border-t mt-1" style={{ borderColor: "#E0E0E0" }}>
                  <span style={{ color: textPrimary }}>Total del pedido</span>
                  <span style={{ color: textPrimary }}>{formatPrice(totalPrice)}</span>
                </div>
                {depositTotal !== totalPrice && (
                  <div className="flex justify-between text-sm font-black" style={{ color: "#E63946" }}>
                    <span>A abonar ahora (seña {DEPOSIT_PERCENT}%)</span>
                    <span>{formatPrice(depositTotal)}</span>
                  </div>
                )}
              </SummaryBlock>

              <SummaryBlock title="Cliente">
                <SummaryRow label="Nombre" value={form.nombre} />
                <SummaryRow label="Telefono" value={form.telefono} />
                {form.email && <SummaryRow label="Email" value={form.email} />}
              </SummaryBlock>

              <SummaryBlock title="Entrega">
                <SummaryRow label="Tipo" value={form.shippingType === "envio" ? "Envio a domicilio" : "Retiro coordinado"} />
                {form.shippingType === "envio" && (
                  <>
                    <SummaryRow label="Direccion" value={form.direccion} />
                    <SummaryRow label="Localidad" value={`${form.localidad}${form.codigoPostal ? ` (CP ${form.codigoPostal})` : ""}`} />
                    <SummaryRow label="Provincia" value={form.provincia} />
                  </>
                )}
              </SummaryBlock>

              <SummaryBlock title="Forma de pago">
                <SummaryRow label="Metodo" value={PAYMENT_LABELS[form.paymentType]} />
              </SummaryBlock>

              {form.nota && (
                <SummaryBlock title="Nota">
                  <p className="text-xs" style={{ color: textSecondary }}>{form.nota}</p>
                </SummaryBlock>
              )}

              <p className="text-xs text-center leading-relaxed px-2" style={{ color: textMuted }}>
                Al tocar Enviar pedido se abre WhatsApp con todos los datos listos. Confirmaremos disponibilidad y coordinaremos el pago y envio.
              </p>
            </div>
          )}

          {/* STEP 4: ENVIADO */}
          {step === "sent" && (
            <div className="flex flex-col items-center justify-center h-full px-6 py-10 gap-6 text-center">
              <div className="w-16 h-16 flex items-center justify-center" style={{ backgroundColor: "#000" }}>
                <CheckCircle2 size={32} style={{ color: "#fff" }} />
              </div>
              <div>
                <p className="text-lg font-black uppercase mb-2" style={{ color: textPrimary }}>Pedido enviado</p>
                <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                  Tu pedido <strong>#{orderId}</strong> fue enviado por WhatsApp. Te confirmaremos disponibilidad y coordinaremos la entrega.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <a
                  href="https://www.instagram.com/santadiablatienda/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest border transition-all hover:bg-black hover:text-white"
                  style={{ borderColor: "#000", color: "#000", letterSpacing: "0.1em" }}
                >
                  Seguir en Instagram
                </a>
                <button
                  onClick={handleClose}
                  className="py-3 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#000", color: "#fff", letterSpacing: "0.1em" }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Acciones */}
        {items.length > 0 && step !== "sent" && (
          <div
            className="px-4 py-4 border-t flex flex-col gap-3 shrink-0"
            style={{ borderColor: border, backgroundColor: "#fff" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: textMuted, letterSpacing: "0.1em" }}>
                {depositTotal !== totalPrice ? "A abonar ahora" : "Total"}
              </span>
              <span className="text-xl font-black" style={{ color: textPrimary }}>{formatPrice(depositTotal)}</span>
            </div>
            {depositTotal !== totalPrice && (
              <p className="text-xs -mt-2" style={{ color: textMuted }}>
                Incluye seña del {DEPOSIT_PERCENT}% en items por encargo. Total del pedido: {formatPrice(totalPrice)}
              </p>
            )}

            {step === "cart" && (
              <button
                onClick={() => setStep("form")}
                className="flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#000", color: "#fff", letterSpacing: "0.1em" }}
              >
                Continuar con el pedido
                <ArrowRight size={15} />
              </button>
            )}

            {step === "form" && (
              <div className="flex gap-2">
                <button
                  onClick={() => setStep("cart")}
                  className="flex items-center justify-center gap-1 py-3 px-4 text-xs font-bold border transition-opacity hover:opacity-60"
                  style={{ borderColor: "#E0E0E0", color: textSecondary }}
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  onClick={() => { if (validate()) setStep("confirm") }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#000", color: "#fff", letterSpacing: "0.1em" }}
                >
                  Revisar pedido
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {step === "confirm" && (
              <div className="flex gap-2">
                <button
                  onClick={() => setStep("form")}
                  className="flex items-center justify-center gap-1 py-3 px-4 text-xs font-bold border transition-opacity hover:opacity-60"
                  style={{ borderColor: "#E0E0E0", color: textSecondary }}
                >
                  <ArrowLeft size={14} />
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleSendOrder}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#25D366", color: "#fff", letterSpacing: "0.08em" }}
                >
                  <MessageCircle size={16} />
                  Enviar pedido
                </a>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
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
        style={{
          borderColor: error ? "#E63946" : "#E0E0E0",
          backgroundColor: "#fff",
          color: "#000",
        }}
      />
      {error && <p className="text-xs font-semibold" style={{ color: "#E63946" }}>{error}</p>}
    </div>
  )
}

function SummaryBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border p-3 flex flex-col gap-2" style={{ borderColor: "#E0E0E0", backgroundColor: "#fff" }}>
      <p className="text-xs font-black uppercase tracking-wider" style={{ color: "#000", letterSpacing: "0.1em" }}>{title}</p>
      {children}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 text-xs">
      <span style={{ color: "#9E9E9E" }}>{label}</span>
      <span className="font-semibold text-right" style={{ color: "#000" }}>{value}</span>
    </div>
  )
}
