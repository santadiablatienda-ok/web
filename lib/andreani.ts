// Envios por Andreani: no hay integracion por API (confirmado con Andreani — el envio
// se crea a mano en su sitio/app), asi que esto se limita a:
//  - un costo de envio estimado configurable, que se suma al total en el checkout
//  - datos fijos de remitente/origen para armar la "chuleta" que se copia al crear el
//    envio a mano en Andreani (ver panel de Pedidos en /admin)

export const ANDREANI_CP_ORIGEN = process.env.ANDREANI_CP_ORIGEN || "3200"
export const ANDREANI_SUCURSAL_ORIGEN = process.env.ANDREANI_SUCURSAL_ORIGEN || "Sarmiento"
export const ANDREANI_REMITENTE_NOMBRE = process.env.ANDREANI_REMITENTE_NOMBRE || "Santa Diabla"
export const ANDREANI_REMITENTE_DIRECCION = process.env.ANDREANI_REMITENTE_DIRECCION || ""

const ESTIMADO_ARS = Number(process.env.ANDREANI_ENVIO_ESTIMADO_ARS || 8000)

export interface ShippingQuote {
  costo: number
  estimado: boolean
  mensaje?: string
}

export async function quoteShipping(): Promise<ShippingQuote> {
  return {
    costo: ESTIMADO_ARS,
    estimado: true,
    mensaje: "Costo de envio estimado (el envio se coordina a mano con Andreani): puede variar del valor real.",
  }
}
