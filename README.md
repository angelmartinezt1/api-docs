# API Documentation System

Internal microservices documentation system for enterprise SaaS development teams.

## Requirements

- Node.js 20+
- SQLite (included)

## Installation

```bash
git clone <repo>
cd api-docs
npm install
```

## Database Setup

```bash
# Run migrations
npm run migrate

# Add sample data (optional)
npm run seed
```

## Running

```bash
# Development
npm run dev

# Production
npm start
```

## Access

- **Admin Panel**: `http://localhost:3000/admin`
- **Public Catalog**: `http://localhost:3000`
- **API**: `http://localhost:3000/api`

## API Endpoints

### Microservices
- `GET /api/microservices` - List all (filters: q, api_type, status, tags)
- `POST /api/microservices` - Create + upload JSON spec
- `GET /api/microservices/:id` - Get details
- `PUT /api/microservices/:id` - Update metadata
- `PUT /api/microservices/:id/spec` - Replace JSON spec
- `DELETE /api/microservices/:id` - Deprecate service

### Files
- `GET /specs/:filename` - Download JSON specification
- `GET /health` - System health check

## Response Format

```json
{
  "ok": true,
  "message": "Success message",
  "data": {}
}
```

## API Types

- **Admin** - Administrative services
- **Portal** - User-facing portal APIs  
- **Webhook** - Webhook endpoints
- **Integraciones** - Third-party integrations
