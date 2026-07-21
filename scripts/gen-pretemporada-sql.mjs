import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const DATA_FILE = path.join(ROOT, "scripts", "pretemporada-import-result.json")
const OUT_FILE = path.join(ROOT, "scripts", "pretemporada-update.sql")

function sqlStr(s) {
  return `'${String(s).replace(/'/g, "''")}'`
}
function sqlArr(arr) {
  return `'{${arr.map((s) => `"${String(s).replace(/"/g, '\\"')}"`).join(",")}}'`
}

const data = JSON.parse(await readFile(DATA_FILE, "utf-8"))

const lines = data.map((p) => {
  return `UPDATE products SET image = ${sqlStr(p.image)}, gallery = ${sqlArr(p.gallery)}, colors = ${sqlArr(p.colors)} WHERE name = ${sqlStr(p.name)};`
})

await writeFile(OUT_FILE, lines.join("\n") + "\n", "utf-8")
console.log(`Escrito ${lines.length} UPDATEs en ${OUT_FILE}`)
console.log(`Tamaño: ${(await readFile(OUT_FILE, "utf-8")).length} caracteres`)
