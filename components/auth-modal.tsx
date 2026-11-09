"use client"

import { useState, useEffect } from "react"
import { X, User, Mail, Lock, Phone, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import {
  loginRetailClient,
  registerRetailClient,
  getRetailSession,
  logoutRetailClient,
  type RetailClient,
} from "@/lib/retail-store"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSessionChange: () => void
}

export function AuthModal({ isOpen, onClose, onSessionChange }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" })

  useEffect(() => {
    if (isOpen) { setError(""); setSuccess("") }
  }, [isOpen, tab])

  if (!isOpen) return null

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(""); setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    const res = loginRetailClient(loginForm.email, loginForm.password)
    setLoading(false)
    if (!res.ok) return setError(res.error ?? "Error al iniciar sesión.")
    onSessionChange()
    onClose()
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(""); setSuccess("")
    if (regForm.password !== regForm.confirm) return setError("Las contraseñas no coinciden.")
    if (regForm.password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.")
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    const res = registerRetailClient({
      name: regForm.name,
      email: regForm.email,
      phone: regForm.phone,
      password: regForm.password,
    })
    setLoading(false)
    if (!res.ok) return setError(res.error ?? "Error al registrarse.")
    setSuccess("Cuenta creada con éxito. Ya podés iniciar sesión.")
    setTab("login")
    setLoginForm({ email: regForm.email, password: "" })
  }

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm border outline-none focus:ring-2 transition-all"
  const inputStyle = {
    borderColor: "oklch(0.88 0.03 90)",
    backgroundColor: "oklch(0.99 0 0)",
    color: "oklch(0.2 0.02 270)",
  }
  const inputFocus = { "--tw-ring-color": "oklch(0.38 0.12 248 / 0.3)" } as React.CSSProperties

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "oklch(0 0 0 / 0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: "oklch(1 0 0)" }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b"
          style={{ borderColor: "oklch(0.91 0 0)", backgroundColor: "oklch(0.38 0.12 248)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "oklch(1 0 0 / 0.7)" }}>
                Santa Diabla
              </p>
              <p className="text-lg font-extrabold" style={{ color: "oklch(1 0 0)" }}>
                {tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 transition-opacity hover:opacity-70"
              style={{ backgroundColor: "oklch(1 0 0 / 0.15)", color: "oklch(1 0 0)" }}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div
            className="flex mt-4 rounded-xl overflow-hidden"
            style={{ backgroundColor: "oklch(1 0 0 / 0.12)" }}
          >
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setSuccess("") }}
                className="flex-1 py-2 text-sm font-semibold transition-all rounded-xl"
                style={{
                  backgroundColor: tab === t ? "oklch(1 0 0)" : "transparent",
                  color: tab === t ? "oklch(0.38 0.12 248)" : "oklch(1 0 0 / 0.8)",
                }}
              >
                {t === "login" ? "Iniciar sesión" : "Registrarse"}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Mensaje éxito */}
          {success && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4 text-sm font-medium"
              style={{ backgroundColor: "oklch(0.62 0.18 145 / 0.1)", color: "oklch(0.45 0.15 145)" }}
            >
              <CheckCircle2 size={16} />
              {success}
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 mb-4 text-sm font-medium"
              style={{ backgroundColor: "oklch(0.6 0.22 5 / 0.08)", color: "oklch(0.5 0.2 5)" }}
            >
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.45 0.03 270)" }}>
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.65 0 0)" }} />
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="tu@email.com"
                    className={inputClass}
                    style={{ ...inputStyle, ...inputFocus, paddingLeft: "2.5rem" }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.45 0.03 270)" }}>
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.65 0 0)" }} />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••"
                    className={inputClass}
                    style={{ ...inputStyle, ...inputFocus, paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "oklch(0.65 0 0)" }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60 mt-1"
                style={{ backgroundColor: "oklch(0.38 0.12 248)", color: "oklch(1 0 0)" }}
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              {[
                { key: "name", label: "Nombre completo", placeholder: "Juan Pérez", icon: User, type: "text" },
                { key: "email", label: "Email", placeholder: "tu@email.com", icon: Mail, type: "email" },
                { key: "phone", label: "Teléfono", placeholder: "345 412-3456", icon: Phone, type: "tel" },
              ].map(({ key, label, placeholder, icon: Icon, type }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.45 0.03 270)" }}>
                    {label}
                  </label>
                  <div className="relative">
                    <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.65 0 0)" }} />
                    <input
                      type={type}
                      required={key !== "phone"}
                      value={regForm[key as keyof typeof regForm]}
                      onChange={(e) => setRegForm({ ...regForm, [key]: e.target.value })}
                      placeholder={placeholder}
                      className={inputClass}
                      style={{ ...inputStyle, ...inputFocus, paddingLeft: "2.5rem" }}
                    />
                  </div>
                </div>
              ))}
              {[
                { key: "password", label: "Contraseña", placeholder: "Mínimo 6 caracteres" },
                { key: "confirm", label: "Confirmar contraseña", placeholder: "Repetir contraseña" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.45 0.03 270)" }}>
                    {label}
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.65 0 0)" }} />
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      value={regForm[key as keyof typeof regForm]}
                      onChange={(e) => setRegForm({ ...regForm, [key]: e.target.value })}
                      placeholder={placeholder}
                      className={inputClass}
                      style={{ ...inputStyle, ...inputFocus, paddingLeft: "2.5rem" }}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="flex items-center gap-1.5 text-xs self-start transition-opacity hover:opacity-70"
                style={{ color: "oklch(0.55 0 0)" }}
              >
                {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPass ? "Ocultar contraseñas" : "Mostrar contraseñas"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "oklch(0.38 0.12 248)", color: "oklch(1 0 0)" }}
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
