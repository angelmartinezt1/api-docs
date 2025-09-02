# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Internal microservices documentation system for an enterprise SaaS development team. Allows developers to register their microservice documentation via admin panel and provides a frontend catalog for browsing all services.

**Key Technologies:**
- Node.js 20 with Express backend
- Vanilla JavaScript frontends (no frameworks)
- SQLite database (`data/docs.db`)
- JSON specs stored in `/server/storage/specs/`

## Architecture

**Monorepo structure:**
- `/server` - Express backend with API routes
- `/public-admin` - Admin panel for CRUD operations
- `/public-front` - Read-only catalog frontend
- No authentication (internal network only)

## Database Schema

**Table: microservices**
- `id` (ulid/uuid string, PK)
- `name` (unique, required)
- `description`, `owner_dev_name`, `version`
- `api_type` (enum: Admin, Portal, Webhook, Integraciones)
- `status` (enum: draft, active, deprecated)
- `spec_filename` (JSON file in /storage/specs/)
- `tags` (comma-separated string)
- `created_at`, `updated_at`

## File Naming Convention

JSON specs follow: `{api_type}-{service}-{version}-{YYYYMMDD}.json`
Example: `Admin-orders-1.0.0-20250902.json`

## Key API Endpoints

- `GET /api/microservices` (with filters: q, api_type, status, tags)
- `POST /api/microservices` (create + JSON upload)
- `PUT /api/microservices/:id` (edit metadata)
- `PUT /api/microservices/:id/spec` (replace JSON)
- `DELETE /api/microservices/:id` (soft delete → deprecated)
- `GET /specs/:filename` (serve JSON files)
- `GET /health`

## Development Commands

```bash
npm run dev      # Development with nodemon
npm start        # Production server
npm run migrate  # Run database migrations
npm run seed     # Populate with test data
```

## Response Format

All API responses use: `{ ok: boolean, message: string, data?: any }`

## Validation Rules

- JSON upload max 5MB, must be valid JSON
- api_type restricted to 4 fixed values
- Filename auto-generated from metadata
- Strict input validation on all fields