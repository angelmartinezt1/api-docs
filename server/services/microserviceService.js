/**
 * Microservice Service Layer
 * Business logic for microservice operations
 * Works with both MongoDB and SQLite
 */

import Microservice from '../models/Microservice.js';
import { getDatabaseType, runQuery, getOne, getAll } from '../database.js';
import { newId, nowIso } from '../lib/utils.js';

/**
 * Get all microservices
 */
export async function getAllMicroservices() {
    if (getDatabaseType() === 'mongodb') {
        return await Microservice.find().sort({ created_at: -1 });
    } else {
        // SQLite fallback
        return await getAll(`
            SELECT * FROM microservices 
            ORDER BY created_at DESC
        `);
    }
}

/**
 * Get microservice by ID
 */
export async function getMicroserviceById(id) {
    if (getDatabaseType() === 'mongodb') {
        return await Microservice.findById(id);
    } else {
        // SQLite fallback
        return await getOne('SELECT * FROM microservices WHERE id = ?', [id]);
    }
}

/**
 * Get microservice by name
 */
export async function getMicroserviceByName(name) {
    if (getDatabaseType() === 'mongodb') {
        return await Microservice.findOne({ name });
    } else {
        // SQLite fallback
        return await getOne('SELECT * FROM microservices WHERE name = ?', [name]);
    }
}

/**
 * Create new microservice
 */
export async function createMicroservice(data) {
    const id = newId();
    const now = nowIso();
    
    const microserviceData = {
        _id: id,
        name: data.name,
        description: data.description,
        api_type: data.api_type,
        owner_dev_name: data.owner_dev_name,
        version: data.version || '1.0.0',
        status: data.status || 'draft',
        tags: data.tags || '',
        spec_filename: data.spec_filename,
        created_at: now,
        updated_at: now
    };
    
    if (getDatabaseType() === 'mongodb') {
        const microservice = new Microservice(microserviceData);
        return await microservice.save();
    } else {
        // SQLite fallback
        const result = await runQuery(`
            INSERT INTO microservices (
                id, name, description, api_type, owner_dev_name, 
                version, status, tags, spec_filename, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, data.name, data.description, data.api_type, data.owner_dev_name,
            data.version || '1.0.0', data.status || 'draft', data.tags || '',
            data.spec_filename, now, now
        ]);
        
        return { _id: id, ...microserviceData };
    }
}

/**
 * Update microservice
 */
export async function updateMicroservice(id, data) {
    const now = nowIso();
    
    if (getDatabaseType() === 'mongodb') {
        const updateData = {
            ...data,
            updated_at: now
        };
        
        return await Microservice.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
    } else {
        // SQLite fallback
        const fields = [];
        const values = [];
        
        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }
        if (data.api_type !== undefined) {
            fields.push('api_type = ?');
            values.push(data.api_type);
        }
        if (data.owner_dev_name !== undefined) {
            fields.push('owner_dev_name = ?');
            values.push(data.owner_dev_name);
        }
        if (data.version !== undefined) {
            fields.push('version = ?');
            values.push(data.version);
        }
        if (data.status !== undefined) {
            fields.push('status = ?');
            values.push(data.status);
        }
        if (data.tags !== undefined) {
            fields.push('tags = ?');
            values.push(data.tags);
        }
        if (data.spec_filename !== undefined) {
            fields.push('spec_filename = ?');
            values.push(data.spec_filename);
        }
        
        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);
        
        await runQuery(`
            UPDATE microservices 
            SET ${fields.join(', ')} 
            WHERE id = ?
        `, values);
        
        return await getMicroserviceById(id);
    }
}

/**
 * Delete microservice
 */
export async function deleteMicroservice(id) {
    if (getDatabaseType() === 'mongodb') {
        return await Microservice.findByIdAndDelete(id);
    } else {
        // SQLite fallback
        const microservice = await getMicroserviceById(id);
        if (microservice) {
            await runQuery('DELETE FROM microservices WHERE id = ?', [id]);
            return microservice;
        }
        return null;
    }
}

/**
 * Get microservices by API type
 */
export async function getMicroservicesByApiType(apiType) {
    if (getDatabaseType() === 'mongodb') {
        return await Microservice.findByApiType(apiType).sort({ created_at: -1 });
    } else {
        // SQLite fallback
        return await getAll(`
            SELECT * FROM microservices 
            WHERE api_type = ? 
            ORDER BY created_at DESC
        `, [apiType]);
    }
}

/**
 * Get active microservices
 */
export async function getActiveMicroservices() {
    if (getDatabaseType() === 'mongodb') {
        return await Microservice.findActive().sort({ created_at: -1 });
    } else {
        // SQLite fallback
        return await getAll(`
            SELECT * FROM microservices 
            WHERE status = 'active' 
            ORDER BY created_at DESC
        `);
    }
}

/**
 * Search microservices
 */
export async function searchMicroservices(query, filters = {}) {
    if (getDatabaseType() === 'mongodb') {
        const searchQuery = {};
        
        // Text search
        if (query) {
            searchQuery.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { owner_dev_name: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } }
            ];
        }
        
        // Apply filters
        if (filters.api_type) {
            searchQuery.api_type = filters.api_type;
        }
        if (filters.status) {
            searchQuery.status = filters.status;
        }
        if (filters.owner_dev_name) {
            searchQuery.owner_dev_name = { $regex: filters.owner_dev_name, $options: 'i' };
        }
        
        return await Microservice.find(searchQuery).sort({ created_at: -1 });
    } else {
        // SQLite fallback
        const conditions = [];
        const params = [];
        
        if (query) {
            conditions.push(`(
                name LIKE ? OR 
                description LIKE ? OR 
                owner_dev_name LIKE ? OR 
                tags LIKE ?
            )`);
            const searchParam = `%${query}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }
        
        if (filters.api_type) {
            conditions.push('api_type = ?');
            params.push(filters.api_type);
        }
        if (filters.status) {
            conditions.push('status = ?');
            params.push(filters.status);
        }
        if (filters.owner_dev_name) {
            conditions.push('owner_dev_name LIKE ?');
            params.push(`%${filters.owner_dev_name}%`);
        }
        
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        
        return await getAll(`
            SELECT * FROM microservices 
            ${whereClause}
            ORDER BY created_at DESC
        `, params);
    }
}