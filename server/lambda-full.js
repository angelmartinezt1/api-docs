/**
 * AWS Lambda handler for Express API
 * Full implementation with MongoDB support
 */

import serverless from 'serverless-http';
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { ulid } from 'ulid';

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

// Multer for file uploads (memory storage for Lambda)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware - Solo JSON parsing, CORS manejado en el wrapper
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

// POST - Create new microservice
app.post('/api/microservices', upload.single('spec_file'), async (req, res) => {
    try {
        await connectToMongoDB();
        
        const { name, description, owner_dev_name, api_type, version, status, tags } = req.body;
        
        // Validation
        if (!name || !description || !owner_dev_name || !api_type) {
            return res.status(400).json({
                ok: false,
                message: 'Missing required fields: name, description, owner_dev_name, api_type',
                data: null
            });
        }

        if (!['Admin', 'Portal', 'Webhook', 'Integraciones'].includes(api_type)) {
            return res.status(400).json({
                ok: false,
                message: 'Invalid api_type. Must be one of: Admin, Portal, Webhook, Integraciones',
                data: null
            });
        }

        if (!req.file) {
            return res.status(400).json({
                ok: false,
                message: 'JSON specification file is required',
                data: null
            });
        }

        // Validate JSON
        try {
            JSON.parse(req.file.buffer.toString());
        } catch (error) {
            return res.status(400).json({
                ok: false,
                message: 'Invalid JSON file',
                data: null
            });
        }

        // Check if name exists
        const existing = await Microservice.findOne({ name });
        if (existing) {
            return res.status(400).json({
                ok: false,
                message: 'Microservice name already exists',
                data: null
            });
        }

        // Generate filename and save microservice
        const id = ulid();
        const finalVersion = version || '0.1.0';
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const spec_filename = `${api_type}-${name}-${finalVersion}-${date}.json`;

        const newMicroservice = new Microservice({
            _id: id,
            name,
            description,
            owner_dev_name,
            api_type,
            version: finalVersion,
            status: status || 'active',
            tags: tags || '',
            spec_filename
        });

        await newMicroservice.save();

        res.status(201).json({
            ok: true,
            message: 'Microservice created successfully',
            data: newMicroservice
        });

    } catch (error) {
        console.error('Error creating microservice:', error);
        res.status(500).json({
            ok: false,
            message: 'Failed to create microservice',
            data: { error: error.message }
        });
    }
});

// PUT - Update microservice
app.put('/api/microservices/:id', async (req, res) => {
    try {
        await connectToMongoDB();
        
        const { id } = req.params;
        const { name, description, owner_dev_name, api_type, version, status, tags } = req.body;
        
        const existing = await Microservice.findById(id);
        if (!existing) {
            return res.status(404).json({
                ok: false,
                message: 'Microservice not found',
                data: null
            });
        }

        // Check name uniqueness if changing name
        if (name && name !== existing.name) {
            const nameExists = await Microservice.findOne({ name, _id: { $ne: id } });
            if (nameExists) {
                return res.status(400).json({
                    ok: false,
                    message: 'Microservice name already exists',
                    data: null
                });
            }
        }

        // Build update object
        const updateData = { updated_at: new Date() };
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (owner_dev_name) updateData.owner_dev_name = owner_dev_name;
        if (api_type) updateData.api_type = api_type;
        if (version) updateData.version = version;
        if (status) updateData.status = status;
        if (tags !== undefined) updateData.tags = tags;

        const updatedMicroservice = await Microservice.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true }
        );

        res.json({
            ok: true,
            message: 'Microservice updated successfully',
            data: updatedMicroservice
        });

    } catch (error) {
        console.error('Error updating microservice:', error);
        res.status(500).json({
            ok: false,
            message: 'Failed to update microservice',
            data: { error: error.message }
        });
    }
});

// PUT - Update spec file
app.put('/api/microservices/:id/spec', upload.single('spec_file'), async (req, res) => {
    try {
        await connectToMongoDB();
        
        const { id } = req.params;
        
        const existing = await Microservice.findById(id);
        if (!existing) {
            return res.status(404).json({
                ok: false,
                message: 'Microservice not found',
                data: null
            });
        }

        if (!req.file) {
            return res.status(400).json({
                ok: false,
                message: 'JSON specification file is required',
                data: null
            });
        }

        // Validate JSON
        try {
            JSON.parse(req.file.buffer.toString());
        } catch (error) {
            return res.status(400).json({
                ok: false,
                message: 'Invalid JSON file',
                data: null
            });
        }

        // Generate new filename
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const spec_filename = `${existing.api_type}-${existing.name}-${existing.version}-${date}.json`;

        const updatedMicroservice = await Microservice.findByIdAndUpdate(
            id,
            { 
                spec_filename,
                updated_at: new Date()
            },
            { new: true }
        );

        res.json({
            ok: true,
            message: 'Specification updated successfully',
            data: updatedMicroservice
        });

    } catch (error) {
        console.error('Error updating specification:', error);
        res.status(500).json({
            ok: false,
            message: 'Failed to update specification',
            data: { error: error.message }
        });
    }
});

// DELETE - Soft delete (deprecate)
app.delete('/api/microservices/:id', async (req, res) => {
    try {
        await connectToMongoDB();
        
        const { id } = req.params;
        
        const existing = await Microservice.findById(id);
        if (!existing) {
            return res.status(404).json({
                ok: false,
                message: 'Microservice not found',
                data: null
            });
        }

        const updatedMicroservice = await Microservice.findByIdAndUpdate(
            id,
            { 
                status: 'deprecated',
                updated_at: new Date()
            },
            { new: true }
        );

        res.json({
            ok: true,
            message: 'Microservice deprecated successfully',
            data: updatedMicroservice
        });

    } catch (error) {
        console.error('Error deprecating microservice:', error);
        res.status(500).json({
            ok: false,
            message: 'Failed to deprecate microservice',
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

// Simple wrapper handler - CORS handled by AWS Lambda Function URL
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
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ok: false,
                message: 'Internal server error',
                data: { error: error.message }
            })
        };
    }
};