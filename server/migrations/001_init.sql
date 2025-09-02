-- Migration 001: Initialize microservices table
-- Compatible with SQLite

CREATE TABLE microservices (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    owner_dev_name TEXT NOT NULL,
    api_type TEXT NOT NULL,
    version TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    spec_filename TEXT NOT NULL,
    tags TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    -- Constraints
    CHECK(api_type IN ('Admin','Portal','Webhook','Integraciones')),
    CHECK(status IN ('draft','active','deprecated'))
);

-- Indexes for performance
CREATE INDEX idx_microservices_api_type ON microservices(api_type);
CREATE INDEX idx_microservices_status ON microservices(status);
CREATE INDEX idx_microservices_updated_at ON microservices(updated_at DESC);
CREATE INDEX idx_microservices_name ON microservices(name);

-- Combined index for common queries (filtering by api_type and status)
CREATE INDEX idx_microservices_type_status ON microservices(api_type, status);