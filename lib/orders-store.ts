import { supabase } from "@/lib/supabase"

export type PaymentStatus = "no_aplica" | "pendiente" | "aprobado" | "rechazado" | "en_proceso"

export interface Order {
  id: string
  createdAt: string
  nombre: string
  telefono: string
  email?: string
  items: { name: string; size?: string; color?: string; quantity: number; price: number; category?: string; isBackorder?: boolean }[]
  total: number
  depositDue: number
  shippingType: "envio" | "retiro"
  direccion?: string
  localidad?: string
  provincia?: string
  codigoPostal?: string
  shippingCost?: number
  paymentType: string
  nota?: string
  status: "pendiente" | "confirmado" | "enviado" | "entregado" | "cancelado"
  paymentStatus?: PaymentStatus
  mpPreferenceId?: string
  mpPaymentId?: string
  andreaniNumeroEnvio?: string
  andreaniEstado?: string
  andreaniEstadoFecha?: string
}

interface OrderRow {
  id: string
  created_at: string
  nombre: string
  telefono: string
  email: string | null
  items: Order["items"]
  total: number
  deposit_due: number
  shipping_type: Order["shippingType"]
  direccion: string | null
  localidad: string | null
  provincia: string | null
  codigo_postal: string | null
  shipping_cost: number | null
  payment_type: string | null
  nota: string | null
  status: Order["status"]
  payment_status: PaymentStatus | null
  mp_preference_id: string | null
  mp_payment_id: string | null
  andreani_numero_envio: string | null
  andreani_estado: string | null
  andreani_estado_fecha: string | null
}

function rowToOrder(r: OrderRow): Order {
  return {
    id: r.id,
    createdAt: r.created_at,
    nombre: r.nombre,
    telefono: r.telefono,
    email: r.email ?? undefined,
    items: r.items,
    total: r.total,
    depositDue: r.deposit_due,
    shippingType: r.shipping_type,
    direccion: r.direccion ?? undefined,
    localidad: r.localidad ?? undefined,
    provincia: r.provincia ?? undefined,
    codigoPostal: r.codigo_postal ?? undefined,
    shippingCost: r.shipping_cost ?? undefined,
    paymentType: r.payment_type ?? "",
    nota: r.nota ?? undefined,
    status: r.status,
    paymentStatus: r.payment_status ?? undefined,
    mpPreferenceId: r.mp_preference_id ?? undefined,
    mpPaymentId: r.mp_payment_id ?? undefined,
    andreaniNumeroEnvio: r.andreani_numero_envio ?? undefined,
    andreaniEstado: r.andreani_estado ?? undefined,
    andreaniEstadoFecha: r.andreani_estado_fecha ?? undefined,
  }
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return (data as OrderRow[]).map(rowToOrder)
}

export async function saveOrder(order: Order): Promise<void> {
  const row = {
    id: order.id,
    created_at: order.createdAt,
    nombre: order.nombre,
    telefono: order.telefono,
    email: order.email ?? null,
    items: order.items,
    total: order.total,
    deposit_due: order.depositDue,
    shipping_type: order.shippingType,
    direccion: order.direccion ?? null,
    localidad: order.localidad ?? null,
    provincia: order.provincia ?? null,
    codigo_postal: order.codigoPostal ?? null,
    shipping_cost: order.shippingCost ?? 0,
    payment_type: order.paymentType,
    nota: order.nota ?? null,
    status: order.status,
    payment_status: order.paymentStatus ?? "no_aplica",
    mp_preference_id: order.mpPreferenceId ?? null,
    mp_payment_id: order.mpPaymentId ?? null,
  }
  const { error } = await supabase.from("orders").insert(row)
  if (error) throw error
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id)
  if (error) throw error
}

export async function updateOrderAndreani(id: string, numeroEnvio: string): Promise<void> {
  const { error } = await supabase.from("orders").update({
    andreani_numero_envio: numeroEnvio || null,
    andreani_estado: numeroEnvio ? "generado" : null,
    andreani_estado_fecha: numeroEnvio ? new Date().toISOString() : null,
  }).eq("id", id)
  if (error) throw error
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from("orders").delete().eq("id", id)
  if (error) throw error
}
