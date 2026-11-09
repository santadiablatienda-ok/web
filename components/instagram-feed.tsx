"use client"

import { useEffect, useState } from "react"
import { Instagram, ExternalLink, Loader2, AlertCircle } from "lucide-react"

interface InstagramPost {
  id: string
  caption: string
  mediaUrl: string
  permalink: string
  timestamp: string
}

export function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/instagram")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setPosts(data.posts ?? [])
        }
      })
      .catch(() => setError("No se pudieron cargar las fotos."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="instagram" className="py-16 px-4 md:px-8" style={{ backgroundColor: "oklch(0.98 0.01 90)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "oklch(0.72 0.2 50)" }}>
              Seguinos
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-balance" style={{ color: "oklch(0.2 0.02 270)" }}>
              Novedades en Instagram
            </h2>
          </div>
          <a
            href="https://www.instagram.com/santadiablatienda/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all hover:scale-105 shrink-0"
            style={{ backgroundColor: "oklch(0.6 0.22 5)", color: "oklch(1 0 0)" }}
          >
            <Instagram size={16} />
            @santadiablatienda
          </a>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={36} className="animate-spin" style={{ color: "oklch(0.6 0.22 5)" }} />
            <p className="text-sm" style={{ color: "oklch(0.5 0 0)" }}>Cargando publicaciones...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border"
            style={{ borderColor: "oklch(0.88 0.03 90)", backgroundColor: "oklch(1 0 0)" }}
          >
            <AlertCircle size={36} style={{ color: "oklch(0.6 0.22 5)" }} />
            <p className="text-sm font-medium text-center px-4" style={{ color: "oklch(0.3 0 0)" }}>
              {error}
            </p>
            <p className="text-xs text-center px-6" style={{ color: "oklch(0.55 0 0)" }}>
              Mientras tanto, podés ver nuestras publicaciones directamente en Instagram.
            </p>
            <a
              href="https://www.instagram.com/santadiablatienda/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity mt-1"
              style={{ color: "oklch(0.6 0.22 5)" }}
            >
              <Instagram size={16} />
              @santadiablatienda
            </a>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-2xl overflow-hidden block group shadow-sm"
                onMouseEnter={() => setHoveredId(post.id)}
                onMouseLeave={() => setHoveredId(null)}
                aria-label={post.caption ? `Ver publicación: ${post.caption.slice(0, 60)}` : "Ver publicación en Instagram"}
              >
                {/* Imagen */}
                <img
                  src={post.mediaUrl}
                  alt={post.caption ? post.caption.slice(0, 100) : "Publicación de Instagram de Santa Diabla"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Overlay al hover */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 transition-opacity duration-300"
                  style={{
                    backgroundColor: "oklch(0.6 0.22 5 / 0.85)",
                    opacity: hoveredId === post.id ? 1 : 0,
                  }}
                >
                  <ExternalLink size={22} style={{ color: "oklch(1 0 0)" }} />
                  {post.caption && (
                    <p
                      className="text-xs text-center leading-relaxed line-clamp-3"
                      style={{ color: "oklch(1 0 0 / 0.92)" }}
                    >
                      {post.caption.slice(0, 80)}{post.caption.length > 80 ? "…" : ""}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* CTA si no hay posts */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "oklch(0.5 0 0)" }}>No hay publicaciones disponibles.</p>
          </div>
        )}
      </div>
    </section>
  )
}
