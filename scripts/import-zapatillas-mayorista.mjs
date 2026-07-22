// Script de un solo uso: sube las fotos de ZAPAS PREMIUM y ZAPA ECONOMICAS
// (CATALOGO/ZAPATILLAS/) a Supabase Storage y genera un JSON con
// {name, image, gallery, colors} por producto para el UPDATE/INSERT en products.
// Uso: node scripts/import-zapatillas-mayorista.mjs

import { readdir, readFile, stat, writeFile } from "node:fs/promises"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"
import heicConvert from "heic-convert"

const ROOT = path.resolve(import.meta.dirname, "..")
const ZAPATILLAS_DIR = path.join(ROOT, "CATALOGO", "ZAPATILLAS")
const OUT_FILE = path.join(ROOT, "scripts", "zapatillas-mayorista-result.json")

const SOURCES = ["ZAPAS PREMIUM 🇧🇷", "ZAPA ECONÓMICAS"]
const IMAGE_EXT = /\.(jpe?g|png|webp|heic|heif)$/i
const SKIP_FOLDERS = new Set(["TRASH", "JORDAN RETRO", "JORDAN TRAVIS LOW", "JORDAN LOW"]) // ya existen como productos propios
const NON_COLOR_SUBFOLDER = /^(fotos?( nuevas?)?|nuevas?|general|varios|extra|suela.?)$/i

function stripAccents(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "") }
function normalize(s) { return stripAccents(s).toUpperCase().trim() }
function titleCase(raw) {
  return raw.trim().toLowerCase().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

async function loadEnvLocal() {
  const text = await readFile(path.join(ROOT, ".env.local"), "utf-8")
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
      contentType, cacheControl: "3600", upsert: false,
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
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const bucket = "product-images"

  const results = []

  for (const source of SOURCES) {
    const sourceDir = path.join(ZAPATILLAS_DIR, source)
    const st = await stat(sourceDir).catch(() => null)
    if (!st) { console.log(`(no existe ${source}, se omite)`); continue }

    const topLevel = (await readdir(sourceDir, { withFileTypes: true })).filter((e) => e.isDirectory())
    console.log(`\n=== ${source}: ${topLevel.length} modelos ===`)

    for (const top of topLevel) {
      const key = normalize(top.name)
      if (SKIP_FOLDERS.has(key)) {
        console.log(`\n= ${top.name}: SKIP (ya existe como producto propio)`)
        continue
      }

      const productDir = path.join(sourceDir, top.name)
      const subEntries = await readdir(productDir, { withFileTypes: true })
      const rootFiles = subEntries.filter((e) => e.isFile() && IMAGE_EXT.test(e.name)).map((e) => e.name)
      const subDirs = subEntries.filter((e) => e.isDirectory())

      console.log(`\n→ ${top.name} (${subDirs.length} subcarpetas, ${rootFiles.length} fotos sueltas)`)

      const urls = []
      const colors = []

      for (const fileName of rootFiles.sort()) {
        const url = await uploadOne(supabase, bucket, path.join(productDir, fileName), fileName)
        if (url) urls.push(url)
      }

      for (const sub of subDirs) {
        const subDir = path.join(productDir, sub.name)
        const files = (await readdir(subDir, { withFileTypes: true }))
          .filter((e) => e.isFile() && IMAGE_EXT.test(e.name)).map((e) => e.name).sort()
        if (files.length === 0) continue

        const isColor = !NON_COLOR_SUBFOLDER.test(sub.name.trim())
        if (isColor) colors.push(titleCase(sub.name))

        for (const fileName of files) {
          const url = await uploadOne(supabase, bucket, path.join(subDir, fileName), `${sub.name}/${fileName}`)
          if (url) urls.push(url)
        }
      }

      if (urls.length === 0) { console.log(`  (sin fotos subidas, se omite)`); continue }

      results.push({
        source,
        folder: top.name,
        name: titleCase(top.name),
        image: urls[0],
        gallery: urls.slice(1),
        colors,
      })
    }
  }

  await writeFile(OUT_FILE, JSON.stringify(results, null, 2), "utf-8")
  console.log(`\nListo. ${results.length} productos con fotos escritos en ${OUT_FILE}`)
}

main().catch((err) => { console.error(err); process.exit(1) })
