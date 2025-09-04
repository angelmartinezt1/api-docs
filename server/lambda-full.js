/**
 * AWS Lambda handler for Express API
 * Full implementation with MongoDB support
 */

import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

console.log('Lambda starting up...');

// MongoDB connection
let isConnected = false;

async function connectToMongoDB() {
    if (isConnected) return;
    
    try {
        const mongoUri = process.env.MONGODB_URI || "mongodb+srv://angelmartinez:oawm3eMJ3QiM4VUE@cluster0.h3axpfx.mongodb.net/api-docs";
        
        await mongoose.connect(mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });
        
        isConnected = true;
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        throw error;
    }
}

// Simple Microservice Schema
const microserviceSchema = new mongoose.Schema({
    _id: String,
    name: { type: String, required: true },
    description: { type: String, required: true },
    api_type: { type: String, required: true, enum: ['Admin', 'Portal', 'Webhook', 'Integraciones'] },
    owner_dev_name: { type: String, required: true },
    version: { type: String, default: '1.0.0' },
    status: { type: String, default: 'draft', enum: ['draft', 'active', 'deprecated'] },
    tags: { type: String, default: '' },
    spec_filename: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { _id: false });

const Microservice = mongoose.model('Microservice', microserviceSchema);

// Express app
const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: false
}));
app.use(express.json({ limit: '5mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        ok: true,
        message: 'Lambda API healthy',
        data: {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            database: isConnected ? 'connected' : 'disconnected'
        }
    });
});

// Simple microservices endpoints
app.get('/api/microservices', async (req, res) => {
    try {
        await connectToMongoDB();
        
        const { q, api_type, status } = req.query;
        const query = {};
        
        if (api_type) query.api_type = api_type;
        if (status) query.status = status;
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }
        
        const microservices = await Microservice.find(query).sort({ created_at: -1 });
        
        res.json({
            ok: true,
            message: 'Microservices retrieved successfully',
            data: microservices
        });
    } catch (error) {
        console.error('Error fetching microservices:', error);
        res.status(500).json({
            ok: false,
            message: 'Failed to fetch microservices',
            data: { error: error.message }
        });
    }
});

app.get('/api/microservices/:id', async (req, res) => {
    try {
        await connectToMongoDB();
        
        const microservice = await Microservice.findById(req.params.id);
        
        if (!microservice) {
            return res.status(404).json({
                ok: false,
                message: 'Microservice not found',
                data: null
            });
        }
        
        res.json({
            ok: true,
            message: 'Microservice retrieved successfully',
            data: microservice
        });
    } catch (error) {
        console.error('Error fetching microservice:', error);
        res.status(500).json({
            ok: false,
            message: 'Failed to fetch microservice',
            data: { error: error.message }
        });
    }
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
const serverlessHandler = serverless(app);

// Wrapper handler
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