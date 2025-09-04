import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { isAllowedApiType, isAllowedStatus } from '../lib/utils.js';
import config from '../config.js';

// Import service layer
import {
    getAllMicroservices,
    getMicroserviceById,
    getMicroserviceByName,
    createMicroservice,
    updateMicroservice,
    deleteMicroservice,
    searchMicroservices
} from '../services/microserviceService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const specsDir = config.upload.absoluteStoragePath;
        if (!fs.existsSync(specsDir)) {
            fs.mkdirSync(specsDir, { recursive: true });
        }
        cb(null, specsDir);
    },
    filename: (req, file, cb) => {
        // Generate filename based on form data
        const { api_type, name, version } = req.body;
        const finalVersion = version || '0.1.0';
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const filename = `${api_type}-${name}-${finalVersion}-${date}.json`;
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: config.upload.maxFileSize
    },
    fileFilter: (req, file, cb) => {
        const fileExtension = '.' + file.originalname.split('.').pop();
        if (file.mimetype === 'application/json' || config.upload.allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error(`Only files with extensions ${config.upload.allowedExtensions.join(', ')} are allowed`), false);
        }
    }
});

/**
 * Generate spec filename from metadata
 */
function generateSpecFilename(api_type, name, version) {
    const finalVersion = version || '0.1.0';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `${api_type}-${name}-${finalVersion}-${date}.json`;
}

/**
 * Validate JSON file content
 */
function validateJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        return { valid: true };
    } catch (error) {
        // Clean up invalid file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Extract line/column info if available
        let errorInfo = error.message;
        if (error.message.includes('position')) {
            const match = error.message.match(/position (\d+)/);
            if (match) {
                const position = parseInt(match[1]);
                const content = fs.readFileSync(filePath, 'utf8').substring(0, position);
                const lines = content.split('\n');
                const line = lines.length;
                const column = lines[lines.length - 1].length + 1;
                errorInfo = `Invalid JSON at line ${line}, column ${column}: ${error.message}`;
            }
        }
        
        return { valid: false, error: errorInfo };
    }
}

/**
 * GET /api/microservices - List microservices with filters
 */
router.get('/', async (req, res) => {
    try {
        const { q, api_type, status, tags } = req.query;
        
        const filters = {};
        
        // Build filters object
        if (api_type && isAllowedApiType(api_type)) {
            filters.api_type = api_type;
        }
        
        if (status && isAllowedStatus(status)) {
            filters.status = status;
        }
        
        let microservices;
        
        if (q || Object.keys(filters).length > 0) {
            // Use search function with filters
            microservices = await searchMicroservices(q, filters);
        } else {
            // Get all microservices
            microservices = await getAllMicroservices();
        }
        
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

/**
 * GET /api/microservices/:id - Get single microservice
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const microservice = await getMicroserviceById(id);
        
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

/**
 * POST /api/microservices - Create microservice with JSON upload
 */
router.post('/', upload.single('spec_file'), async (req, res) => {
    try {
        const { name, description, owner_dev_name, api_type, version, status, tags } = req.body;
        
        // Validation
        if (!name || !description || !owner_dev_name || !api_type) {
            return res.status(400).json({
                ok: false,
                message: 'Missing required fields: name, description, owner_dev_name, api_type',
                data: null
            });
        }
        
        if (!isAllowedApiType(api_type)) {
            return res.status(400).json({
                ok: false,
                message: `Invalid api_type. Must be one of: Admin, Portal, Webhook, Integraciones`,
                data: null
            });
        }
        
        const finalStatus = status || 'active';
        if (!isAllowedStatus(finalStatus)) {
            return res.status(400).json({
                ok: false,
                message: `Invalid status. Must be one of: draft, active, deprecated`,
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
        
        // Check if name is unique
        const existing = await getMicroserviceByName(name);
        if (existing) {
            // Clean up uploaded file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                ok: false,
                message: 'Microservice name already exists',
                data: null
            });
        }
        
        // Validate JSON file
        const jsonValidation = validateJsonFile(req.file.path);
        if (!jsonValidation.valid) {
            return res.status(400).json({
                ok: false,
                message: `Invalid JSON file: ${jsonValidation.error}`,
                data: null
            });
        }
        
        // Create microservice record
        const microserviceData = {
            name,
            description,
            owner_dev_name,
            api_type,
            version: version || '0.1.0',
            status: finalStatus,
            tags: tags || '',
            spec_filename: req.file.filename
        };
        
        const newMicroservice = await createMicroservice(microserviceData);
        
        res.status(201).json({
            ok: true,
            message: 'Microservice created successfully',
            data: newMicroservice
        });
        
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        console.error('Error creating microservice:', error);
        res.status(500).json({
            ok: false,
            message: 'Failed to create microservice',
            data: { error: error.message }
        });
    }
});

/**
 * PUT /api/microservices/:id - Update microservice metadata
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, owner_dev_name, api_type, version, status, tags } = req.body;
        
        // Check if microservice exists
        const existing = await getMicroserviceById(id);
        if (!existing) {
            return res.status(404).json({
                ok: false,
                message: 'Microservice not found',
                data: null
            });
        }
        
        // Validation
        if (api_type && !isAllowedApiType(api_type)) {
            return res.status(400).json({
                ok: false,
                message: `Invalid api_type. Must be one of: Admin, Portal, Webhook, Integraciones`,
                data: null
            });
        }
        
        if (status && !isAllowedStatus(status)) {
            return res.status(400).json({
                ok: false,
                message: `Invalid status. Must be one of: draft, active, deprecated`,
                data: null
            });
        }
        
        // Check name uniqueness (if changing name)
        if (name && name !== existing.name) {
            const nameExists = await getMicroserviceByName(name);
            if (nameExists && nameExists._id !== id) {
                return res.status(400).json({
                    ok: false,
                    message: 'Microservice name already exists',
                    data: null
                });
            }
        }
        
        // Build update data object
        const updateData = {};
        
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (owner_dev_name !== undefined) updateData.owner_dev_name = owner_dev_name;
        if (api_type !== undefined) updateData.api_type = api_type;
        if (version !== undefined) updateData.version = version;
        if (status !== undefined) updateData.status = status;
        if (tags !== undefined) updateData.tags = tags;
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'No fields to update',
                data: null
            });
        }
        
        const updatedMicroservice = await updateMicroservice(id, updateData);
        
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

/**
 * PUT /api/microservices/:id/spec - Replace JSON specification
 */
router.put('/:id/spec', upload.single('spec_file'), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if microservice exists
        const existing = await getMicroserviceById(id);
        if (!existing) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
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
        
        // Validate JSON file
        const jsonValidation = validateJsonFile(req.file.path);
        if (!jsonValidation.valid) {
            return res.status(400).json({
                ok: false,
                message: `Invalid JSON file: ${jsonValidation.error}`,
                data: null
            });
        }
        
        // Remove old spec file
        const oldSpecPath = join(config.upload.absoluteStoragePath, existing.spec_filename);
        if (fs.existsSync(oldSpecPath)) {
            fs.unlinkSync(oldSpecPath);
        }
        
        // Update spec_filename 
        const updatedMicroservice = await updateMicroservice(id, { 
            spec_filename: req.file.filename 
        });
        
        res.json({
            ok: true,
            message: 'Specification updated successfully',
            data: updatedMicroservice
        });
        
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        console.error('Error updating specification:', error);
        res.status(500).json({
            ok: false,
            message: 'Failed to update specification',
            data: { error: error.message }
        });
    }
});

/**
 * DELETE /api/microservices/:id - Soft delete (deprecate)
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if microservice exists
        const existing = await getMicroserviceById(id);
        if (!existing) {
            return res.status(404).json({
                ok: false,
                message: 'Microservice not found',
                data: null
            });
        }
        
        // Soft delete by setting status to deprecated
        const updatedMicroservice = await updateMicroservice(id, { 
            status: 'deprecated' 
        });
        
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

export default router;