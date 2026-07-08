"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, User, ShoppingBag } from "lucide-react"
import { login, isAuthenticated } from "@/lib/auth"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Solo verificar sesión en el cliente
    if (isAuthenticated()) {
      router.replace("/admin")
    } else {
      setChecking(false)
    }
  }, [router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const ok = login(username.trim(), password.trim())
    if (ok) {
      router.replace("/admin")
    } else {
      setError("Usuario o contraseña incorrectos")
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.98 0 0)" }}>
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "oklch(0.38 0.12 248)", borderTopColor: "transparent" }} />
      </main>
    )
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "oklch(0.98 0.01 90)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo / header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center rounded-2xl p-4 mb-4"
            style={{ backgroundColor: "oklch(0.6 0.22 5)" }}
          >
            <ShoppingBag size={28} style={{ color: "oklch(1 0 0)" }} />
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: "oklch(0.2 0.02 270)" }}>
            Panel de Administracion
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.55 0.03 270)" }}>
            Santa Diabla
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 shadow-lg border"
          style={{ backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.88 0.03 90)" }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Usuario */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>
                Usuario
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "oklch(0.6 0 0)" }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="usuario"
                  required
                  autoComplete="username"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm border outline-none transition-all focus:ring-2"
                  style={{
                    borderColor: "oklch(0.88 0.03 90)",
                    backgroundColor: "oklch(0.98 0.01 90)",
                    color: "oklch(0.2 0.02 270)",
                  }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "oklch(0.6 0 0)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl pl-10 pr-11 py-3 text-sm border outline-none transition-all focus:ring-2"
                  style={{
                    borderColor: "oklch(0.88 0.03 90)",
                    backgroundColor: "oklch(0.98 0.01 90)",
                    color: "oklch(0.2 0.02 270)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword
                    ? <EyeOff size={15} style={{ color: "oklch(0.6 0 0)" }} />
                    : <Eye size={15} style={{ color: "oklch(0.6 0 0)" }} />
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p
                className="text-xs font-medium text-center rounded-lg px-3 py-2"
                style={{ backgroundColor: "oklch(0.97 0.05 5)", color: "oklch(0.5 0.22 5)" }}
              >
                {error}
              </p>
            )}

            {/* Boton */}
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl py-3 text-sm font-bold transition-all hover:scale-[1.02] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: "oklch(0.6 0.22 5)", color: "oklch(1 0 0)" }}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "oklch(0.65 0 0)" }}>
          <a href="/" className="hover:underline">
            Volver a la tienda
          </a>
        </p>
      </div>
    </main>
  )
}
