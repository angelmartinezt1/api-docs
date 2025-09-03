import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { runQuery, getDatabase, closeDatabase } from './db.js';
import microservicesRouter from './routes/microservices.js';
import { errorHandler, notFoundHandler, attachResponseHelpers } from './lib/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for JSON uploads
app.use(attachResponseHelpers);

// Serve static files for specs
app.use('/specs', express.static(join(__dirname, 'storage', 'specs')));

// API routes
app.use('/api/microservices', microservicesRouter);

// Serve frontend static files
app.use('/admin', express.static(join(__dirname, '..', 'public-admin')));
app.use('/docs', express.static(join(__dirname, '..', 'docs')));
app.use('/', express.static(join(__dirname, '..', 'public-front')));

/**
 * Run database migrations
 */
async function runMigrations() {
    console.log('🔄 Running database migrations...');
    
    const migrationsDir = join(__dirname, 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
        console.log('No migrations directory found. Skipping migrations.');
        return;
    }

    try {
        // Get all .sql files and sort them lexicographically
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        if (files.length === 0) {
            console.log('No migration files found.');
            return;
        }

        // Create migrations tracking table if it doesn't exist
        await runQuery(`
            CREATE TABLE IF NOT EXISTS migrations (
                filename TEXT PRIMARY KEY,
                executed_at TEXT NOT NULL
            )
        `);

        // Check which migrations have already been run
        const executedMigrations = await new Promise((resolve, reject) => {
            getDatabase().all('SELECT filename FROM migrations', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(row => row.filename));
            });
        });

        // Run pending migrations
        let migrationsRun = 0;
        for (const file of files) {
            if (executedMigrations.includes(file)) {
                console.log(`⏭️  Migration ${file} already executed, skipping`);
                continue;
            }

            console.log(`🚀 Executing migration: ${file}`);
            
            const migrationPath = join(migrationsDir, file);
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
            
            // Split by semicolon and execute each statement
            const statements = migrationSQL
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);

            for (const statement of statements) {
                await runQuery(statement);
            }

            // Mark migration as executed
            await runQuery(
                'INSERT INTO migrations (filename, executed_at) VALUES (?, ?)',
                [file, new Date().toISOString()]
            );

            migrationsRun++;
            console.log(`✅ Migration ${file} completed`);
        }

        if (migrationsRun > 0) {
            console.log(`🎉 Successfully executed ${migrationsRun} migration(s)`);
        } else {
            console.log('✅ All migrations are up to date');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

/**
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
    try {
        // Check database connection
        await runQuery('SELECT 1');
        
        // Check if specs directory exists
        const specsDir = join(__dirname, 'storage', 'specs');
        const specsExists = fs.existsSync(specsDir);
        
        res.success('System healthy', {
            database: 'connected',
            specsDirectory: specsExists ? 'exists' : 'missing',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.error('Health check failed', 500, { error: error.message });
    }
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start server
 */
async function startServer() {
    try {
        // Run migrations first
        await runMigrations();
        
        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
            console.log(`📖 Public catalog: http://localhost:${PORT}`);
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Gracefully shutting down...');
            closeDatabase();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Start the application
startServer();