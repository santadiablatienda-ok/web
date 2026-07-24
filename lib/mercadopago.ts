import { MercadoPagoConfig, Preference, Payment } from "mercadopago"

// Solo se usa en server (API routes) — el access token nunca debe llegar al cliente.
function getClient(): MercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error("Falta configurar MERCADOPAGO_ACCESS_TOKEN en las variables de entorno")
  }
  return new MercadoPagoConfig({ accessToken })
}

export function getPreferenceClient(): Preference {
  return new Preference(getClient())
}

export function getPaymentClient(): Payment {
  return new Payment(getClient())
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.santadiablatienda.com"
}
