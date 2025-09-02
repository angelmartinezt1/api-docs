# API Documentation Project

Node.js project with Express backend and vanilla JavaScript frontends.

## Structure

```
/server          - Express backend
  /migrations    - Database migration files
  /routes        - API route handlers
  /storage/specs - API specification storage
  db.js          - Database connection
  index.js       - Server entry point
/public-admin    - Admin panel frontend (vanilla JS)
/public-front    - Public frontend (vanilla JS)
```

## Setup

```bash
npm install
npm run dev  # Development with nodemon
npm start    # Production
```
