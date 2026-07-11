"use client"

const banners = [
  {
    id: "botas",
    label: "Botas.",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568281440-47yriz.jpg",
    dark: true,
  },
  {
    id: "samba",
    label: "Samba.",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568321416-9a4il0.jpg",
    dark: false,
  },
  {
    id: "zapatillas",
    label: "Zapatillas.",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568285353-wxc227.jpg",
    dark: true,
  },
  {
    id: "importados",
    label: "Importados.",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783736398590-r1vyjz.jpg",
    dark: false,
  },
]

export function CategoryBanners() {
  return (
    <section className="w-full">
      {banners.map(({ id, label, image, dark }) => (
        <a
          key={id}
          href={`#catalogo`}
          className="relative block w-full overflow-hidden group"
          style={{ height: "clamp(260px, 35vw, 420px)" }}
          aria-label={`Ver categoria ${label}`}
        >
          <img
            src={image}
            alt={label}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            style={{ opacity: dark ? 0.5 : 0.75 }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: dark
                ? "linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 70%)"
                : "linear-gradient(to right, rgba(255,255,255,0.85) 0%, transparent 60%)",
            }}
          />
          <div className="absolute inset-0 flex items-end px-8 md:px-16 pb-8 md:pb-12">
            <h2
              className="font-black uppercase leading-none"
              style={{
                color: dark ? "#fff" : "#000",
                fontSize: "clamp(3rem, 7vw, 6rem)",
                letterSpacing: "-0.03em",
                lineHeight: 0.9,
              }}
            >
              {label}
            </h2>
          </div>
        </a>
      ))}
    </section>
  )
}
