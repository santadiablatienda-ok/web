export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  imageAlt: string
  badge?: string
  featured?: boolean
  sizes?: string[]
  stock?: number        // -1 = encargo puro, 0 = sin stock, >0 = con stock
  isEncargo?: boolean
  colors?: string[]
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
    category: "zapatillas",
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
