1) Modelo y validaciones (SQLite)

Tabla microservices (campos mínimos)

id (ulid/uuid string)

name (único, requerido, 3–60 chars)

description (requerido, 20–400 chars)

owner_dev_name (requerido)

api_type (uno de: Admin|Portal|Webhook|Integraciones)

version (semver opcional, p.ej. 1.0.0)

status (draft|active|deprecated) — default active

spec_filename (requerido; solo .json)

tags (opcional, csv: p0,external-facing)

created_at, updated_at (timestamps)

Reglas clave

name único.

api_type CHECK en SQLite: CHECK(api_type IN ('Admin','Portal','Webhook','Integraciones'))

status CHECK: CHECK(status IN ('draft','active','deprecated'))

Validar que el archivo subido sea JSON parseable y ≤ 5 MB.

spec_filename sigue convención (ver §4).

2) Catálogo de secciones (fijo)

Admin (backoffice merchant)

Portal (tienda pública)

Webhook (eventos salientes/entrantes)

Integraciones (partners/externos, ERP, pasarelas, etc.)

3) Flujo Backoffice (sin auth)

Listado con filtros: texto libre, api_type (4 opciones), status, tags.

Crear: completar formulario (abajo) + subir JSON → validar → guardar a /storage/specs/ + insert en DB.

Editar: metadatos y/o reemplazo de JSON (mismo filename si misma versión).

Cambios de estado: deprecated con motivo breve en description o tags.

Vista previa: botón que abre tu renderizador con URL /specs/{spec_filename}.

4) Convención de nombres para JSON

Formato: {api_type}-{service}-{version}-{YYYYMMDD}.json

Ejemplos:

Admin-orders-1.0.0-20250902.json

Webhook-payments-1.2.1-20250910.json

Reemplazo sin cambio de versión: mismo spec_filename.

Cambio de versión: nuevo spec_filename (histórico por archivos).

5) Flujo Front (lectura)

Home: menú lateral con las 4 secciones fijas.

Lista: tarjetas ordenadas por status (active primero) y name.

Detalle: metadatos + botón “Abrir documentación” (usa spec_filename).

6) Endpoints mínimos (ideas)

GET /api/microservices?q=&api_type=&status=&tags=

GET /api/microservices/:id

POST /api/microservices (metadata + upload JSON)

PUT /api/microservices/:id (metadata)

PUT /api/microservices/:id/spec (reemplazo JSON)

DELETE /api/microservices/:id (soft: status=deprecated)

Estáticos: GET /specs/:filename (sirve /storage/specs/)

7) Plantilla de formulario (ADMIN – copiar tal cual)

Nombre del microservicio (input text, único)

Descripción corta (140–200 caracteres) (textarea)

Responsable / Developer owner (input text)

Tipo de API (select: Admin | Portal | Webhook | Integraciones)

Versión (semver) (input text, ej. 1.0.0)

Estado (radio: draft | active | deprecated, default active)

Tags (coma separadas) (input text, placeholder: p0,external-facing,beta)

Archivo JSON de especificación (dropzone/input file, acepta .json)

Botones: Guardar | Cancelar

Mensajes UX:

Éxito: “Microservicio creado/actualizado.”

Error parseo JSON: “No se pudo parsear el JSON (línea X, columna Y).”

Duplicado: “Ya existe un microservicio con ese nombre.”

8) Plantilla de tarjeta (FRONT – copiar tal cual)

Header: name · Badge api_type

Body:

description (trunc 2–3 líneas)

Línea meta: owner_dev_name · version · status

Footer:

Botón Abrir documentación (link a /specs/{spec_filename})

Chips de tags (opcionales)

9) Filtros recomendados (FRONT)

Sección (tabs o sidebar): Admin | Portal | Webhook | Integraciones

Buscar: por name, description, tags, owner_dev_name

Estado: checkboxes active, draft, deprecated

Ordenar: name (A→Z), updated_at (recientes)

10) “Hecho” del MVP

 CHECK en SQLite para api_type y status.

 Validación de JSON al subir (parse + tamaño).

 Listado con filtros por api_type (4 fijos).

 Vista detalle + link al spec_filename.

 Carpeta /storage/specs/ servida como estática.