import { notFound } from "next/navigation"
import { getProductBySlugOrId } from "@/lib/products-store"
import { PaymentScreen } from "@/components/payment-screen"

interface RouteProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ talle?: string; color?: string }>
}

export const metadata = {
  title: "Pagar — Santa Diabla",
}

export default async function PagarRoute({ params, searchParams }: RouteProps) {
  const { id } = await params
  const sp = await searchParams
  const product = await getProductBySlugOrId(id).catch(() => null)
  if (!product) notFound()

  return <PaymentScreen product={product} initialSize={sp.talle} initialColor={sp.color} />
}
