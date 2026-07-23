"use client"

const banners = [
  {
    id: "botas",
    label: "Botas.",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568281440-47yriz.jpg",
  },
  {
    id: "borcegos",
    label: "Borcegos.",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1784743464526-zc91xw.jpg",
  },
  {
    id: "importados",
    label: "Importados.",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783736398590-r1vyjz.jpg",
  },
  {
    id: "ojotas",
    label: "Ojotas.",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1784683497127-kutx0r.jpg",
  },
  {
    id: "chicos",
    label: "Chicos.",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1784684495624-varvsd.jpg",
  },
  {
    id: "sandalias",
    label: "Sandalias.",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1784766148502-y9lwna.jpg",
  },
  {
    id: "suecos",
    label: "Suecos.",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1784766149255-swont7.jpg",
  },
]

export function CategoryBanners() {
  return (
    <section className="w-full">
      <div className="px-6 md:px-16 pt-14 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9E9E9E", letterSpacing: "0.2em" }}>
          Explora
        </p>
        <h2 className="font-black uppercase leading-none mt-2" style={{ color: "#000", fontSize: "clamp(1.75rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}>
          Elegi tu categoria.
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ backgroundColor: "#EBEBEB" }}>
        {banners.map((b) => (
          <a
            key={b.id}
            href="#catalogo"
            className="relative block w-full overflow-hidden group bg-white"
            style={{ aspectRatio: "3/4" }}
            aria-label={`Ver categoria ${b.label}`}
          >
            {b.image ? (
              <img
                src={b.image}
                alt={b.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full" style={{ backgroundColor: "#111" }} />
            )}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }}
            />
            <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
              <h3
                className="font-black uppercase leading-none"
                style={{ color: "#fff", fontSize: "clamp(1.1rem, 2.5vw, 1.75rem)", letterSpacing: "-0.02em" }}
              >
                {b.label}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
