// Script de un solo uso: sube las fotos de CATALOGO/PRETEMPORADA_TMP/ a Supabase
// Storage y genera un JSON {name, image, gallery, colors} por producto para
// pegar en un UPDATE de la tabla products (el anon key no puede escribir en
// products directamente, RLS es admin-only para esa tabla).
// Uso: node scripts/import-pretemporada.mjs

import { readdir, readFile, stat, writeFile } from "node:fs/promises"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"
import heicConvert from "heic-convert"

const ROOT = path.resolve(import.meta.dirname, "..")
const SRC_DIR = path.join(ROOT, "CATALOGO", "PRETEMPORADA_TMP")
const OUT_FILE = path.join(ROOT, "scripts", "pretemporada-import-result.json")

const IMAGE_EXT = /\.(jpe?g|png|webp|heic|heif)$/i
// Ya existen como productos propios, no tocar sus fotos actuales
const SKIP_FOLDERS = new Set(["AMBAR", "AQUILA", "ARES", "CHESTER", "DRAKO", "GRETA", "LUPE", "MAGNA", "MILANO", "TOSCANA_"])
// Nombres de subcarpeta que NO son color (van a la galeria igual, pero no al array colors)
const NON_COLOR_SUBFOLDER = /^(fotos?( nuevas?)?|nuevas?|general|varios|extra|suela.?)$/i

function stripAccents(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
}
function normalize(s) {
  return stripAccents(s).toUpperCase().trim()
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

async function main() {
  const env = await loadEnvLocal()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local")

  const supabase = createClient(url, key)
  const bucket = "product-images"

  const st = await stat(SRC_DIR).catch(() => null)
  if (!st) throw new Error(`No existe ${SRC_DIR}`)

  const topLevel = (await readdir(SRC_DIR, { withFileTypes: true })).filter((e) => e.isDirectory())
  console.log(`Encontrados ${topLevel.length} modelos.`)

  const results = []

  for (const top of topLevel) {
    const key = normalize(top.name)
    if (SKIP_FOLDERS.has(key)) {
      console.log(`\n= ${top.name}: SKIP (ya existe como producto propio)`)
      continue
    }

    const productDir = path.join(SRC_DIR, top.name)
    const subEntries = await readdir(productDir, { withFileTypes: true })
    const rootFiles = subEntries.filter((e) => e.isFile() && IMAGE_EXT.test(e.name)).map((e) => e.name)
    const subDirs = subEntries.filter((e) => e.isDirectory())

    console.log(`\n→ ${top.name} (${subDirs.length} subcarpetas, ${rootFiles.length} fotos sueltas)`)

    const urls = []
    const colors = []

    // fotos sueltas directo en la carpeta del modelo (sin subcarpeta de color)
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
      image: urls[0],
      gallery: urls.slice(1),
      colors,
    })
  }

  await writeFile(OUT_FILE, JSON.stringify(results, null, 2), "utf-8")
  console.log(`\nListo. ${results.length} productos con fotos escritos en ${OUT_FILE}`)
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

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
