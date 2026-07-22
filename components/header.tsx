"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, Menu, X, Settings, Search } from "lucide-react"

interface HeaderProps {
  cartCount: number
  onCartOpen: () => void
  onSearchSubmit: (value: string) => void
}

export function Header({ cartCount, onCartOpen, onSearchSubmit }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const menuLinks = [
    { label: "Nosotros",    href: "#nosotros" },
    { label: "Catalogo",    href: "#catalogo" },
    { label: "Botas",       href: "#botas" },
    { label: "Importados",  href: "#importados" },
    { label: "Ojotas",      href: "#ojotas" },
    { label: "Chicos",      href: "#chicos" },
    { label: "Por Encargo", href: "#encargo" },
  ]

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearchSubmit(searchValue)
  }

  return (
    <>
      {/* Announcement bar */}
      <div
        className="w-full text-center py-2 text-xs font-semibold tracking-widest uppercase"
        style={{ backgroundColor: "#000", color: "#fff", letterSpacing: "0.12em" }}
      >
        Envios a todo el pais
      </div>

      <header className="sticky top-0 z-50 w-full border-b" style={{ backgroundColor: "#fff", borderColor: "#E0E0E0" }}>
        <nav className="flex items-center gap-4 md:gap-6 px-4 md:px-8 py-3.5 max-w-7xl mx-auto">

          {/* Menu desplegable */}
          <div className="relative flex items-center flex-shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center p-1.5 transition-opacity hover:opacity-60"
              style={{ color: "#000" }}
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div
                  className="absolute left-0 top-full mt-3 z-50 w-56 py-2 shadow-lg border"
                  style={{ backgroundColor: "#fff", borderColor: "#E0E0E0" }}
                >
                  {menuLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-black hover:text-white"
                      style={{ color: "#000", letterSpacing: "0.08em" }}
                    >
                      {link.label}
                    </a>
                  ))}
                  <Link
                    href="/admin/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-1.5 px-5 py-2.5 mt-1 border-t text-xs font-semibold"
                    style={{ color: "#9E9E9E", borderColor: "#EBEBEB" }}
                  >
                    <Settings size={12} />
                    Admin
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Logo */}
          <Link
            href="#inicio"
            className="text-xl font-black tracking-tight uppercase flex-shrink-0"
            style={{ color: "#000", letterSpacing: "-0.02em" }}
          >
            Santa Diabla.
          </Link>

          {/* Inicio */}
          <a
            href="#inicio"
            className="inline text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-50 whitespace-nowrap flex-shrink-0"
            style={{ color: "#000", letterSpacing: "0.08em" }}
          >
            Inicio
          </a>

          {/* Barra de busqueda */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 hidden md:block">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#9E9E9E" }} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-11 pr-4 py-2.5 text-sm outline-none transition-all rounded-full focus:ring-1"
              style={{
                backgroundColor: "#F5F5F5",
                border: "1px solid #E0E0E0",
                color: "#000",
              }}
            />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3 ml-auto md:ml-0 flex-shrink-0">
            <button
              onClick={onCartOpen}
              className="relative flex items-center justify-center w-10 h-10 transition-opacity hover:opacity-60"
              style={{ color: "#000" }}
              aria-label={`Carrito, ${cartCount} articulos`}
            >
              <ShoppingCart size={21} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-black rounded-full"
                  style={{ backgroundColor: "#000", color: "#fff" }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Barra de busqueda mobile */}
        <form onSubmit={handleSearchSubmit} className="relative px-4 pb-3.5 md:hidden">
          <Search size={16} className="absolute left-8 top-1/2 -translate-y-1/2" style={{ color: "#9E9E9E" }} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-11 pr-4 py-2.5 text-sm outline-none transition-all rounded-full"
            style={{
              backgroundColor: "#F5F5F5",
              border: "1px solid #E0E0E0",
              color: "#000",
            }}
          />
        </form>
      </header>
    </>
  )
}
