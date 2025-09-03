import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path from configuration
const DB_PATH = config.database.absolutePath;
const DATA_DIR = dirname(DB_PATH);

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('📁 Created data directory:', DATA_DIR);
}

// SQLite connection instance
let db = null;

/**
 * Get or create SQLite database connection
 * @returns {sqlite3.Database}
 */
export function getDatabase() {
    if (!db) {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ Error opening database:', err.message);
                throw err;
            }
            if (config.logging.sqlQueries) {
                console.log('🗄️  Connected to SQLite database at:', DB_PATH);
            }
        });

        // Configure SQLite based on environment variables
        db.serialize(() => {
            if (config.database.foreignKeys) {
                db.run("PRAGMA foreign_keys = ON");
            }
            if (config.database.walMode) {
                db.run("PRAGMA journal_mode = WAL");
            }
            
            // Additional pragmas for better performance
            db.run("PRAGMA synchronous = NORMAL");
            db.run("PRAGMA cache_size = 1000");
            db.run("PRAGMA temp_store = MEMORY");
        });
    }
    return db;
}

/**
 * Close database connection
 */
export function closeDatabase() {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
        db = null;
    }
}

/**
 * Run a SQL query with parameters
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>}
 */
export function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        const database = getDatabase();
        
        if (config.logging.sqlQueries) {
            console.log('🔍 SQL Query:', sql, 'Params:', params);
        }
        
        database.run(sql, params, function(err) {
            if (err) {
                console.error('❌ SQL Error:', err.message);
                console.error('Query:', sql);
                console.error('Params:', params);
                reject(err);
            } else {
                if (config.logging.sqlQueries) {
                    console.log('✅ Query executed, changes:', this.changes, 'lastID:', this.lastID);
                }
                resolve({ 
                    lastID: this.lastID, 
                    changes: this.changes 
                });
            }
        });
    });
}

/**
 * Get single row from query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>}
 */
export function getOne(sql, params = []) {
    return new Promise((resolve, reject) => {
        const database = getDatabase();
        
        if (config.logging.sqlQueries) {
            console.log('🔍 SQL Query (getOne):', sql, 'Params:', params);
        }
        
        database.get(sql, params, (err, row) => {
            if (err) {
                console.error('❌ SQL Error (getOne):', err.message);
                console.error('Query:', sql);
                console.error('Params:', params);
                reject(err);
            } else {
                if (config.logging.sqlQueries) {
                    console.log('✅ Query executed (getOne), found:', !!row);
                }
                resolve(row || null);
            }
        });
    });
}

/**
 * Get all rows from query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>}
 */
export function getAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        const database = getDatabase();
        
        if (config.logging.sqlQueries) {
            console.log('🔍 SQL Query (getAll):', sql, 'Params:', params);
        }
        
        database.all(sql, params, (err, rows) => {
            if (err) {
                console.error('❌ SQL Error (getAll):', err.message);
                console.error('Query:', sql);
                console.error('Params:', params);
                reject(err);
            } else {
                if (config.logging.sqlQueries) {
                    console.log('✅ Query executed (getAll), rows:', rows?.length || 0);
                }
                resolve(rows || []);
            }
        });
    });
}