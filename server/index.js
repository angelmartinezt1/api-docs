import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { runQuery, getDatabase, closeDatabase } from './db.js';
import microservicesRouter from './routes/microservices.js';
import { errorHandler, notFoundHandler, attachResponseHelpers } from './lib/errorHandler.js';
import config, { validateConfig, logConfig } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate configuration on startup
try {
    validateConfig();
    if (config.development.devMode) {
        logConfig();
    }
} catch (error) {
    console.error('❌ Configuration Error:', error.message);
    process.exit(1);
}

const app = express();

// Middleware
app.use(cors({
    origin: config.cors.origins,
    credentials: config.cors.credentials
}));
app.use(express.json({ 
    limit: `${Math.round(config.upload.maxFileSize / 1024 / 1024)}mb` 
}));
app.use(attachResponseHelpers);

// Serve static files for specs
app.use('/specs', express.static(config.static.absoluteSpecsPath));

// API routes
app.use('/api/microservices', microservicesRouter);

// Serve frontend static files
app.use('/admin', express.static(config.static.absoluteAdminPath));
app.use('/docs', express.static(config.static.absoluteDocsPath));
app.use('/', express.static(config.static.absoluteFrontPath));

/**
 * Run database migrations
 */
async function runMigrations() {
    if (!config.migrations.autoMigrate) {
        console.log('🔄 Auto-migration disabled, skipping migrations');
        return;
    }
    
    console.log('🔄 Running database migrations...');
    
    const migrationsDir = config.migrations.absolutePath;
    
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
            
            const migrationPath = join(config.migrations.absolutePath, file);
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
        const specsExists = fs.existsSync(config.static.absoluteSpecsPath);
        
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
        // Ensure required directories exist
        if (!fs.existsSync(config.static.absoluteSpecsPath)) {
            fs.mkdirSync(config.static.absoluteSpecsPath, { recursive: true });
            console.log(`📁 Created specs directory: ${config.static.absoluteSpecsPath}`);
        }
        
        // Run migrations first
        await runMigrations();
        
        // Start Express server
        app.listen(config.server.port, config.server.host, () => {
            console.log(`🚀 Server running on http://${config.server.host}:${config.server.port}`);
            console.log(`📊 Admin panel: http://${config.server.host}:${config.server.port}/admin`);
            console.log(`📖 Public catalog: http://${config.server.host}:${config.server.port}`);
            console.log(`🔍 Docs renderer: http://${config.server.host}:${config.server.port}/docs`);
            console.log(`❤️  Health check: http://${config.server.host}:${config.server.port}/health`);
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

// Export app for Lambda usage
export default app;

// Start the application only if not in Lambda environment
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
    startServer();
}