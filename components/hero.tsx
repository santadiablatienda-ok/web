"use client"

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "#000", minHeight: "90vh" }}
    >
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1400&q=80"
          alt="Calzado de moda Santa Diabla"
          className="w-full h-full object-cover"
          style={{ opacity: 0.45 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-start justify-end h-full px-6 md:px-16 py-16 md:py-24" style={{ minHeight: "90vh" }}>
        <div className="max-w-3xl">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: "#9E9E9E", letterSpacing: "0.2em" }}
          >
            Concordia, Entre Rios &mdash; Envios a todo el pais
          </p>

          <h1
            className="font-black uppercase leading-none mb-6"
            style={{
              color: "#fff",
              fontSize: "clamp(3.5rem, 10vw, 8rem)",
              letterSpacing: "-0.03em",
              lineHeight: 0.92,
            }}
          >
            Santa<br />Diabla.
          </h1>

          <p
            className="text-base md:text-lg font-medium mb-10 max-w-md leading-relaxed"
            style={{ color: "#9E9E9E" }}
          >
            Calzado con caracter. Botas, borcegos, zapatillas e importados para la mujer que sabe lo que quiere.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#catalogo"
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{
                backgroundColor: "#fff",
                color: "#000",
                letterSpacing: "0.1em",
              }}
            >
              Ver coleccion
            </a>
            <a
              href="#encargo"
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold uppercase tracking-widest border transition-opacity hover:bg-white hover:text-black"
              style={{
                borderColor: "#fff",
                color: "#fff",
                letterSpacing: "0.1em",
              }}
            >
              Pedir por encargo
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2">
          <div className="w-px h-16" style={{ backgroundColor: "#9E9E9E" }} />
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "#9E9E9E", writingMode: "vertical-rl", letterSpacing: "0.15em" }}
          >
            Scroll
          </p>
        </div>
      </div>
    </section>
  )
}
