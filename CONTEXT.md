# Contexto de sesión — Santa Diabla

> Nota para Claude: este archivo es un punto de partida para retomar el trabajo. Leelo primero, después verificá el estado real del proyecto (git log, git status, npm run dev) antes de asumir que algo sigue igual — pueden haber pasado cambios manuales del usuario entre sesiones.

## Cómo arrancar

```bash
cd "C:\Users\Administrador\Desktop\SANTA DIABLA\WEB"
npm run dev
```

- Sitio: http://localhost:3000
- Admin: http://localhost:3000/admin/login — la contraseña la tiene el usuario (no se documenta acá por ser un repo público)

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

## Qué se hizo (sesión 2026-07-20/21)

1. **Precios reales cargados desde el catálogo de WhatsApp Business** (`wa.me/c/5493456623935`): se relevó el catálogo completo y se cruzó contra la tabla `products` de Supabase. 13 productos existentes recibieron precio real + descripción de venta (Wanda, Pantu Lupe, Caro, Drako, Kenzo, Magna, Jordan Retro, Jordan Travis Low, New Balance 530/9060, Samba Chocolate/Classic/Nat-Cherry). Se dieron de alta 3 productos que estaban en WhatsApp pero no en la web: Karter ($50.000), Botas Nepal ($50.000), Botas Sira ($62.500) — sin foto todavía (el usuario las sube desde el admin).
2. **35 productos nuevos** cargados desde un Google Drive del usuario ("Pretemporada '26", carpeta compartida con 44 subcarpetas de modelos de botas) — sin precio ni foto todavía, y marcados `active: false` para que se vean "Agotado" y no comprables a $0. 9 de las 44 carpetas ya eran productos existentes (Ambar, Aquila, Ares, Chester, Drako, Greta, Lupe, Magna, Milano) y no se duplicaron. **Ojo**: "Toscana" aparece 2 veces en el Drive (dos carpetas con el mismo nombre, seguramente colores distintos) — se cargó como "Toscana" y "Toscana II", falta confirmar con el usuario cuál es cuál.
3. **Fix de integridad**: los 14 productos que ya estaban en $0 (nunca tuvieron match en WhatsApp: Ambar, Aquila, Ares, Chester, Greta, Milano, Jordan High Top, Jordan Low, New Balance Nat-Print, Samba Blanco-Café/Cherry/Beige-Caramelo/Nat-Beige/Spezial) se pasaron a `active: false` — antes se mostraban en la tienda como comprables a precio $0, ahora dicen "Agotado" hasta que se les cargue precio real.
4. **Admin login roto, arreglado**: no existía ningún usuario en Supabase Auth desde la migración (`bc63051`) — por eso ninguna contraseña andaba. Se creó el usuario admin directo por SQL (`auth.users` + `auth.identities` con `pgcrypto`) con el email/clave que dio el usuario.
5. **Rate limiting básico**: `middleware.ts` nuevo (in-memory, sin dependencias externas) limita `/admin`, `/admin/login` y `/api/instagram` a N requests/minuto por IP. **Importante**: el login de admin llama a Supabase Auth directo desde el navegador, no pasa por nuestro servidor — así que este middleware no frena fuerza bruta de contraseña en sí, solo protege nuestras rutas propias. Para eso hay que subir el rate limit de Auth desde el dashboard de Supabase (Authentication → Rate Limits), pendiente de que lo haga el usuario.
6. Se sacó `app/api/instagram/debug/route.ts` — ruta pública sin uso que filtraba parte del token de Instagram.
7. **Galería de fotos por producto**: `components/product-card.tsx` ahora abre un lightbox (click en la foto) que recorre `product.gallery` — campo que ya existía en la base pero no se renderizaba en ningún lado. Precarga las fotos al abrir para que no haya demora entre una y otra. Placeholder "Foto proximamente" para productos sin `image` (en vez de romper con `<img src="">` vacío) — mismo fix en `cart-drawer.tsx`.
8. **`components/category-banners.tsx` rediseñado dos veces**: primero se convirtió en carrusel automático (como el Hero), después a pedido del usuario se sacó el carrusel y quedó como grilla estática 2x2/4 columnas "Elegí tu categoría" (sin autoplay, solo hover-zoom).
9. **Selección de color obligatoria antes de comprar**: ya estaba implementado (`hasColors = product.colors.length > 1` bloquea el CTA sin color elegido, igual que el talle) — no hizo falta tocar código, solo confirmarlo. Se activa solo en cuanto un producto tenga más de 1 color cargado.
10. **Investigación de competencia** (agente de research, sin tocar código): comparó Trip Store, MYR Sneakers, REAH Company y Paruolo (sitios argentinos reales) contra el sitio. Quick wins pendientes: buscador, wishlist con localStorage, guía de talles, contenido de autenticidad (fotos/videos reales de pedidos enviados). Medio esfuerzo: filtros/orden reales en el catálogo, páginas de detalle de producto por SKU (hoy todo es una sola página, no indexable en Google por modelo), campo de "calza chico/normal/grande". Detalle completo en el historial de chat, no en un archivo — pedirle al usuario si lo quiere por escrito.
11. **Brief de estilo portable**: `../ESTILO-PARA-OTRA-TIENDA.md` (fuera de este repo, en `SANTA DIABLA/` a nivel raíz) — documento para pegarle a otro Claude en otra PC/cuenta y replicar el diseño visual (tokens, Tailwind config, componentes clave) en otro proyecto del usuario, sin tocar contenido de Santa Diabla.

### Pendiente urgente de esta sesión (sin terminar)

- **Fotos de "Pretemporada '26"**: el usuario va a descargar manualmente las 44 carpetas (con subcarpetas por color adentro, ej. Airón → Choco/Fotos nuevas/Negro) y dejarlas dentro de `CATALOGO/`. Falta: ordenarlas, subirlas a Supabase Storage (reusar `scripts/import-catalogo.mjs`), linkear `image`/`gallery` a cada uno de los 35 productos nuevos por nombre de carpeta, cargar el array `colors` según las subcarpetas de color, y poner `active: true` una vez tengan foto (aunque sigan sin precio, a criterio del usuario). La descarga automática por navegador (Claude in Chrome) **no funcionó** — los clicks sintéticos no disparan la descarga real en Chrome (probado con 44 carpetas y con 1 sola), así que quedó en manos del usuario.
- **14 + 35 = 49 productos activos en `active:false`** esperando precio y/o foto real.
- Confirmar cuál "Toscana" es cuál (ver punto 2 de arriba).

## Categorías sin productos reales

`Borcegos` y `Por Encargo` quedaron con **cero productos** después de sacar los de prueba (nunca hubo fotos reales para esas categorías). Los tabs de filtro siguen apareciendo en la tienda pero muestran la grilla vacía. No es un bug — falta que el usuario consiga fotos propias para esas categorías o decida sacar los tabs.

## Pendiente / próximos pasos

- **Fotos de "Pretemporada '26"** (ver sesión 2026-07-20/21 arriba) — es el pendiente más grande ahora mismo, en curso.
- **Completar precio real** de los 14+35=49 productos que quedaron en `active:false` sin precio/foto.
- Confirmar cuál "Toscana" / "Toscana II" es cuál.
- Conseguir fotos propias para **Borcegos** y **Por Encargo** (o decidir si esas categorías se ocultan hasta tener stock). Tampoco hay productos reales en la categoría genérica "Zapatillas" (todo lo importado quedó bajo "Importados").
- **Subir el rate limit de Supabase Auth** desde el dashboard (Authentication → Rate Limits) — el middleware nuevo no alcanza para eso, ver sesión 2026-07-20/21.
- **Seguridad**: el bucket de Supabase Storage tiene escritura pública (RLS de `products`/`categories` es admin-only para escritura, pero Storage no está confirmado) — revisar si hace falta atar el bucket a auth también.
- Arquitectura: productos/categorías/pedidos ya migraron a Supabase (commit `bc63051`), esto de acá abajo quedó obsoleto respecto a versiones viejas de este archivo — no está en localStorage.
- Si el repo sigue sumando videos pesados, evaluar Git LFS (ver warning de GitHub arriba).
- `components/folder-importer.tsx` (importador desde el admin, en el navegador) tiene los mismos bugs que tenía el script Node antes de esta sesión (no adivina categoría, no convierte HEIC) — no se tocó, se sigue usando `scripts/import-catalogo.mjs` como camino confiable para cargas masivas.
- Quick wins de diseño/UX pendientes de evaluar con el usuario (ver punto 10 de la sesión 2026-07-20/21): buscador, wishlist, guía de talles, filtros/orden en catálogo, páginas de detalle de producto.

## Cómo prefiere trabajar el usuario

- Ir de a partes, no todo en una tanda gigante — avisar y verificar en localhost entre pasos grandes.
- **Confirmó explícitamente (2026-07-21) que quiere que se comitee y pushee a medida que se avanza por etapas**, "para no perder" el trabajo — no esperar a que junte todo antes de preguntar. Sigue aplicando: no commitear cambios que no son propios de la tarea (ej. archivos sueltos de `CATALOGO/` que el usuario mueve por su cuenta).
- **No borrar/mover archivos sin autorización explícita**, ni siquiera si parecen sueltos o de origen dudoso — en esta sesión se borraron 2 fotos (portada + referencia de talles) asumiendo que eran de prueba y no lo eran. El usuario lo remarcó fuerte: confirmar antes de borrar, no asumir.
- No crear cuentas/contraseñas de admin pidiéndoselas por chat en texto plano si se puede evitar (generarla uno mismo y no pedirla) — aunque en la práctica el usuario prefirió dictar sus propias credenciales, y hay que respetar exactamente esas y no crear usuarios de más.
- Feedback directo recibido en esta sesión: pidió menos preguntas de aclaración encadenadas y más resolución decisiva — priorizar hacer el llamado razonable y avisar, en vez de frenar seguido a preguntar.
