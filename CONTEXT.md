# Contexto de sesión — Santa Diabla

> Nota para Claude: este archivo es un punto de partida para retomar el trabajo. Leelo primero, después verificá el estado real del proyecto (git log, git status, npm run dev) antes de asumir que algo sigue igual — pueden haber pasado cambios manuales del usuario entre sesiones.

## Cómo arrancar

```bash
cd "C:\Users\Administrador\Desktop\SANTA DIABLA\WEB"
npm run dev
```

- Sitio: http://localhost:3000
- Admin: http://localhost:3000/admin/login — usuario/contraseña `SANTADIABLA.2026`

## Infraestructura

- GitHub: `github.com/santadiablatienda-ok/web`, rama `main`.
- Supabase: proyecto `santa-diabla` (id `zwkkhtnklqmdhbwlcimg`, región `sa-east-1`). Bucket público `product-images` para fotos de producto.
- **Separado por completo** del proyecto `cotillon_cienfuegos` (otro cliente) — nunca tocar ni reutilizar nada de ahí.
- Todo lo comiteado hasta ahora está pusheado a `origin/main` (último commit al cierre de la sesión anterior: `7c35f89`).

## Qué se hizo (sesión 2026-07-08/09)

1. Repo git reubicado desde la carpeta de perfil de Windows a la carpeta correcta del proyecto.
2. Fix crítico de Tailwind v4 (`globals.css` usaba sintaxis vieja de v3, rompía media escala de utilidades — layout roto en todo el sitio).
3. Medios de pago: solo Transferencia y Mercado Pago/billetera virtual (se sacó depósito y tarjeta).
4. Calculadora de envíos eliminada (estimaciones poco precisas).
5. Modelo de producto ampliado: descuento %, temporada, galería de imágenes, colores visibles en la tienda.
6. Flujo "sin stock → pedir por encargo con seña del 50%" (cart + WhatsApp + registro de pedido).
7. Panel admin: rediseño completo en B&N (antes era azul/oklch genérico), edición de producto in-place (se abre debajo del ítem, no arriba de todo), métricas completas (facturación por categoría, ranking de productos, alertas de stock).
8. Módulo de Mayoristas eliminado por completo (tab, store, login roto).
9. Integración real con Supabase Storage para las imágenes (antes quedaban en base64 en localStorage).
10. Importador de productos desde carpeta `CATALOGO/` — desde el admin (botón, usa el navegador) o con `scripts/import-catalogo.mjs` (Node, standalone, convierte HEIC a JPEG).
11. 5 productos reales cargados con fotos propias: Botas Caro, Botas Wanda, Zapatilla Samba (Blanco-Café / Cherry / Chocolate). Categoría nueva "Samba" separada de "Zapatillas" genérica.
12. Hero de la home convertido en carrusel automático con los productos reales.
13. Footer: links de seguimiento de envío (Andreani y Via Cargo).

## Pendiente / próximos pasos

- **Completar precio, categoría y talles** de los productos recién importados (quedaron en $0, hay que editarlos desde el admin).
- **Fotos del proveedor "Precios Miami Surtido"** (Drive externo, no accesible por API): el usuario tiene que bajar manualmente lo que quiera vender a `CATALOGO/` (carpeta por modelo). Mencionó específicamente que quería cargar zapatillas Samba de ahí.
- Categorías **Borcegos** e **Importados** todavía muestran fotos de stock (Unsplash) en los banners — reemplazar cuando haya fotos propias.
- **Seguridad**: el bucket de Supabase Storage tiene escritura pública porque el admin no tiene autenticación real (solo password hardcodeada en el cliente). Si se migra el catálogo/pedidos a tablas reales de Supabase, sumar auth real antes.
- Arquitectura: productos/categorías/pedidos siguen en `localStorage` del navegador — funciona pero tiene límite de tamaño (~5-10MB) y no persiste entre navegadores/dispositivos. Migrar a tablas Postgres de Supabase es el paso lógico si el catálogo sigue creciendo.

## Cómo prefiere trabajar el usuario

- Ir de a partes, no todo en una tanda gigante — avisar y verificar en localhost entre pasos grandes.
- No comitear/pushear sin que lo pida explícitamente, pero cuando lo pide, hacerlo sin re-preguntar.
