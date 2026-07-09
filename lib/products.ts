export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  imageAlt: string
  gallery?: string[]
  badge?: string
  featured?: boolean
  sizes?: string[]
  stock?: number        // -1 = encargo puro, 0 = sin stock, >0 = con stock
  isEncargo?: boolean
  colors?: string[]
  discountPercent?: number  // 0-100, descuento simple sobre el precio
  season?: string           // etiqueta libre, ej: "Verano 2026", "Invierno 2026"
}

export function finalPrice(product: Pick<Product, "price" | "discountPercent">): number {
  if (!product.discountPercent || product.discountPercent <= 0) return product.price
  return Math.round(product.price * (1 - product.discountPercent / 100))
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export const categories: Category[] = [
  { id: "todos",      name: "Todos",        icon: "sparkles", color: "#000000" },
  { id: "botas",      name: "Botas",        icon: "boot",     color: "#111111" },
  { id: "borcegos",   name: "Borcegos",     icon: "shoe",     color: "#333333" },
  { id: "zapatillas", name: "Zapatillas",   icon: "sneaker",  color: "#555555" },
  { id: "samba",      name: "Samba",        icon: "sneaker",  color: "#6B4C2A" },
  { id: "importados", name: "Importados",   icon: "star",     color: "#777777" },
  { id: "encargo",    name: "Por Encargo",  icon: "tag",      color: "#E63946" },
]

const SIZES_MUJER = ["35", "36", "37", "38", "39", "40"]
const SIZES_UNISEX = ["36", "37", "38", "39", "40", "41", "42", "43"]
const SIZES_ZAPATILLA = ["35", "36", "37", "38", "39", "40", "41"]

export const products: Product[] = [
  // BOTAS
  {
    id: "bot-001",
    name: "Texana Sophie",
    description: "Bota texana en cuero vacuno con bordado artesanal. Punta fina, taco bajo. Un icono.",
    price: 85000,
    category: "botas",
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&q=80",
    imageAlt: "Bota texana de cuero marron con bordado artesanal",
    badge: "Nuevo",
    featured: true,
    sizes: SIZES_MUJER,
    stock: 8,
  },
  {
    id: "bot-002",
    name: "Texana Robbie",
    description: "Texana slouchy de cana ancha con herrajes metalicos. La bota que define el look.",
    price: 79000,
    category: "botas",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    imageAlt: "Bota texana slouchy cana ancha negra con herrajes",
    badge: "Mas vendida",
    featured: true,
    sizes: SIZES_MUJER,
    stock: 5,
  },
  {
    id: "bot-003",
    name: "Bota Cana Alta Clasica",
    description: "Bota de cana alta en cuero sintetico negro. Versatil, elegante, intemporal.",
    price: 65000,
    category: "botas",
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80",
    imageAlt: "Bota de cana alta negra en cuero sintetico",
    sizes: SIZES_MUJER,
    stock: 12,
  },
  {
    id: "bot-004",
    name: "Bota Slouchy Terciopelo",
    description: "Bota arrugada en terciopelo con efecto vintage. Soft pero con caracter.",
    price: 72000,
    category: "botas",
    image: "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=600&q=80",
    imageAlt: "Bota slouchy arrugada en terciopelo gris",
    sizes: SIZES_MUJER,
    stock: 4,
    featured: true,
  },
  {
    id: "bot-005",
    name: "Botas Caro",
    description: "Bota alta en cuero sintetico negro con flecos laterales. Cana blanda, taco bajo.",
    price: 0,
    category: "botas",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568281440-47yriz.jpg",
    imageAlt: "Botas Caro negras con flecos laterales",
    gallery: [
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568282429-hia9xy.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568282663-hywr11.jpg",
    ],
    colors: ["Negro"],
    sizes: SIZES_MUJER,
    stock: 10,
  },
  {
    id: "bot-006",
    name: "Botas Wanda",
    description: "Bota alta en cuero sintetico negro con detalle de argollas metalicas.",
    price: 0,
    category: "botas",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568282902-12ft6w.jpg",
    imageAlt: "Botas Wanda negras con argollas metalicas",
    gallery: [
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568283172-ya2z7a.jpg",
    ],
    colors: ["Negro"],
    sizes: SIZES_MUJER,
    stock: 10,
  },
  // BORCEGOS
  {
    id: "bor-001",
    name: "Borcego Combate Negro",
    description: "Borcego con suela plataforma y hebillas laterales. Peso, presencia, actitud.",
    price: 68000,
    category: "borcegos",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80",
    imageAlt: "Borcego negro de plataforma con hebillas laterales",
    badge: "Top",
    featured: true,
    sizes: SIZES_MUJER,
    stock: 6,
  },
  {
    id: "bor-002",
    name: "Borcego Military",
    description: "Inspiracion militar con cordones gruesos y suela de goma. Resistente y estilizado.",
    price: 58000,
    category: "borcegos",
    image: "https://images.unsplash.com/photo-1608731267464-bba3a2f50e46?w=600&q=80",
    imageAlt: "Borcego estilo militar marron con cordones gruesos",
    sizes: SIZES_MUJER,
    stock: 9,
  },
  // ZAPATILLAS
  {
    id: "zap-001",
    name: "Samba Style Beige",
    description: "Zapatilla de perfil bajo inspiracion retro. Tres tiras, suela goma natural. Clasica con actitud.",
    price: 55000,
    category: "samba",
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&q=80",
    imageAlt: "Zapatilla estilo Samba beige con tres tiras laterales",
    badge: "Tendencia",
    featured: true,
    sizes: SIZES_ZAPATILLA,
    stock: 15,
  },
  {
    id: "zap-002",
    name: "Chunky Platform Blanca",
    description: "Zapatilla de suela gruesa con capas de EVA. La plataforma que eleva cualquier look.",
    price: 62000,
    category: "zapatillas",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
    imageAlt: "Zapatilla chunky blanca con suela gruesa de plataforma",
    sizes: SIZES_ZAPATILLA,
    stock: 7,
  },
  {
    id: "zap-003",
    name: "Zapatilla Samba Blanco-Café",
    description: "Zapatilla estilo Samba en blanco y café. Tres tiras, suela goma natural.",
    price: 0,
    category: "samba",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568285353-wxc227.jpg",
    imageAlt: "Zapatilla Samba blanco y café",
    gallery: [
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568286979-t4b1b2.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568288457-tnhj64.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568289678-2yljmh.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568291590-t08z7s.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568293558-t3mkd2.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568295638-gkwlel.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568297855-jq33lg.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568300169-d63443.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568302428-lk2enl.jpg",
    ],
    colors: ["Blanco/Café"],
    sizes: SIZES_ZAPATILLA,
    stock: 10,
  },
  {
    id: "zap-004",
    name: "Zapatilla Samba Cherry",
    description: "Zapatilla estilo Samba en tono cherry. Tres tiras, suela goma natural.",
    price: 0,
    category: "samba",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568304778-dj5w89.jpg",
    imageAlt: "Zapatilla Samba color cherry",
    gallery: [
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568307133-f7vw6d.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568309554-cd8x3p.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568311825-40r0ez.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568313287-lrkiqa.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568314818-5wrxye.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568316075-4vn622.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568317441-75vi6s.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568319153-lipbb9.jpg",
    ],
    colors: ["Cherry"],
    sizes: SIZES_ZAPATILLA,
    stock: 10,
  },
  {
    id: "zap-005",
    name: "Zapatilla Samba Chocolate",
    description: "Zapatilla estilo Samba en tono chocolate. Tres tiras, suela goma natural.",
    price: 0,
    category: "samba",
    image: "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568321416-9a4il0.jpg",
    imageAlt: "Zapatilla Samba color chocolate",
    gallery: [
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568323232-wjxv3t.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568324870-vnmwhp.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568326243-mwsgcj.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568327512-7jvm3r.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568329506-qks9le.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568331824-32dd1z.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568334146-gqxp3o.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568336438-77op95.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568338979-iwtuql.jpg",
      "https://zwkkhtnklqmdhbwlcimg.supabase.co/storage/v1/object/public/product-images/1783568341543-kpgk38.jpg",
    ],
    colors: ["Chocolate"],
    sizes: SIZES_ZAPATILLA,
    stock: 10,
  },
  // IMPORTADOS
  {
    id: "imp-001",
    name: "Nike Dunk SB Importado",
    description: "Dunk SB original importado. Calidad certificada, colorways exclusivos. Stock limitado.",
    price: 145000,
    category: "importados",
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80",
    imageAlt: "Nike Dunk SB importado en colorway exclusivo",
    badge: "Importado",
    featured: true,
    sizes: SIZES_UNISEX,
    stock: 3,
  },
  {
    id: "imp-002",
    name: "Adidas Campus 00s",
    description: "Campus 00s importado en gamuza premium. El modelo del momento, directo de origen.",
    price: 130000,
    category: "importados",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    imageAlt: "Adidas Campus 00s importado en gamuza marrón",
    badge: "Importado",
    sizes: SIZES_UNISEX,
    stock: 2,
  },
  // ENCARGO
  {
    id: "enc-001",
    name: "Bota a Medida (Encargo)",
    description: "Elegis el modelo, el color y la talla. Lo gestionamos directo desde fabrica. Tiempo de entrega: 15 dias.",
    price: 90000,
    category: "encargo",
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&q=80",
    imageAlt: "Bota de cuero a medida por encargo personalizada",
    isEncargo: true,
    stock: -1,
    sizes: ["A consultar"],
  },
  {
    id: "enc-002",
    name: "Zapatilla por Encargo",
    description: "El modelo que queres, el talle que precisas. Consultanos por WhatsApp y lo conseguimos.",
    price: 100000,
    category: "encargo",
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&q=80",
    imageAlt: "Zapatilla por encargo personalizada",
    isEncargo: true,
    stock: -1,
    sizes: ["A consultar"],
  },
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
