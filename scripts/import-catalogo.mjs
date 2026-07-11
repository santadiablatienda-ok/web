// Script de un solo uso: sube las fotos de CATALOGO/ a Supabase Storage y
// genera un JSON con los productos listos para pegar en lib/products.ts.
// Uso: node scripts/import-catalogo.mjs

import { readdir, readFile, stat, writeFile } from "node:fs/promises"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"
import heicConvert from "heic-convert"

const ROOT = path.resolve(import.meta.dirname, "..")
const CATALOGO_DIR = path.join(ROOT, "CATALOGO")
const OUT_FILE = path.join(ROOT, "scripts", "catalogo-import-result.json")

const IMAGE_EXT = /\.(jpe?g|png|webp|heic|heif)$/i

async function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local")
  const text = await readFile(envPath, "utf-8")
  const env = {}
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

function titleCase(raw) {
  return raw.trim().toLowerCase().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

function guessCategory(relativePath) {
  const n = relativePath.toLowerCase()
  if (n.includes("borcego")) return "borcegos"
  if (n.includes("samba")) return "samba"
  if (n.includes("zapatilla")) return "zapatillas"
  if (n.includes("importado")) return "importados"
  if (n.includes("bota")) return "botas"
  return "botas"
}

const SIZES_MUJER = ["35", "36", "37", "38", "39", "40"]
const SIZES_ZAPATILLA = ["35", "36", "37", "38", "39", "40", "41"]

function sizesForCategory(cat) {
  return cat === "zapatillas" || cat === "samba" ? SIZES_ZAPATILLA : SIZES_MUJER
}

async function findLeafImageFolders(dir, isRoot = false) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = entries.filter((e) => e.isFile() && IMAGE_EXT.test(e.name)).map((e) => e.name)
  const dirs = entries.filter((e) => e.isDirectory())

  let results = []
  if (files.length > 0 && !isRoot) {
    results.push({ dir, folderName: path.basename(dir), files })
  }
  for (const d of dirs) {
    const sub = await findLeafImageFolders(path.join(dir, d.name))
    results = results.concat(sub)
  }
  return results
}

async function toUploadBuffer(filePath) {
  const buf = await readFile(filePath)
  if (/\.(heic|heif)$/i.test(filePath)) {
    const converted = await heicConvert({ buffer: buf, format: "JPEG", quality: 0.85 })
    return { buffer: Buffer.from(converted), ext: "jpg", contentType: "image/jpeg" }
  }
  const ext = path.extname(filePath).slice(1).toLowerCase().replace("jpeg", "jpg")
  const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg"
  return { buffer: buf, ext, contentType }
}

async function main() {
  const env = await loadEnvLocal()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local")

  const supabase = createClient(url, key)
  const bucket = "product-images"

  const st = await stat(CATALOGO_DIR).catch(() => null)
  if (!st) throw new Error(`No existe la carpeta ${CATALOGO_DIR}`)

  const folders = await findLeafImageFolders(CATALOGO_DIR, true)
  console.log(`Encontradas ${folders.length} carpetas con imagenes.`)

  const products = []

  for (const { dir, folderName, files } of folders) {
    const sorted = [...files].sort((a, b) => a.length - b.length || a.localeCompare(b))
    console.log(`\n→ ${folderName} (${sorted.length} imagenes)`)
    const urls = []
    for (const fileName of sorted) {
      const filePath = path.join(dir, fileName)
      try {
        const { buffer, ext, contentType } = await toUploadBuffer(filePath)
        const uploadPath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const { error } = await supabase.storage.from(bucket).upload(uploadPath, buffer, {
          contentType,
          cacheControl: "3600",
          upsert: false,
        })
        if (error) throw error
        const { data } = supabase.storage.from(bucket).getPublicUrl(uploadPath)
        urls.push(data.publicUrl)
        process.stdout.write(`  ok: ${fileName}\n`)
      } catch (err) {
        process.stdout.write(`  FALLO: ${fileName} — ${err.message}\n`)
      }
    }
    if (urls.length === 0) continue

    const name = titleCase(folderName)
    const category = guessCategory(path.relative(CATALOGO_DIR, dir))
    products.push({
      name,
      description: "",
      price: 0,
      category,
      image: urls[0],
      imageAlt: name,
      gallery: urls.slice(1),
      featured: false,
      colors: [],
      sizes: sizesForCategory(category),
      stock: 10,
      isEncargo: false,
      discountPercent: 0,
      season: "",
    })
  }

  await writeFile(OUT_FILE, JSON.stringify(products, null, 2), "utf-8")
  console.log(`\nListo. ${products.length} productos escritos en ${OUT_FILE}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
