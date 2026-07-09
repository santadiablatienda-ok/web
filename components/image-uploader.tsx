"use client"

import { useRef, useState, useCallback } from "react"
import { Upload, X, Link, ImageIcon, Loader2 } from "lucide-react"
import { uploadProductImage } from "@/lib/supabase"

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  label?: string
  previewSize?: "sm" | "md" | "lg"
}

export function ImageUploader({ value, onChange, label = "Imagen", previewSize = "md" }: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [tab, setTab] = useState<"upload" | "url">("upload")
  const [urlInput, setUrlInput] = useState(value.startsWith("http") ? value : "")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const previewDim = previewSize === "sm" ? "w-16 h-16" : previewSize === "lg" ? "w-full h-48" : "w-28 h-28"

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file.type.startsWith("image/")) return
    setError("")
    setUploading(true)
    try {
      const url = await uploadProductImage(file)
      onChange(url)
    } catch {
      setError("No se pudo subir la imagen. Intentá de nuevo.")
    } finally {
      setUploading(false)
    }
  }

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      await handleFiles(e.dataTransfer.files)
    },
    []
  )

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  function handleUrlApply() {
    const url = urlInput.trim()
    if (url) onChange(url)
  }

  function handleClear() {
    onChange("")
    setUrlInput("")
    if (inputRef.current) inputRef.current.value = ""
  }

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm border outline-none transition-colors focus:border-blue-400"
  const inputStyle = { borderColor: "oklch(0.88 0.03 90)", backgroundColor: "oklch(1 0 0)", color: "oklch(0.2 0.02 270)" }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>
          {label}
        </label>
      )}

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border text-xs font-semibold w-fit" style={{ borderColor: "oklch(0.88 0.03 90)" }}>
        {[
          { id: "upload", icon: Upload, label: "Archivo" },
          { id: "url", icon: Link, label: "URL" },
        ].map(({ id, icon: Icon, label: tabLabel }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id as "upload" | "url")}
            className="flex items-center gap-1.5 px-3 py-2 transition-all"
            style={{
              backgroundColor: tab === id ? "oklch(0.38 0.12 248)" : "oklch(1 0 0)",
              color: tab === id ? "oklch(1 0 0)" : "oklch(0.55 0 0)",
            }}
          >
            <Icon size={12} />
            {tabLabel}
          </button>
        ))}
      </div>

      {/* Tab: Subir archivo */}
      {tab === "upload" && (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className="relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-6 px-4"
          style={{
            borderColor: dragging ? "oklch(0.38 0.12 248)" : "oklch(0.85 0.03 90)",
            backgroundColor: dragging ? "oklch(0.38 0.12 248 / 0.05)" : "oklch(0.98 0.01 90)",
          }}
          role="button"
          aria-label="Subir imagen"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "oklch(0.38 0.12 248 / 0.1)" }}
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin" style={{ color: "oklch(0.38 0.12 248)" }} />
            ) : (
              <Upload size={18} style={{ color: "oklch(0.38 0.12 248)" }} />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: "oklch(0.3 0.02 270)" }}>
              {uploading ? "Subiendo..." : "Arrastrá una imagen aquí"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "oklch(0.6 0 0)" }}>
              o hacé clic para seleccionar · JPG, PNG, WEBP
            </p>
          </div>
        </div>
      )}
      {error && (
        <p className="text-xs font-semibold" style={{ color: "oklch(0.6 0.22 5)" }}>{error}</p>
      )}

      {/* Tab: URL */}
      {tab === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleUrlApply())}
            placeholder="https://..."
            className={inputClass}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={handleUrlApply}
            className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold flex-shrink-0 transition-all hover:opacity-80"
            style={{ backgroundColor: "oklch(0.38 0.12 248)", color: "oklch(1 0 0)" }}
          >
            Aplicar
          </button>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative w-fit">
          <div
            className={`${previewDim} rounded-xl overflow-hidden border`}
            style={{ borderColor: "oklch(0.88 0.03 90)" }}
          >
            {value.startsWith("data:") || value.startsWith("http") || value.startsWith("/") ? (
              <img
                src={value}
                alt="Vista previa"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.target as HTMLImageElement
                  el.style.display = "none"
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "oklch(0.93 0.01 90)" }}>
                <ImageIcon size={20} style={{ color: "oklch(0.7 0 0)" }} />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleClear}
            aria-label="Quitar imagen"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110"
            style={{ backgroundColor: "oklch(0.6 0.22 5)", color: "oklch(1 0 0)" }}
          >
            <X size={11} />
          </button>
        </div>
      )}
    </div>
  )
}
