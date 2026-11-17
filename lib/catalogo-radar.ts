import { finalPrice, type Category, type Product } from "@/lib/products"

// Catalogo para RADAR (radartuciudad.com/santa-diabla): un CSV con las columnas de la planilla de
// RADAR, que RADAR lee todos los dias desde /api/catalogo/radar.csv y con el que crea, actualiza y
// marca sin stock los productos solo. Formato acordado:
//   UTF-8 con BOM, separador coma, todo entre comillas dobles, una fila por producto.
//   ID = id del producto en esta web (bot-005). Precio = el final, con el descuento aplicado;
//   Precio anterior = el de lista, solo si hay descuento. Stock por talle = suma de todos los
//   colores de ese talle ("35:2; 36:0"). Foto y Mas fotos = links publicos de Supabase Storage.
//   Los productos desactivados van con Disponible = No (salvo los que todavia no tienen precio).
// Nunca se exporta el costo de compra ni nada del admin.

export const COLUMNAS_RADAR = [
  "ID",
  "Categoría",
  "Nombre",
  "Descripción",
  "Precio",
  "Precio anterior",
  "Talles",
  "Colores",
  "Disponible",
  "Stock por talle",
  "Talles agotados",
  "Foto",
  "Más fotos",
] as const

const MAX_FOTOS_EXTRA = 8

function celda(v: string | number | null | undefined): string {
  const t = v === null || v === undefined ? "" : String(v)
  return `"${t.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`
}

function suma(valores: Record<string, number> | undefined): number {
  return Object.values(valores ?? {}).reduce((a, n) => a + (Number.isFinite(n) ? Math.max(0, n) : 0), 0)
}

// Stock por talle segun como lo carga el admin: talle x color, por talle, por color o total.
// null = no se sabe (no se le manda stock a RADAR y no lo toca).
export function stockParaRadar(p: Product): Record<string, number> | null {
  if (p.isEncargo || p.stock === -1) return null
  const talles = p.sizes ?? []
  if (talles.length > 0) {
    if (p.variantStock && Object.keys(p.variantStock).length > 0) {
      return Object.fromEntries(talles.map((t) => [t, suma(p.variantStock?.[t])]))
    }
    if (p.sizeStock && Object.keys(p.sizeStock).length > 0) {
      return Object.fromEntries(talles.map((t) => [t, Math.max(0, p.sizeStock?.[t] ?? 0)]))
    }
    return null
  }
  if (p.colorStock && Object.keys(p.colorStock).length > 0) return { "": suma(p.colorStock) }
  if (typeof p.stock === "number" && p.stock >= 0) return { "": p.stock }
  return null
}

function nombreCategoria(id: string, categorias: Category[]): string {
  const c = categorias.find((x) => x.id === id)
  if (c) return c.name
  return id ? id.charAt(0).toUpperCase() + id.slice(1) : "General"
}

export function filaRadar(p: Product, categorias: Category[]): string[] {
  const precio = p.price > 0 ? finalPrice(p) : 0
  const conDescuento = p.price > 0 && (p.discountPercent ?? 0) > 0 && precio < p.price
  const stock = stockParaRadar(p)
  const talles = p.sizes ?? []
  const agotados = stock ? talles.filter((t) => stock[t] === 0) : []
  const foto = p.image?.startsWith("http") ? p.image : ""
  const extra = (p.gallery ?? []).filter((u) => u?.startsWith("http") && u !== foto).slice(0, MAX_FOTOS_EXTRA)
  return [
    p.id,
    nombreCategoria(p.category, categorias),
    p.name,
    p.description ?? "",
    precio > 0 ? String(precio) : "",
    conDescuento ? String(p.price) : "",
    talles.join(", "),
    (p.colors ?? []).join(", "),
    p.active === false ? "No" : "Sí",
    stock ? Object.entries(stock).map(([t, n]) => (t ? `${t}:${n}` : String(n))).join("; ") : "",
    agotados.join(", "),
    foto,
    extra.join(" "),
  ]
}

// Lo que se manda: todo lo que esta a la venta, y lo agotado que tiene precio (va como "No
// disponible"). Los desactivados sin precio son altas que todavia esperan precio y foto: en RADAR
// solo serian productos vacios, asi que no se mandan hasta que se completen.
export function paraRadar(p: Product): boolean {
  return p.active !== false || p.price > 0
}

export function csvRadar(productos: Product[], categorias: Category[]): string {
  const lineas = [COLUMNAS_RADAR.map(celda).join(",")]
  for (const p of productos.filter(paraRadar)) lineas.push(filaRadar(p, categorias).map(celda).join(","))
  return "﻿" + lineas.join("\r\n") + "\r\n"
}
