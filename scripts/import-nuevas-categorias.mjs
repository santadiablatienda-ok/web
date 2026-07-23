// Script de un solo uso: sube las fotos de las categorías nuevas agregadas en
// CATALOGO/ (Borcegos y Botas, Sandalias, Suecos) a Supabase Storage y genera
// un JSON {folder, name, category, image, gallery, colors} por producto para
// después generar los INSERT de la tabla products (el anon key no puede
// escribir en products directamente, RLS es admin-only para esa tabla).
// Uso: node scripts/import-nuevas-categorias.mjs

import { readdir, readFile, stat, writeFile } from "node:fs/promises"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"
import heicConvert from "heic-convert"

const ROOT = path.resolve(import.meta.dirname, "..")
const OUT_FILE = path.join(ROOT, "scripts", "nuevas-categorias-import-result.json")

const IMAGE_EXT = /\.(jpe?g|png|webp|heic|heif)$/i
const NON_COLOR_SUBFOLDER = /^(fotos?( nuevas?)?|nuevas?|general|varios|extra|suela.?)$/i

const CONFIGS = [
  { srcDir: path.join(ROOT, "CATALOGO", "BORCEGOS Y BOTAS"), category: "borcegos" },
  { srcDir: path.join(ROOT, "CATALOGO", "SANDALIAS"), category: "sandalias" },
  { srcDir: path.join(ROOT, "CATALOGO", "SUECOS"), category: "suecos" },
]

function stripAccents(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
}
function titleCase(raw) {
  return raw.trim().toLowerCase().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

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

async function uploadOne(supabase, bucket, filePath, label) {
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
    process.stdout.write(`  ok: ${label}\n`)
    return data.publicUrl
  } catch (err) {
    process.stdout.write(`  FALLO: ${label} — ${err.message}\n`)
    return null
  }
}

async function main() {
  const env = await loadEnvLocal()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local")

  const supabase = createClient(url, key)
  const bucket = "product-images"

  // Resumable: si ya hay un resultado parcial de una corrida anterior (se corta
  // por timeout dado el volumen de fotos), seguimos desde donde quedó en vez
  // de re-subir todo de nuevo.
  const existing = await readFile(OUT_FILE, "utf-8").then(JSON.parse).catch(() => [])
  const done = new Set(existing.map((p) => `${p.category}::${p.folder}`))
  const results = [...existing]
  if (done.size > 0) console.log(`Resumiendo: ${done.size} modelos ya subidos en una corrida anterior.`)

  for (const { srcDir, category } of CONFIGS) {
    const st = await stat(srcDir).catch(() => null)
    if (!st) {
      console.log(`\n(no existe ${srcDir}, se omite)`)
      continue
    }

    const topLevel = (await readdir(srcDir, { withFileTypes: true })).filter((e) => e.isDirectory())
    console.log(`\n=== ${category} (${srcDir}): ${topLevel.length} modelos ===`)

    for (const top of topLevel) {
      if (done.has(`${category}::${top.name}`)) continue
      const productDir = path.join(srcDir, top.name)
      const subEntries = await readdir(productDir, { withFileTypes: true })
      const rootFiles = subEntries.filter((e) => e.isFile() && IMAGE_EXT.test(e.name)).map((e) => e.name)
      const subDirs = subEntries.filter((e) => e.isDirectory())

      console.log(`\n→ ${top.name} (${subDirs.length} subcarpetas, ${rootFiles.length} fotos sueltas)`)

      const urls = []
      const colors = []

      for (const fileName of rootFiles.sort()) {
        const filePath = path.join(productDir, fileName)
        const url = await uploadOne(supabase, bucket, filePath, fileName)
        if (url) urls.push(url)
      }

      for (const sub of subDirs) {
        const subDir = path.join(productDir, sub.name)
        const files = (await readdir(subDir, { withFileTypes: true }))
          .filter((e) => e.isFile() && IMAGE_EXT.test(e.name))
          .map((e) => e.name)
          .sort()
        if (files.length === 0) continue

        const isColor = !NON_COLOR_SUBFOLDER.test(sub.name.trim())
        if (isColor) colors.push(titleCase(sub.name))

        for (const fileName of files) {
          const filePath = path.join(subDir, fileName)
          const url = await uploadOne(supabase, bucket, filePath, `${sub.name}/${fileName}`)
          if (url) urls.push(url)
        }
      }

      if (urls.length === 0) {
        console.log(`  (sin fotos subidas, se omite)`)
        continue
      }

      results.push({
        folder: top.name,
        name: titleCase(top.name),
        category,
        image: urls[0],
        gallery: urls.slice(1),
        colors,
      })

      // guardado incremental por si el proceso se corta a mitad de camino
      await writeFile(OUT_FILE, JSON.stringify(results, null, 2), "utf-8")
    }
  }

  await writeFile(OUT_FILE, JSON.stringify(results, null, 2), "utf-8")
  console.log(`\nListo. ${results.length} productos con fotos escritos en ${OUT_FILE}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
