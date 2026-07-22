"use client"

export function AboutSection() {
  return (
    <section id="nosotros" className="w-full py-20 px-6 md:px-16" style={{ backgroundColor: "#000" }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

        {/* Logo banner */}
        <div className="w-full overflow-hidden" style={{ aspectRatio: "1/1", backgroundColor: "#000" }}>
          <img
            src="/logo.jpg"
            alt="Santa Diabla — For women with attitude"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Texto */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#5C5C5C", letterSpacing: "0.2em" }}
          >
            Quienes somos
          </p>
          <h2
            className="font-black uppercase leading-none mb-8"
            style={{
              color: "#fff",
              fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
            }}
          >
            Santa Diabla.
          </h2>

          <div className="flex flex-col gap-5 text-base leading-relaxed" style={{ color: "#9E9E9E" }}>
            <p>
              SANTA DIABLA nace de una idea simple: vestirnos como realmente somos.
            </p>
            <p>
              Porque no creemos en encajar, creemos en destacar. No creemos en seguir tendencias porque sí,
              creemos en elegir aquello que nos representa.
            </p>
            <p>
              Creamos este espacio para mujeres con personalidad. Actitud y estilo propio. Mujeres que saben
              lo que quieren, que se animan a mostrarse auténticas y que entienden que la moda también es una
              forma de expresión.
            </p>
            <p>
              Con el tiempo, esa misma actitud empezó a calzar a todas las personas. Hoy en SANTA DIABLA
              también encontrás estilo para él y para los más chicos, porque la personalidad no tiene edad
              ni género — se elige, se usa y se lleva puesta.
            </p>
            <p className="font-semibold" style={{ color: "#fff" }}>
              SANTA DIABLA es ese equilibrio entre lo delicado y lo atrevido, entre lo clásico y lo diferente.
              Para quien sabe lo que quiere.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
