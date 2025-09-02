import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const DB_PATH = join(__dirname, '..', 'data', 'docs.db');
const DATA_DIR = join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('Created data directory:', DATA_DIR);
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
                console.error('Error opening database:', err.message);
                throw err;
            }
            console.log('Connected to SQLite database at:', DB_PATH);
        });

        // Enable foreign keys and WAL mode for better performance
        db.serialize(() => {
            db.run("PRAGMA foreign_keys = ON");
            db.run("PRAGMA journal_mode = WAL");
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
        database.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
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
        database.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
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
        database.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows || []);
            }
        });
    });
}