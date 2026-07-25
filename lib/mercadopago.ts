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
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  // En preview deployments de Vercel no hay un dominio fijo conocido de antemano;
  // Vercel expone la URL real del deploy en esta variable automaticamente.
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  return "https://www.santadiablatienda.com"
}
