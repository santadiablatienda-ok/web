import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const DATA_FILE = path.join(ROOT, "scripts", "zapatillas-mayorista-result.json")
const OUT_FILE = path.join(ROOT, "scripts", "zapatillas-mayorista-insert.sql")

const SIZES = ["35", "36", "37", "38", "39", "40", "41"]
const JUNK_COLORS = new Set(["sin stock", "agotada", "agotadas", "ningun talle", "ningún talle", "air force one"])
const SKIP_NAMES = new Set(["jordan high top"]) // duplica un producto ya existente (zap-011)

function sqlStr(s) { return `'${String(s).replace(/'/g, "''")}'` }
function sqlArr(arr) { return `'{${arr.map((s) => `"${String(s).replace(/"/g, '\\"')}"`).join(",")}}'` }

const data = JSON.parse(await readFile(DATA_FILE, "utf-8"))
const filtered = data.filter((p) => !SKIP_NAMES.has(p.name.toLowerCase()))

let n = 18
const lines = filtered.map((p) => {
  const id = `zap-${String(n++).padStart(3, "0")}`
  const cleanColors = (p.colors || []).filter((c) => !JUNK_COLORS.has(c.toLowerCase()))
  return `INSERT INTO products (id, name, description, price, category, image, image_alt, gallery, sizes, stock, size_stock, is_encargo, colors, active) VALUES (${sqlStr(id)}, ${sqlStr(p.name)}, '', 0, 'importados', ${sqlStr(p.image)}, ${sqlStr(p.name)}, ${sqlArr(p.gallery)}, ${sqlArr(SIZES)}, 10, '{}', false, ${sqlArr(cleanColors)}, false);`
})

await writeFile(OUT_FILE, lines.join("\n") + "\n", "utf-8")
console.log(`Escritos ${lines.length} INSERTs (de ${data.length} originales, ${data.length - filtered.length} excluidos por duplicado) en ${OUT_FILE}`)
console.log(`Tamaño: ${(await readFile(OUT_FILE, "utf-8")).length} caracteres`)
