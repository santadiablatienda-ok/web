import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductById } from "@/lib/products-store"
import { finalPrice, formatPrice } from "@/lib/products"
import { getSiteUrl } from "@/lib/mercadopago"
import { ProductPage } from "@/components/product-page"

interface RouteProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id).catch(() => null)
  if (!product) return { title: "Producto no encontrado — Santa Diabla" }

  const price = finalPrice(product)
  const description = product.description
    ? `${product.description}${price > 0 ? ` · ${formatPrice(price)}` : ""}`
    : `${product.name} en Santa Diabla`
  const siteUrl = getSiteUrl()

  return {
    title: `${product.name} — Santa Diabla`,
    description,
    openGraph: {
      title: product.name,
      description,
      url: `${siteUrl}/producto/${product.id}`,
      siteName: "Santa Diabla",
      images: product.image ? [{ url: product.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.image ? [product.image] : undefined,
    },
  }
}

export default async function ProductRoute({ params }: RouteProps) {
  const { id } = await params
  const product = await getProductById(id).catch(() => null)
  if (!product) notFound()

  return <ProductPage product={product} />
}
