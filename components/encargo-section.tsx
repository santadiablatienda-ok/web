"use client"

export function EncargoSection() {
  const waLink =
    "https://wa.me/5493456623935?text=Hola%2C%20quiero%20hacer%20un%20pedido%20por%20encargo.%20%C2%BFPodrian%20ayudarme%3F"

  return (
    <section id="encargo" className="w-full py-20 px-6 md:px-16" style={{ backgroundColor: "#000" }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-10">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#5C5C5C", letterSpacing: "0.2em" }}
          >
            Pedidos especiales
          </p>
          <h2
            className="font-black uppercase leading-none mb-5"
            style={{
              color: "#fff",
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              letterSpacing: "-0.03em",
              lineHeight: 0.92,
            }}
          >
            No encontras<br />tu talle?
          </h2>
          <p className="text-sm leading-relaxed max-w-md" style={{ color: "#5C5C5C" }}>
            Gestionamos pedidos a medida. Elegis el modelo, el talle y el color.
            Envios a todo el pais. Consultanos por WhatsApp y te respondemos a la brevedad.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80 whitespace-nowrap"
            style={{
              backgroundColor: "#fff",
              color: "#000",
              letterSpacing: "0.1em",
            }}
          >
            Consultar por WhatsApp
          </a>
          <p className="text-xs text-center" style={{ color: "#333" }}>
            Tiempo de entrega estimado: 10 a 15 dias habiles
          </p>
        </div>
      </div>
    </section>
  )
}
