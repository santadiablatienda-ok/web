import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { finalPrice, type Product } from "@/lib/products"
import { getPreferenceClient, getSiteUrl } from "@/lib/mercadopago"

interface CartLine {
  productId: string
  quantity: number
  selectedSize?: string
  selectedColor?: string
  isBackorder?: boolean
}

interface RequestBody {
  orderId: string
  items: CartLine[]
  nombre: string
  telefono: string
  email?: string
  shippingType: "envio" | "retiro"
  direccion?: string
  localidad?: string
  provincia?: string
  nota?: string
}

export async function POST(req: Request) {
  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body invalido" }, { status: 400 })
  }

  const { orderId, items, nombre, telefono, email, shippingType, direccion, localidad, provincia, nota } = body

  if (!orderId || !Array.isArray(items) || items.length === 0 || !nombre?.trim() || !telefono?.trim()) {
    return NextResponse.json({ error: "Faltan datos del pedido" }, { status: 400 })
  }
  if (items.some((i) => i.isBackorder)) {
    return NextResponse.json({ error: "Los items por encargo no se pueden pagar online, usa la opcion por WhatsApp" }, { status: 400 })
  }

  const productIds = [...new Set(items.map((i) => i.productId))]
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, discount_percent, active")
    .in("id", productIds)

  if (productsError) {
    return NextResponse.json({ error: "No se pudieron validar los productos" }, { status: 500 })
  }

  const productMap = new Map((products as { id: string; name: string; price: number; discount_percent: number | null; active: boolean | null }[]).map((p) => [p.id, p]))

  const orderItems: { name: string; size?: string; color?: string; quantity: number; price: number; category?: string }[] = []
  const mpItems: { id: string; title: string; quantity: number; unit_price: number; currency_id: string }[] = []
  let total = 0

  for (const line of items) {
    const product = productMap.get(line.productId)
    if (!product || product.active === false) {
      return NextResponse.json({ error: `Producto no disponible: ${line.productId}` }, { status: 400 })
    }
    const unitPrice = finalPrice({ price: Number(product.price), discountPercent: product.discount_percent ?? undefined } as Pick<Product, "price" | "discountPercent">)
    const qty = Math.max(1, Math.floor(line.quantity))
    total += unitPrice * qty

    orderItems.push({
      name: product.name,
      size: line.selectedSize,
      color: line.selectedColor,
      quantity: qty,
      price: unitPrice,
    })

    const variant = [line.selectedSize ? `Talle ${line.selectedSize}` : null, line.selectedColor].filter(Boolean).join(" - ")
    mpItems.push({
      id: line.productId,
      title: variant ? `${product.name} (${variant})` : product.name,
      quantity: qty,
      unit_price: unitPrice,
      currency_id: "ARS",
    })
  }

  const orderRow = {
    id: orderId,
    created_at: new Date().toISOString(),
    nombre,
    telefono,
    email: email || null,
    items: orderItems,
    total,
    deposit_due: total,
    shipping_type: shippingType,
    direccion: shippingType === "envio" ? direccion || null : null,
    localidad: shippingType === "envio" ? localidad || null : null,
    provincia: shippingType === "envio" ? provincia || null : null,
    payment_type: "Mercado Pago (pago online)",
    nota: nota || null,
    status: "pendiente",
    payment_status: "pendiente",
  }

  const { error: insertError } = await supabase.from("orders").insert(orderRow)
  if (insertError) {
    return NextResponse.json({ error: "No se pudo registrar el pedido" }, { status: 500 })
  }

  const siteUrl = getSiteUrl()

  try {
    const preference = await getPreferenceClient().create({
      body: {
        items: mpItems,
        payer: {
          name: nombre,
          email: email || undefined,
          phone: telefono ? { number: telefono } : undefined,
        },
        external_reference: orderId,
        back_urls: {
          success: `${siteUrl}/checkout/success?order=${encodeURIComponent(orderId)}`,
          failure: `${siteUrl}/checkout/failure?order=${encodeURIComponent(orderId)}`,
          pending: `${siteUrl}/checkout/pending?order=${encodeURIComponent(orderId)}`,
        },
        auto_return: "approved",
        notification_url: `${siteUrl}/api/mercadopago/webhook`,
        statement_descriptor: "SANTA DIABLA",
      },
    })

    if (preference.id) {
      await supabase.from("orders").update({ mp_preference_id: preference.id }).eq("id", orderId)
    }

    return NextResponse.json({ initPoint: preference.init_point })
  } catch (e) {
    console.error("Error creando preferencia de Mercado Pago:", e)
    return NextResponse.json({ error: "No se pudo iniciar el pago con Mercado Pago" }, { status: 502 })
  }
}
