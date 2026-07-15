import { createClient } from "@supabase/supabase-js"

// Fallback para no romper el build/SSR si faltan las env vars (ej: no cargadas en Vercel).
// Con el fallback, cualquier llamada real a Supabase Storage falla en runtime con un error claro
// en vez de tumbar la generación de páginas enteras en el build.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

export const supabase = createClient(supabaseUrl, supabaseKey)

export const PRODUCT_IMAGES_BUCKET = "product-images"

function isHeic(file: File): boolean {
  const name = file.name.toLowerCase()
  return file.type === "image/heic" || file.type === "image/heif" || name.endsWith(".heic") || name.endsWith(".heif")
}

async function toUploadableImage(file: File): Promise<{ blob: Blob | File; ext: string }> {
  if (!isHeic(file)) return { blob: file, ext: file.name.split(".").pop() || "jpg" }
  const heic2any = (await import("heic2any")).default
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 })
  const blob = Array.isArray(converted) ? converted[0] : converted
  return { blob, ext: "jpg" }
}

export async function uploadProductImage(file: File): Promise<string> {
  const { blob, ext } = await toUploadableImage(file)
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, blob, {
    cacheControl: "3600",
    upsert: false,
    contentType: ext === "jpg" ? "image/jpeg" : file.type || undefined,
  })
  if (error) throw error
  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
