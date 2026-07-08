"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, Menu, X, Settings } from "lucide-react"

interface HeaderProps {
  cartCount: number
  onCartOpen: () => void
}

export function Header({ cartCount, onCartOpen }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { label: "Inicio",      href: "#inicio" },
    { label: "Catalogo",    href: "#catalogo" },
    { label: "Botas",       href: "#botas" },
    { label: "Zapatillas",  href: "#zapatillas" },
    { label: "Importados",  href: "#importados" },
    { label: "Por Encargo", href: "#encargo" },
  ]

  return (
    <>
      {/* Announcement bar */}
      <div
        className="w-full text-center py-2 text-xs font-semibold tracking-widest uppercase"
        style={{ backgroundColor: "#000", color: "#fff", letterSpacing: "0.12em" }}
      >
        Envios a todo el pais · Concordia, Entre Rios
      </div>

      <header className="sticky top-0 z-50 w-full border-b" style={{ backgroundColor: "#fff", borderColor: "#E0E0E0" }}>
        <nav className="flex items-center justify-between px-4 md:px-8 py-3.5 max-w-7xl mx-auto">

          {/* Hamburger mobile */}
          <button
            className="md:hidden p-1.5"
            style={{ color: "#000" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link
            href="#inicio"
            className="text-xl font-black tracking-tight uppercase"
            style={{ color: "#000", letterSpacing: "-0.02em" }}
          >
            Santa Diabla.
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-50"
                  style={{ color: "#000", letterSpacing: "0.08em" }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border transition-all hover:bg-black hover:text-white"
              style={{ borderColor: "#E0E0E0", color: "#5C5C5C" }}
              aria-label="Panel admin"
            >
              <Settings size={12} />
              Admin
            </Link>

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

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t px-6 py-4 flex flex-col gap-1" style={{ backgroundColor: "#fff", borderColor: "#E0E0E0" }}>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-semibold uppercase tracking-wider py-3 border-b transition-opacity hover:opacity-50"
                style={{ color: "#000", borderColor: "#EBEBEB", letterSpacing: "0.08em" }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/admin/login"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: "#9E9E9E" }}
              onClick={() => setMenuOpen(false)}
            >
              <Settings size={12} />
              Admin
            </Link>
          </div>
        )}
      </header>
    </>
  )
}
