"use client"

import { useRef, useState } from "react"
import { Upload, X, Loader2, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { uploadProductImage } from "@/lib/supabase"

interface GalleryManagerProps {
  images: string[]
  onChange: (images: string[]) => void
  label?: string
}

const c = {
  black: "#000000",
  white: "#FFFFFF",
  gray200: "#E0E0E0",
  gray400: "#9E9E9E",
  gray600: "#5C5C5C",
  accent: "#E63946",
}

export function GalleryManager({ images, onChange, label = "Fotos del producto" }: GalleryManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (list.length === 0) return
    setError("")
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of list) {
        urls.push(await uploadProductImage(file))
      }
      onChange([...images, ...urls])
    } catch {
      setError("No se pudieron subir algunas imágenes. Intentá de nuevo.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  function onDrop(index: number) {
    if (dragIndex === null || dragIndex === index) { setDragIndex(null); setOverIndex(null); return }
    move(dragIndex, index)
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: c.gray600, letterSpacing: "0.06em" }}>
          {label}
        </label>
      )}

      <p className="text-xs" style={{ color: c.gray400 }}>
        La primera foto es la portada (la que se ve en el catálogo). Arrastrá las fotos para reordenarlas.
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((src, i) => (
          <div
            key={src + i}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => { e.preventDefault(); setOverIndex(i) }}
            onDragLeave={() => setOverIndex((cur) => (cur === i ? null : cur))}
            onDrop={() => onDrop(i)}
            onDragEnd={() => { setDragIndex(null); setOverIndex(null) }}
            className="relative aspect-square border cursor-move group"
            style={{
              borderColor: overIndex === i && dragIndex !== null && dragIndex !== i ? c.black : c.gray200,
              borderWidth: overIndex === i && dragIndex !== null && dragIndex !== i ? 2 : 1,
              opacity: dragIndex === i ? 0.4 : 1,
            }}
          >
            <img
              src={src}
              alt={`Foto ${i + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.15" }}
            />

            {i === 0 && (
              <span
                className="absolute top-1 left-1 flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase"
                style={{ backgroundColor: c.black, color: c.white, letterSpacing: "0.04em" }}
              >
                <Star size={9} fill={c.white} /> Portada
              </span>
            )}

            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Quitar foto"
              className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: c.accent, color: c.white }}
            >
              <X size={11} />
            </button>

            <div className="absolute bottom-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label="Mover antes"
                className="w-5 h-5 flex items-center justify-center disabled:opacity-30"
                style={{ backgroundColor: c.white, color: c.black }}
              >
                <ChevronLeft size={12} />
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === images.length - 1}
                aria-label="Mover después"
                className="w-5 h-5 flex items-center justify-center disabled:opacity-30"
                style={{ backgroundColor: c.white, color: c.black }}
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        ))}

        <div
          onClick={() => inputRef.current?.click()}
          role="button"
          aria-label="Agregar fotos"
          className="aspect-square border border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors hover:bg-black/5"
          style={{ borderColor: c.gray200, color: c.gray400 }}
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          <span className="text-[10px] font-bold uppercase text-center px-1" style={{ letterSpacing: "0.04em" }}>
            {uploading ? "Subiendo..." : "Agregar fotos"}
          </span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={uploading}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-xs font-semibold" style={{ color: c.accent }}>{error}</p>}
    </div>
  )
}
