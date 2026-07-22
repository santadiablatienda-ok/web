"use client"

export function AboutSection() {
  return (
    <section id="nosotros" className="w-full py-20 px-6 md:px-16" style={{ backgroundColor: "#fff" }}>
      <div className="max-w-3xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "#9E9E9E", letterSpacing: "0.2em" }}
        >
          Quienes somos
        </p>
        <h2
          className="font-black uppercase leading-none mb-8"
          style={{
            color: "#000",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
          }}
        >
          Santa Diabla.
        </h2>

        <div className="flex flex-col gap-5 text-base leading-relaxed" style={{ color: "#333" }}>
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
            Con el tiempo, esa misma actitud empezó a calzar a toda la familia. Hoy en SANTA DIABLA también
            encontrás estilo para él y para los más chicos, porque la personalidad no tiene edad ni
            género — se elige, se usa y se lleva puesta.
          </p>
          <p className="font-semibold" style={{ color: "#000" }}>
            SANTA DIABLA es ese equilibrio entre lo delicado y lo atrevido, entre lo clásico y lo diferente.
            Para toda la familia que sabe lo que quiere.
          </p>
        </div>
      </div>
    </section>
  )
}
