"use client"

import { useRef, useState } from "react"
import { FolderInput, Loader2 } from "lucide-react"
import { type Product, type Category } from "@/lib/products"

interface FolderImporterProps {
  categories: Category[]
  onImport: (products: Omit<Product, "id">[]) => void
}

function titleCase(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function FolderImporter({ categories, onImport }: FolderImporterProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ count: number; folders: string[] } | null>(null)

  const defaultCategory = categories.find((c) => c.id !== "todos")?.id ?? "botas"

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setLoading(true)
    setResult(null)

    // Agrupar archivos de imagen por su subcarpeta (primer segmento del path relativo)
    const groups = new Map<string, File[]>()
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith("image/")) return
      const relPath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name
      const parts = relPath.split("/")
      const folder = parts.length > 1 ? parts[parts.length - 2] : "Sin carpeta"
      const arr = groups.get(folder) ?? []
      arr.push(file)
      groups.set(folder, arr)
    })

    const newProducts: Omit<Product, "id">[] = []
    for (const [folder, files] of groups) {
      const sorted = [...files].sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name))
      const base64s = await Promise.all(sorted.map(fileToBase64))
      const name = titleCase(folder)
      newProducts.push({
        name,
        description: "",
        price: 0,
        category: defaultCategory,
        image: base64s[0] ?? "",
        imageAlt: name,
        gallery: base64s.slice(1),
        featured: false,
        colors: [],
        sizes: [],
        stock: 10,
        isEncargo: false,
        discountPercent: 0,
        season: "",
      })
    }

    onImport(newProducts)
    setResult({ count: newProducts.length, folders: Array.from(groups.keys()) })
    setLoading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        // @ts-expect-error -- webkitdirectory no está tipado en el DOM estándar
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border transition-all hover:opacity-80 disabled:opacity-60"
        style={{ borderColor: "oklch(0.88 0.03 90)", color: "oklch(0.4 0.03 270)", backgroundColor: "oklch(0.98 0.01 90)" }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <FolderInput size={14} />}
        {loading ? "Importando..." : "Importar desde carpeta"}
      </button>
      {result && (
        <p className="text-xs" style={{ color: "oklch(0.55 0.18 145)" }}>
          Se importaron {result.count} producto{result.count !== 1 ? "s" : ""} ({result.folders.join(", ")}).
          Completá precio, categoría, talles y stock de cada uno.
        </p>
      )}
    </div>
  )
}
