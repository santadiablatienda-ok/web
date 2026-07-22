import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

const ROOT = path.resolve(import.meta.dirname, "..")
const DIR = path.join(ROOT, "CATALOGO", "ZAPATILLAS", "ZAPAS DE CHICOS")
const OUT_FILE = path.join(ROOT, "scripts", "chicos-result.json")

// modelos confirmados visualmente: mismo modelo que ya existe en Importados, en talle de nino
const MODELS = [
  { name: "Nike Air Force (Niño)", files: ["21 AL 34.jpg"] },
  { name: "Vans (Niño)", files: ["Vans 21 al 34.jpg"] },
  { name: "Adidas Samba (Niño)", files: ["23 al 34.jpg", "23 al 34(1).jpg"] },
  { name: "Adidas Running (Niño)", files: ["26 AL 34.jpg", "26 al 34_.jpg"] },
  { name: "Adidas Campus (Niño)", files: ["27 AL 34.jpg"] },
  { name: "DC (Niño)", files: ["DC del 27 al 34_.jpg"] },
  { name: "Nike Air Max (Niño)", files: ["SOLO 31.jpg"] },
  { name: "Nike Presto (Niño)", files: ["27 al 34(2).jpg"] },
]

async function loadEnvLocal() {
  const text = await readFile(path.join(ROOT, ".env.local"), "utf-8")
  const env = {}
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

async function main() {
  const env = await loadEnvLocal()
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const bucket = "product-images"
  const results = []

  for (const model of MODELS) {
    console.log(`\n→ ${model.name}`)
    const urls = []
    for (const fileName of model.files) {
      try {
        const buf = await readFile(path.join(DIR, fileName))
        const ext = path.extname(fileName).slice(1).toLowerCase().replace("jpeg", "jpg") || "jpg"
        const contentType = ext === "png" ? "image/png" : "image/jpeg"
        const uploadPath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const { error } = await supabase.storage.from(bucket).upload(uploadPath, buf, { contentType, cacheControl: "3600", upsert: false })
        if (error) throw error
        const { data } = supabase.storage.from(bucket).getPublicUrl(uploadPath)
        urls.push(data.publicUrl)
        console.log(`  ok: ${fileName}`)
      } catch (err) {
        console.log(`  FALLO: ${fileName} — ${err.message}`)
      }
    }
    if (urls.length > 0) results.push({ name: model.name, image: urls[0], gallery: urls.slice(1) })
  }

  await writeFile(OUT_FILE, JSON.stringify(results, null, 2), "utf-8")
  console.log(`\nListo. ${results.length} productos en ${OUT_FILE}`)
}

main().catch((err) => { console.error(err); process.exit(1) })
