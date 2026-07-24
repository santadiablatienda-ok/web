import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Cliente con service role: bypassea RLS. Usar SOLO en rutas de servidor de
// confianza (webhook de pagos, creacion de preferencia) — nunca en codigo
// que corra en el navegador, y la key nunca debe llevar prefijo NEXT_PUBLIC.
// Necesario porque las policies de "orders" solo dejan hacer UPDATE a un
// usuario autenticado (el admin), y estas rutas corren sin sesion de usuario.
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error("Falta configurar SUPABASE_SERVICE_ROLE_KEY en las variables de entorno")
  }
  return createClient(url, serviceKey)
}
