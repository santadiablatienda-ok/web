const ORDERS_KEY = "santa-diabla-orders"

export interface Order {
  id: string
  createdAt: string
  nombre: string
  telefono: string
  email?: string
  items: { name: string; size?: string; quantity: number; price: number; category?: string; isBackorder?: boolean }[]
  total: number
  depositDue: number
  shippingType: "envio" | "retiro"
  direccion?: string
  localidad?: string
  provincia?: string
  paymentType: string
  nota?: string
  status: "pendiente" | "confirmado" | "enviado" | "entregado" | "cancelado"
}

export function getOrders(): Order[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveOrder(order: Order): void {
  if (typeof window === "undefined") return
  const orders = getOrders()
  orders.unshift(order)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

export function updateOrderStatus(id: string, status: Order["status"]): void {
  if (typeof window === "undefined") return
  const orders = getOrders().map((o) => o.id === id ? { ...o, status } : o)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

export function deleteOrder(id: string): void {
  if (typeof window === "undefined") return
  const orders = getOrders().filter((o) => o.id !== id)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}
