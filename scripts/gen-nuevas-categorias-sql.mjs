// Genera los INSERT de la tabla products para los productos subidos por
// import-nuevas-categorias.mjs (Borcegos y Botas, Sandalias, Suecos).
// Precio en 0 y active=false hasta que se cargue el precio real (convención
// del catálogo: ver memoria project-santa-diabla-catalog).
// Uso: node scripts/gen-nuevas-categorias-sql.mjs

import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const DATA_FILE = path.join(ROOT, "scripts", "nuevas-categorias-import-result.json")
const OUT_FILE = path.join(ROOT, "scripts", "nuevas-categorias-insert.sql")

const SIZES_MUJER = ["35", "36", "37", "38", "39", "40"]
// Tope de fotos por producto: algunas carpetas traen 50-100 fotos casi
// idénticas (varias tomas del mismo ángulo), muy por encima del máximo
// histórico del catálogo (~41). Se recorta a un total razonable de galería.
const MAX_GALLERY = 15

const PREFIX = { borcegos: "brc", sandalias: "san", suecos: "sue" }

const DESCRIPTION = {
  borcegos: (colors) => `Borcego en ecocuero con diseño prolijo, ideal para el uso diario.${colors.length ? ` Disponible en ${colors.join(" y ").toLowerCase()}.` : ""}`,
  sandalias: (colors) => `Sandalia cómoda para el uso diario.${colors.length ? ` Disponible en ${colors.join(" y ").toLowerCase()}.` : ""}`,
  suecos: (colors) => `Sueco cómodo, ideal para entrecasa o salidas cortas.${colors.length ? ` Disponible en ${colors.join(" y ").toLowerCase()}.` : ""}`,
}

const SPECS = {
  borcegos: (colors) => ["Empeine de ecocuero", "Suela de goma", ...(colors.length ? [`Colores disponibles: ${colors.join(", ")}`] : [])],
  sandalias: (colors) => ["Empeine sintético", "Suela de goma antideslizante", ...(colors.length ? [`Colores disponibles: ${colors.join(", ")}`] : [])],
  suecos: (colors) => ["Empeine de goma/EVA moldeado", "Suela antideslizante", ...(colors.length ? [`Colores disponibles: ${colors.join(", ")}`] : [])],
}

function sqlStr(s) {
  return `'${String(s).replace(/'/g, "''")}'`
}
function sqlArr(arr) {
  return `'{${arr.map((s) => `"${String(s).replace(/"/g, '\\"')}"`).join(",")}}'`
}

const data = JSON.parse(await readFile(DATA_FILE, "utf-8"))

const counters = {}
const lines = data.map((p) => {
  const prefix = PREFIX[p.category]
  counters[prefix] = (counters[prefix] ?? 0) + 1
  const id = `${prefix}-${String(counters[prefix]).padStart(3, "0")}`
  const desc = DESCRIPTION[p.category](p.colors)
  const specs = SPECS[p.category](p.colors)

  const cols = [
    "id", "name", "description", "specs", "price", "cost", "category",
    "image", "image_alt", "gallery", "sizes", "stock", "is_encargo",
    "colors", "active", "brand", "video",
  ]
  const gallery = p.gallery.slice(0, MAX_GALLERY)
  const vals = [
    sqlStr(id), sqlStr(p.name), sqlStr(desc), sqlArr(specs), "0", "0", sqlStr(p.category),
    sqlStr(p.image), sqlStr(p.name), sqlArr(gallery), sqlArr(SIZES_MUJER), "10", "false",
    sqlArr(p.colors), "false", sqlStr(""), sqlStr(""),
  ]
  return `INSERT INTO products (${cols.join(", ")}) VALUES (${vals.join(", ")});`
})

await writeFile(OUT_FILE, lines.join("\n") + "\n", "utf-8")
console.log(`Escrito ${lines.length} INSERTs en ${OUT_FILE}`)
