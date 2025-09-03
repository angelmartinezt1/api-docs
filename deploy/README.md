# Deployment Guide - SST.dev on AWS CloudFront

Este proyecto utiliza **SST.dev (Serverless Stack)** para desplegar las interfaces estáticas en AWS CloudFront.

## Configuración Inicial

### 1. Prerrequisitos

- **Node.js 20+** instalado
- **AWS CLI** configurado con las credenciales apropiadas
- **SST CLI** (se instala automáticamente con npm)

### 2. Configurar AWS CLI

```bash
aws configure
# Ingresa tu AWS Access Key ID
# Ingresa tu AWS Secret Access Key  
# Región por defecto: us-east-1 (recomendado para CloudFront)
# Formato de salida: json
```

### 3. Variables de Entorno (Opcional)

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Opcional: sobrescribir configuraciones por defecto
AWS_REGION=us-east-1
DOMAIN_PREFIX=api-docs.tudominio.com
```

## Estructura de Deployment

El proyecto despliega **3 distribuciones CloudFront separadas** con subdominios automáticos:

### 🔧 AdminPanel
- **Carpeta**: `public-admin/`
- **URL automática**: `https://d1234567890abc.cloudfront.net` (ejemplo)
- **Propósito**: Panel de administración CRUD para microservicios

### 📚 FrontCatalog  
- **Carpeta**: `public-front/`
- **URL automática**: `https://d0987654321xyz.cloudfront.net` (ejemplo)
- **Propósito**: Catálogo público de APIs disponibles

### 📖 DocsRenderer
- **Carpeta**: `docs/`
- **URL automática**: `https://dabcdef123456.cloudfront.net` (ejemplo)
- **Propósito**: Renderizador dinámico de documentación API

**Nota**: Las URLs exactas se generan automáticamente por AWS y se mostrarán después del deployment.

## Comandos de Deployment

### Desarrollo
```bash
# Deploy al stage de desarrollo
npm run deploy

# Iniciar desarrollo con hot-reload (opcional)
npm run dev:sst
```

### Producción
```bash
# Deploy al stage de producción
npm run deploy:prod
```

### Otros Comandos
```bash
# Abrir consola web de SST
npm run console

# Remover infraestructura
npm run remove

# Remover infraestructura de producción
npm run remove -- --stage=production
```

## URLs CloudFront Automáticas

### ✅ Sin configuración de dominios necesaria

Las distribuciones CloudFront generan automáticamente URLs del formato:
- `https://d[ID-ÚNICO].cloudfront.net`

**Ventajas**:
- ✅ **Cero configuración** - Deploy inmediato
- ✅ **SSL gratuito** incluido
- ✅ **CDN global** automático  
- ✅ **Sin costos de dominio**
- ✅ **Funciona inmediatamente**

### Si quieres dominios personalizados más adelante

1. **Editar `sst.config.ts`** y agregar:
```typescript
domain: {
  name: $interpolate`admin-${$app.stage}.tu-dominio.com`,
  aliases: $app.stage === "production" ? ["admin.tu-dominio.com"] : [],
}
```

2. **Configurar SSL en AWS Certificate Manager** (us-east-1)
3. **Configurar DNS** para apuntar a CloudFront

## Costos Estimados AWS

### CloudFront (3 distribuciones)
- **Costo base**: ~$0.60/mes por distribución
- **Transferencia de datos**: $0.085/GB (primeros 10TB)
- **Requests**: $0.0075/10,000 requests

### Estimación mensual (uso moderado):
- **3 distribuciones CloudFront**: ~$2-5/mes
- **Transferencia (~1GB/mes)**: ~$0.25/mes
- **Total estimado**: ~$3-6/mes

## Características del Deployment

### ✅ Auto-scaling
- CloudFront maneja tráfico automáticamente
- Sin preocupación por límites de concurrencia

### ✅ Cache Global
- Red de CDN global de AWS
- Latencia mínima para usuarios finales

### ✅ SSL/TLS
- Certificados SSL automáticos
- HTTPS por defecto

### ✅ Rollback Fácil
- Versiones independientes por stage
- Rollback con `sst remove` y re-deploy

### ✅ Monitoreo
- CloudWatch logs integrados
- Métricas de performance incluidas

## Troubleshooting

### Error: "Domain already in use"
```bash
# Verificar distribuciones existentes
aws cloudfront list-distributions

# Remover stack anterior si es necesario
npm run remove
```

### Error: "Certificate not found"
```bash
# Verificar certificados SSL en us-east-1
aws acm list-certificates --region us-east-1
```

### Error: "Permission denied"
```bash
# Verificar permisos AWS
aws sts get-caller-identity

# Verificar políticas IAM necesarias para CloudFront
```

## Estructura Post-Deployment

```
AWS Resources Created:
├── S3 Buckets (3)
│   ├── sst-api-docs-adminpanel-*
│   ├── sst-api-docs-frontcatalog-*
│   └── sst-api-docs-docsrenderer-*
├── CloudFront Distributions (3)
│   ├── AdminPanel Distribution
│   ├── FrontCatalog Distribution  
│   └── DocsRenderer Distribution
└── Route53 Records (if using custom domains)
```

## Next Steps

1. **Configurar tus dominios reales** en `sst.config.ts`
2. **Crear certificados SSL** en AWS Certificate Manager
3. **Deploy a producción** con `npm run deploy:prod`
4. **Configurar CI/CD** (GitHub Actions, etc.) para auto-deploy