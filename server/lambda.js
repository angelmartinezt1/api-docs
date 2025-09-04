/**
 * AWS Lambda handler for Express API
 * Wraps the Express app for serverless deployment using serverless-http
 */

import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';

console.log('Lambda starting up...');

const app = express();

// Basic middleware
app.use(cors({
    origin: '*',
    credentials: false
}));
app.use(express.json({ limit: '5mb' }));

// Simple health check endpoint
app.get('/health', (req, res) => {
    res.json({
        ok: true,
        message: 'Lambda API healthy',
        data: {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        }
    });
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({
        ok: true,
        message: 'Test endpoint working',
        data: {
            method: req.method,
            url: req.url,
            headers: req.headers
        }
    });
});

// Placeholder for microservices routes - will be loaded lazily
app.use('/api/microservices', (req, res, next) => {
    res.status(503).json({
        ok: false,
        message: 'Microservices API loading...',
        data: null
    });
});

// Basic error handling
app.use((err, req, res, next) => {
    console.error('Lambda error:', err);
    res.status(500).json({
        ok: false,
        message: 'Internal server error',
        data: { error: err.message }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        ok: false,
        message: `Route ${req.method} ${req.url} not found`,
        data: null
    });
});

// Create the serverless handler
const serverlessHandler = serverless(app, {
    binary: ['image/*', 'application/pdf']
});

// Simple wrapper handler
export const handler = async (event, context) => {
    console.log('Lambda handler invoked:', event.httpMethod, event.path);
    
    // Keep Lambda warm and reuse connections
    context.callbackWaitsForEmptyEventLoop = false;
    
    try {
        return await serverlessHandler(event, context);
    } catch (error) {
        console.error('Lambda handler error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                ok: false,
                message: 'Internal server error',
                data: { error: error.message }
            })
        };
    }
};