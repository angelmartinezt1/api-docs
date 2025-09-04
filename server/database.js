/**
 * Database Connection Manager
 * Handles both MongoDB and SQLite connections based on configuration
 */

import mongoose from 'mongoose';
import config from './config.js';

// Import SQLite functions (fallback)
import { 
    getDatabase as getSQLiteDB, 
    closeDatabase as closeSQLiteDB,
    runQuery as runSQLiteQuery,
    getOne as getSQLiteOne,
    getAll as getSQLiteAll
} from './db.js';

// MongoDB connection instance
let mongoConnection = null;

/**
 * Initialize database connection based on configuration
 */
export async function initializeDatabase() {
    if (config.database.type === 'mongodb') {
        return await connectMongoDB();
    } else {
        return await connectSQLite();
    }
}

/**
 * Connect to MongoDB Atlas
 */
async function connectMongoDB() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        
        // Connection options
        const options = {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            bufferCommands: false, // Disable mongoose buffering
            bufferMaxEntries: 0 // Disable mongoose buffering
        };

        mongoConnection = await mongoose.connect(config.database.mongoUri, options);
        
        console.log('✅ MongoDB connected successfully');
        console.log(`📍 Connected to: ${mongoConnection.connection.name} database`);
        
        // Connection event listeners
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });
        
        return mongoConnection;
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        
        if (config.development.devMode) {
            console.log('🔄 Falling back to SQLite in development mode...');
            config.database.type = 'sqlite';
            return await connectSQLite();
        }
        
        throw error;
    }
}

/**
 * Connect to SQLite (fallback)
 */
async function connectSQLite() {
    console.log('🔌 Using SQLite database...');
    const db = getSQLiteDB();
    console.log('✅ SQLite connected successfully');
    return db;
}

/**
 * Close database connection
 */
export async function closeDatabase() {
    if (config.database.type === 'mongodb' && mongoConnection) {
        await mongoose.connection.close();
        console.log('📪 MongoDB connection closed');
    } else {
        closeSQLiteDB();
    }
}

/**
 * Universal database query functions
 * These functions work with both MongoDB and SQLite
 */

// For MongoDB operations, use the models directly
// For SQLite operations, use the existing functions

export async function runQuery(sql, params = []) {
    if (config.database.type === 'mongodb') {
        throw new Error('Use MongoDB models instead of raw queries');
    }
    return runSQLiteQuery(sql, params);
}

export async function getOne(sql, params = []) {
    if (config.database.type === 'mongodb') {
        throw new Error('Use MongoDB models instead of raw queries');
    }
    return getSQLiteOne(sql, params);
}

export async function getAll(sql, params = []) {
    if (config.database.type === 'mongodb') {
        throw new Error('Use MongoDB models instead of raw queries');
    }
    return getSQLiteAll(sql, params);
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth() {
    try {
        if (config.database.type === 'mongodb') {
            // Simple ping to MongoDB
            await mongoose.connection.db.admin().ping();
            return {
                type: 'mongodb',
                status: 'connected',
                database: mongoose.connection.name,
                host: mongoose.connection.host
            };
        } else {
            // Simple query to SQLite
            await runSQLiteQuery('SELECT 1');
            return {
                type: 'sqlite',
                status: 'connected',
                path: config.database.absolutePath
            };
        }
    } catch (error) {
        return {
            type: config.database.type,
            status: 'error',
            error: error.message
        };
    }
}

/**
 * Get database type
 */
export function getDatabaseType() {
    return config.database.type;
}

/**
 * Check if using MongoDB
 */
export function isUsingMongoDB() {
    return config.database.type === 'mongodb';
}

/**
 * Check if using SQLite
 */
export function isUsingSQLite() {
    return config.database.type === 'sqlite';
}