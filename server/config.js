/**
 * Server Configuration
 * Centralized configuration using environment variables
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to parse boolean from string
const parseBoolean = (value, defaultValue = false) => {
    if (value === undefined || value === null) return defaultValue;
    return value.toLowerCase() === 'true';
};

// Helper function to parse number from string  
const parseNumber = (value, defaultValue) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

// Helper function to parse array from comma-separated string
const parseArray = (value, defaultValue = []) => {
    if (!value) return defaultValue;
    return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
};

const config = {
    // =============================================================================
    // SERVER CONFIGURATION
    // =============================================================================
    server: {
        port: parseNumber(process.env.PORT, 3002),
        host: process.env.HOST || 'localhost',
        nodeEnv: process.env.NODE_ENV || 'development',
        isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
        isProduction: (process.env.NODE_ENV || 'development') === 'production'
    },

    // =============================================================================
    // DATABASE CONFIGURATION
    // =============================================================================
    database: {
        path: process.env.DB_PATH || './data/database.sqlite',
        absolutePath: join(__dirname, process.env.DB_PATH || './data/database.sqlite'),
        walMode: parseBoolean(process.env.DB_WAL_MODE, true),
        foreignKeys: parseBoolean(process.env.DB_FOREIGN_KEYS, true)
    },

    // =============================================================================
    // FILE UPLOAD CONFIGURATION
    // =============================================================================
    upload: {
        maxFileSize: parseNumber(process.env.MAX_FILE_SIZE, 10 * 1024 * 1024), // 10MB default
        storagePath: process.env.STORAGE_PATH || './storage/specs',
        absoluteStoragePath: join(__dirname, process.env.STORAGE_PATH || './storage/specs'),
        allowedExtensions: parseArray(process.env.ALLOWED_EXTENSIONS, ['.json'])
    },

    // =============================================================================
    // CORS CONFIGURATION
    // =============================================================================
    cors: {
        origins: parseArray(process.env.CORS_ORIGINS, ['http://localhost:3002']),
        credentials: parseBoolean(process.env.CORS_CREDENTIALS, true)
    },

    // =============================================================================
    // STATIC FILES CONFIGURATION
    // =============================================================================
    static: {
        adminPath: process.env.STATIC_ADMIN_PATH || '../public-admin',
        frontPath: process.env.STATIC_FRONT_PATH || '../public-front',
        docsPath: process.env.STATIC_DOCS_PATH || '../docs',
        specsPath: process.env.STATIC_SPECS_PATH || './storage/specs',
        absoluteAdminPath: join(__dirname, process.env.STATIC_ADMIN_PATH || '../public-admin'),
        absoluteFrontPath: join(__dirname, process.env.STATIC_FRONT_PATH || '../public-front'),
        absoluteDocsPath: join(__dirname, process.env.STATIC_DOCS_PATH || '../docs'),
        absoluteSpecsPath: join(__dirname, process.env.STATIC_SPECS_PATH || './storage/specs')
    },

    // =============================================================================
    // LOGGING CONFIGURATION
    // =============================================================================
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        requests: parseBoolean(process.env.LOG_REQUESTS, true),
        sqlQueries: parseBoolean(process.env.LOG_SQL_QUERIES, false)
    },

    // =============================================================================
    // MIGRATION CONFIGURATION
    // =============================================================================
    migrations: {
        path: process.env.MIGRATIONS_PATH || './migrations',
        absolutePath: join(__dirname, process.env.MIGRATIONS_PATH || './migrations'),
        autoMigrate: parseBoolean(process.env.AUTO_MIGRATE, true)
    },

    // =============================================================================
    // DEVELOPMENT CONFIGURATION
    // =============================================================================
    development: {
        devMode: parseBoolean(process.env.DEV_MODE, true),
        hotReload: parseBoolean(process.env.HOT_RELOAD, false),
        detailedErrors: parseBoolean(process.env.DETAILED_ERRORS, true)
    }
};

// Validation function
export function validateConfig() {
    const errors = [];

    // Check required configurations
    if (!config.server.port || config.server.port < 1 || config.server.port > 65535) {
        errors.push('PORT must be a valid port number (1-65535)');
    }

    if (config.upload.maxFileSize <= 0) {
        errors.push('MAX_FILE_SIZE must be a positive number');
    }

    if (config.upload.allowedExtensions.length === 0) {
        errors.push('ALLOWED_EXTENSIONS must contain at least one extension');
    }

    if (config.cors.origins.length === 0) {
        errors.push('CORS_ORIGINS must contain at least one origin');
    }

    if (errors.length > 0) {
        throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }

    return true;
}

// Log current configuration (without sensitive data)
export function logConfig() {
    console.log('📋 Server Configuration:');
    console.log(`   Port: ${config.server.port}`);
    console.log(`   Environment: ${config.server.nodeEnv}`);
    console.log(`   Database: ${config.database.path}`);
    console.log(`   Max File Size: ${(config.upload.maxFileSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   CORS Origins: ${config.cors.origins.join(', ')}`);
    console.log(`   Auto Migration: ${config.migrations.autoMigrate ? 'enabled' : 'disabled'}`);
}

export default config;