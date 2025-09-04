/**
 * Migration MongoDB Model
 * Track database migrations in MongoDB
 */

import mongoose from 'mongoose';

const migrationSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
        unique: true
    },
    
    executed_at: {
        type: Date,
        default: Date.now
    },
    
    version: {
        type: String,
        default: '1.0'
    }
}, {
    timestamps: true
});

// Index for better query performance
migrationSchema.index({ filename: 1 });
migrationSchema.index({ executed_at: -1 });

const Migration = mongoose.model('Migration', migrationSchema);

export default Migration;