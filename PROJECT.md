Aquí tienes una **descripción completa del proyecto**, redactada como contexto para que cualquier IA de código (Claude Code, GitHub Copilot, Cursor, etc.) entienda lo que se necesita construir:

---

## 📌 Descripción del Proyecto: Minisistema de Documentación Interno

Estamos construyendo un **minisistema interno de documentación de microservicios** para un SaaS de clase empresarial (competencia de Shopify). El sistema será usado **exclusivamente por el equipo de desarrollo**, por lo que no tendrá autenticación en su primera versión (acceso solo en red interna).

### 🎯 Objetivo

Permitir que cada desarrollador registre la documentación de su microservicio en un **backoffice sencillo** (admin), subiendo un archivo JSON con la especificación de su API y completando algunos metadatos. En el **frontoffice (lectura)**, el equipo podrá explorar un catálogo navegable de todos los microservicios y acceder al archivo JSON para que otro sistema interno (ya existente) lo renderice como documentación completa.

### 🏗️ Arquitectura

* **Backend:** Node.js 20 con Express.
* **Frontend:** Vanilla JS + HTML/CSS (sin frameworks ni Next.js).
* **Base de datos:** SQLite (archivo local `data/docs.db`).
* **Almacenamiento de JSON:** Carpeta local `/server/storage/specs/` servida como estática.
* **Modo de ejecución:** proyecto monorepo simple con carpetas separadas para `/server`, `/public-admin`, `/public-front`.

### 📂 Estructura del Proyecto

```
/server
  /migrations         → scripts SQL de migraciones
  /routes             → routers de Express
  /storage/specs      → JSONs de documentación
  db.js               → conexión a SQLite
  index.js            → servidor Express
/public-admin         → front de administración
/public-front         → front de lectura
.gitignore
README.md
package.json
```

### 📑 Modelo de datos (tabla `microservices`)

* `id` (ulid/uuid string, PK)
* `name` (único, requerido)
* `description` (requerido)
* `owner_dev_name` (desarrollador responsable)
* `api_type` (catálogo fijo: **Admin, Portal, Webhook, Integraciones**)
* `version` (ej. `1.0.0`)
* `status` (enum: `draft`, `active`, `deprecated`, default `active`)
* `spec_filename` (nombre del archivo JSON en `/storage/specs/`)
* `tags` (string separada por comas)
* `created_at`, `updated_at` (timestamps ISO)

Restricciones:

* `CHECK(api_type IN ('Admin','Portal','Webhook','Integraciones'))`
* `CHECK(status IN ('draft','active','deprecated'))`

### 📂 Convención de nombres de archivos JSON

Cada archivo debe seguir el formato:

```
{api_type}-{service}-{version}-{YYYYMMDD}.json
```

Ejemplo:
`Admin-orders-1.0.0-20250902.json`

### 🖥️ Backoffice (Admin)

* Listado de microservicios con filtros (`q`, `api_type`, `status`, `tags`).
* Crear microservicio:

  * Campos: nombre, descripción, responsable, tipo de API, versión, estado, tags.
  * Subida de archivo JSON (validado con `JSON.parse`, máx 5 MB).
* Editar metadatos.
* Reemplazar JSON (mismo filename si no cambia la versión).
* Deprecar servicio (cambia `status=deprecated`).
* Vista previa: link al JSON servido.

### 📖 Frontoffice (Lectura)

* Menú lateral con las 4 secciones: **Admin | Portal | Webhook | Integraciones**.
* Grid de tarjetas por microservicio:

  * Nombre, descripción, responsable, versión, estado (badge).
* Botón “Ver documentación”: abre el JSON desde `/specs/{spec_filename}` (otro sistema lo renderiza).
* Ordenamiento: `status` activo primero, luego `name` ascendente.

### 📡 Endpoints principales (MVP)

* `GET /api/microservices` (listar + filtros)
* `GET /api/microservices/:id`
* `POST /api/microservices` (crear + subir JSON)
* `PUT /api/microservices/:id` (editar metadatos)
* `PUT /api/microservices/:id/spec` (reemplazar JSON)
* `DELETE /api/microservices/:id` (soft delete → deprecated)
* `GET /specs/:filename` (archivos JSON)
* `GET /health` (status de DB y carpeta specs)

### ✅ Criterios de Aceptación del MVP

1. Catálogo fijo de `api_type` (Admin, Portal, Webhook, Integraciones).
2. CRUD funcional con validaciones estrictas.
3. Subida de JSON válida (si falla parseo → error 400 + borrar archivo).
4. Admin sin auth, accesible solo en red interna.
5. Front de lectura con navegación por secciones y botón “Ver doc”.
6. Respuestas uniformes: `{ ok, message, data }`.
7. Scripts de NPM: `dev`, `start`, `migrate`, `seed`.


