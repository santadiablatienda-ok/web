// Script de un solo uso: sube los videos de producto ya existentes en CATALOGO/
// a Supabase Storage y genera un JSON {productId, name, url} para armar la
// seccion de videos en la web.
// Uso: node scripts/upload-product-videos.mjs

import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

const ROOT = path.resolve(import.meta.dirname, "..")
const CATALOGO = path.join(ROOT, "CATALOGO")
const OUT_FILE = path.join(ROOT, "scripts", "product-videos-result.json")

async function loadEnvLocal() {
  const text = await readFile(path.join(ROOT, ".env.local"), "utf-8")
  const env = {}
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

// videos razonables para web (los dos .MOV de ~80MB se excluyen, hay que comprimirlos primero)
const VIDEOS = [
  { file: "BOTAS/DRAKO/5edff8a8-c3ba-4b32-ac4a-923b3cc23af0.mp4", productId: "bot-011", name: "Botas Drako" },
  { file: "ZAPATILLAS/ADIDAS SAMBA/ZAPATILLAS  SAMBA  CHOCOLATE/SAMBA CHOCOLATE (2).MOV", productId: "zap-005", name: "Zapatilla Samba Chocolate" },
  { file: "ZAPATILLAS/ADIDAS SAMBA/ZAPATILLAS  SAMBA  NAT-BEIGE/WhatsApp Video 2026-07-07 at 2.06.59 PM.mp4", productId: "zap-009", name: "Zapatillas Samba Nat-Beige" },
  { file: "ZAPATILLAS/ADIDAS SAMBA/ZAPATILLAS  SAMBA  NAT-CHERRY/WhatsApp Video 2026-07-07 at 2.08.57 PM.mp4", productId: "zap-010", name: "Zapatillas Samba Nat-Cherry" },
  { file: "ZAPATILLAS/JORDAN/JORDAN RETRO/VIDEO✅.mp4", productId: "zap-013", name: "Jordan Retro" },
  { file: "ZAPATILLAS/NEW BALANCE/ZAPATILLAS  NEW  BALANCE NAT-PRINT/WhatsApp Video 2026-07-07 at 2.03.40 PM.mp4", productId: "zap-017", name: "Zapatillas New Balance Nat-Print" },
]

function contentTypeFor(file) {
  return file.toLowerCase().endsWith(".mov") ? "video/quicktime" : "video/mp4"
}

async function main() {
  const env = await loadEnvLocal()
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const bucket = "product-images"

  const results = []
  for (const v of VIDEOS) {
    const filePath = path.join(CATALOGO, v.file)
    try {
      const buffer = await readFile(filePath)
      const ext = v.file.toLowerCase().endsWith(".mov") ? "mov" : "mp4"
      const uploadPath = `videos/${v.productId}-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from(bucket).upload(uploadPath, buffer, {
        contentType: contentTypeFor(v.file),
        cacheControl: "3600",
        upsert: false,
      })
      if (error) throw error
      const { data } = supabase.storage.from(bucket).getPublicUrl(uploadPath)
      results.push({ productId: v.productId, name: v.name, url: data.publicUrl })
      console.log(`ok: ${v.name}`)
    } catch (err) {
      console.log(`FALLO: ${v.name} — ${err.message}`)
    }
  }

  await writeFile(OUT_FILE, JSON.stringify(results, null, 2), "utf-8")
  console.log(`\nListo. ${results.length} videos subidos, resultado en ${OUT_FILE}`)
}

main().catch((err) => { console.error(err); process.exit(1) })
