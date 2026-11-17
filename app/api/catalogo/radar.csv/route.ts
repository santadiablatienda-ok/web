import { getCategories, getProducts } from "@/lib/products-store"
import { categories as categoriasBase } from "@/lib/products"
import { csvRadar } from "@/lib/catalogo-radar"

// Catalogo para RADAR: https://www.santadiablatienda.com/api/catalogo/radar.csv
// RADAR lo lee una vez por dia (y cuando el comercio toca "Sincronizar ahora"). Se cachea 5 minutos
// en la CDN para que muchas lecturas seguidas no le peguen a Supabase.
export const revalidate = 300

export async function GET() {
  try {
    const [productos, categorias] = await Promise.all([getProducts(), getCategories().catch(() => categoriasBase)])
    return new Response(csvRadar(productos, categorias.length > 0 ? categorias : categoriasBase), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'inline; filename="radar.csv"',
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch {
    // Un error no puede devolver un CSV vacio: RADAR lo tomaria como "no hay productos".
    return new Response("No se pudo armar el catálogo", { status: 503 })
  }
}
