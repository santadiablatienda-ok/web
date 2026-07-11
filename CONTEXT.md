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
- Todo lo comiteado hasta ahora está pusheado a `origin/main` (último commit al cierre de esta sesión: `b58a124`).
- GitHub avisa (warning, no bloquea) que 2 videos `.mov` de Samba (~80MB c/u) superan el tamaño recomendado de 50MB. Si el repo sigue creciendo con más videos convendría migrar a Git LFS.

## Qué se hizo (sesión 2026-07-08/09)

1. Repo git reubicado desde la carpeta de perfil de Windows a la carpeta correcta del proyecto.
2. Fix crítico de Tailwind v4 (`globals.css` usaba sintaxis vieja de v3, rompía media escala de utilidades — layout roto en todo el sitio).
3. Medios de pago: solo Transferencia y Mercado Pago/billetera virtual (se sacó depósito y tarjeta).
4. Calculadora de envíos eliminada (estimaciones poco precisas).
5. Modelo de producto ampliado: descuento %, temporada, galería de imágenes, colores visibles en la tienda.
6. Flujo "sin stock → pedir por encargo con seña del 50%" (cart + WhatsApp + registro de pedido). Nota: la sección "Encargo" del home (`components/encargo-section.tsx`) es un CTA estático a WhatsApp, no depende de productos de la categoría "encargo".
7. Panel admin: rediseño completo en B&N, edición de producto in-place, métricas completas.
8. Módulo de Mayoristas eliminado por completo.
9. Integración real con Supabase Storage para las imágenes.
10. Importador de productos desde carpeta `CATALOGO/` — admin (botón, navegador) o `scripts/import-catalogo.mjs` (Node, standalone, convierte HEIC a JPEG).
11. 5 productos reales cargados: Botas Caro, Botas Wanda, Zapatilla Samba (Blanco-Café / Cherry / Chocolate).
12. Hero de la home convertido en carrusel automático con los productos reales.
13. Footer: links de seguimiento de envío (Andreani y Via Cargo).

## Qué se hizo (sesión 2026-07-10/11)

1. El usuario agregó a mano ~20 carpetas nuevas en `CATALOGO/` entre sesiones: 10 modelos de Botas (Ambar, Aquila, Ares, Chester, Drako, Greta, Kenzo, Magna, Milano, Pantu Lupe) y una categoría nueva `ZAPATILLAS/` con Adidas Samba (8 variantes), Jordan (4 modelos) y New Balance (3 modelos).
2. Se arreglaron 3 bugs de `scripts/import-catalogo.mjs`: la categoría se adivinaba solo por el nombre de la carpeta hoja (Jordan/New Balance caían en "botas" por default) — ahora usa la ruta completa; "samba" y "zapatilla" se mezclaban en la misma categoría — ahora "samba" es su categoría propia; la raíz de `CATALOGO/` podía tratarse como si fuera un producto si tenía fotos sueltas.
3. Se corrió el importador: 219 fotos subidas a Supabase Storage, 22 productos nuevos mergeados a mano en `lib/products.ts` (con review de nombres/categorías, evitando duplicar los 5 productos ya existentes).
4. **Bug importante arreglado**: borrar un producto desde el admin no persistía al recargar la página. Causa: `lib/products-store.ts` siempre partía del array hardcodeado de `lib/products.ts` y "resucitaba" cualquier producto borrado que siguiera en el seed. Fix: se agregó un set de ids borrados en localStorage (`sd_deleted_product_ids`) que se filtra en `getProducts()`.
5. Se sacaron del código fuente (no solo del localStorage) los 12 productos de prueba con fotos de Unsplash: 4 Botas genéricas, 2 Borcegos, Samba Style Beige, Chunky Platform, Nike Dunk SB, Adidas Campus, y 2 de Encargo genérico. **Importante**: borrar un producto desde el admin solo lo esconde en el navegador de quien lo borró (vía el fix del punto 4) — para sacarlo del sitio para todo el mundo hay que sacarlo de `lib/products.ts` directamente.
6. Jordan y New Balance (7 productos) se recategorizaron de "zapatillas" genérico a "importados" (son marcas importadas, y la categoría Importados se había quedado sin ningún producto real). El banner de esa categoría (`components/category-banners.tsx`) ahora usa una foto real (Jordan High Top) en vez de la de Unsplash.
7. Se marcaron 4 productos reales como `featured: true` (Botas Caro, Zapatillas Samba Spezial, Jordan High Top, New Balance 9060) para que la sección "Destacados" del home no quede vacía.
8. Limpieza en `CATALOGO/`: duplicados exactos de fotos en Botas Magna borrados (verificados por checksum), `.gitignore` para `CATALOGO.rar` (backup, no se commitea) y para `PLANILLA DE PEDIDOS.xlsx` (archivo interno del usuario, sin relación con el sitio, nunca se subió a git).
9. A pedido del usuario se subieron a git también las fotos y videos fuente de `CATALOGO/` (antes los videos estaban excluidos por peso) — el repo pesa ~300MB ahora por esto.

## Categorías sin productos reales

`Borcegos` y `Por Encargo` quedaron con **cero productos** después de sacar los de prueba (nunca hubo fotos reales para esas categorías). Los tabs de filtro siguen apareciendo en la tienda pero muestran la grilla vacía. No es un bug — falta que el usuario consiga fotos propias para esas categorías o decida sacar los tabs.

## Pendiente / próximos pasos

- **Completar precio, categoría y talles reales** de los 34 productos activos (todos siguen en $0 excepto que se carguen a mano desde el admin) — es el pendiente más grande.
- Conseguir fotos propias para **Borcegos** y **Por Encargo** (o decidir si esas categorías se ocultan hasta tener stock).
- **Fotos del proveedor "Precios Miami Surtido"** (Drive externo): el usuario baja manualmente lo que quiera vender a `CATALOGO/`.
- **Seguridad**: el bucket de Supabase Storage tiene escritura pública porque el admin no tiene autenticación real (solo password hardcodeada en el cliente).
- Arquitectura: productos/categorías/pedidos siguen en `localStorage` del navegador (con el fix de deleted-ids del punto 4 de arriba) — funciona pero no persiste entre navegadores/dispositivos. Migrar a tablas Postgres de Supabase es el paso lógico si el catálogo sigue creciendo.
- Si el repo sigue sumando videos pesados, evaluar Git LFS (ver warning de GitHub arriba).
- `components/folder-importer.tsx` (importador desde el admin, en el navegador) tiene los mismos bugs que tenía el script Node antes de esta sesión (no adivina categoría, no convierte HEIC) — no se tocó, se sigue usando `scripts/import-catalogo.mjs` como camino confiable para cargas masivas.

## Cómo prefiere trabajar el usuario

- Ir de a partes, no todo en una tanda gigante — avisar y verificar en localhost entre pasos grandes.
- No comitear/pushear sin que lo pida explícitamente, pero cuando lo pide, hacerlo sin re-preguntar.
- **No borrar/mover archivos sin autorización explícita**, ni siquiera si parecen sueltos o de origen dudoso — en esta sesión se borraron 2 fotos (portada + referencia de talles) asumiendo que eran de prueba y no lo eran. El usuario lo remarcó fuerte: confirmar antes de borrar, no asumir.
