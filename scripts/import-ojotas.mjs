import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

const ROOT = path.resolve(import.meta.dirname, "..")
const OJOTAS_DIR = path.join(ROOT, "CATALOGO", "OJOTAS")
const OUT_FILE = path.join(ROOT, "scripts", "ojotas-result.json")
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i

const MODELS = [
  { folder: "ADILETTE ☀️", name: "Adilette" },
  { folder: "GOMONES ☀️", name: "Gomones" },
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
    const dir = path.join(OJOTAS_DIR, model.folder)
    const files = (await readdir(dir, { withFileTypes: true }))
      .filter((e) => e.isFile() && IMAGE_EXT.test(e.name)).map((e) => e.name).sort()
    console.log(`\n→ ${model.name} (${files.length} fotos)`)

    const urls = []
    for (const fileName of files) {
      try {
        const buf = await readFile(path.join(dir, fileName))
        const ext = path.extname(fileName).slice(1).toLowerCase().replace("jpeg", "jpg")
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
