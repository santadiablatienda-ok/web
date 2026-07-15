import { Instagram, Phone, MapPin, Truck } from "lucide-react"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ backgroundColor: "#111" }}>
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand */}
          <div>
            <p
              className="text-2xl font-black uppercase mb-3 tracking-tight"
              style={{ color: "#fff", letterSpacing: "-0.02em" }}
            >
              Santa Diabla.
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#5C5C5C", letterSpacing: "0.12em" }}>
              The woman with attitude
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#5C5C5C" }}>
              Calzado de caracter para la mujer que no pide permiso. Botas, borcegos, zapatillas e importados. Envios a todo el pais.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/santadiablatienda/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Santa Diabla"
                className="flex items-center justify-center w-9 h-9 border transition-all hover:bg-white hover:border-white hover:text-black"
                style={{ borderColor: "#333", color: "#9E9E9E" }}
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://wa.me/5493456623935"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Santa Diabla"
                className="flex items-center justify-center w-9 h-9 border transition-all hover:bg-white hover:border-white hover:text-black"
                style={{ borderColor: "#333", color: "#9E9E9E" }}
              >
                <Phone size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: "#fff", letterSpacing: "0.15em" }}
            >
              Navegacion
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Inicio",        href: "#inicio" },
                { label: "Catalogo",      href: "#catalogo" },
                { label: "Botas",         href: "#botas" },
                { label: "Zapatillas",    href: "#zapatillas" },
                { label: "Importados",    href: "#importados" },
                { label: "Por Encargo",   href: "#encargo" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "#5C5C5C" }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: "#fff", letterSpacing: "0.15em" }}
            >
              Contacto
            </h3>
            <ul className="flex flex-col gap-5">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#5C5C5C" }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: "#9E9E9E" }}>Envios a todo el pais</p>
                  <p className="text-xs mt-0.5" style={{ color: "#5C5C5C" }}>Argentina</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#5C5C5C" }} />
                <div>
                  <a
                    href="https://wa.me/5493456623935"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium transition-colors hover:text-white"
                    style={{ color: "#9E9E9E" }}
                  >
                    +54 9 3456 62-3935
                  </a>
                  <p className="text-xs mt-0.5" style={{ color: "#5C5C5C" }}>WhatsApp disponible</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Instagram size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#5C5C5C" }} />
                <div>
                  <a
                    href="https://www.instagram.com/santadiablatienda/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium transition-colors hover:text-white"
                    style={{ color: "#9E9E9E" }}
                  >
                    @santadiablatienda
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Truck size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#5C5C5C" }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: "#9E9E9E" }}>Seguí tu envío</p>
                  <div className="flex flex-col gap-1 mt-1">
                    <a
                      href="https://www.andreani.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold uppercase tracking-wide transition-colors hover:text-white underline"
                      style={{ color: "#5C5C5C" }}
                    >
                      Andreani
                    </a>
                    <a
                      href="https://viacargo.com.ar/seguimiento-de-envio/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold uppercase tracking-wide transition-colors hover:text-white underline"
                      style={{ color: "#5C5C5C" }}
                    >
                      Via Cargo
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-3 border-t text-xs"
          style={{ borderColor: "#222", color: "#333" }}
        >
          <p>&copy; {year} Santa Diabla. Todos los derechos reservados.</p>
          <p>Envios a todo el pais, Argentina</p>
        </div>
      </div>
    </footer>
  )
}
