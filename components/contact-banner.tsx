"use client"

export function ContactBanner() {
  return (
    <section
      className="py-16 px-6 md:px-16 text-center"
      style={{ backgroundColor: "#F5F5F5", borderTop: "1px solid #E0E0E0" }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-4"
        style={{ color: "#9E9E9E", letterSpacing: "0.2em" }}
      >
        Seguinos
      </p>
      <h2
        className="text-2xl md:text-3xl font-black uppercase mb-4"
        style={{ color: "#000", letterSpacing: "-0.02em" }}
      >
        @santadiablatienda
      </h2>
      <p className="text-sm mb-8" style={{ color: "#5C5C5C" }}>
        Novedades, lookbooks y stock disponible en Instagram.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="https://www.instagram.com/santadiablatienda/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-8 py-3 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
          style={{ backgroundColor: "#000", color: "#fff", letterSpacing: "0.1em" }}
        >
          Seguir en Instagram
        </a>
        <a
          href="https://wa.me/5493456623935"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-8 py-3 text-xs font-bold uppercase tracking-widest border transition-all hover:bg-black hover:text-white"
          style={{ borderColor: "#000", color: "#000", letterSpacing: "0.1em" }}
        >
          Escribirnos por WhatsApp
        </a>
      </div>
    </section>
  )
}
