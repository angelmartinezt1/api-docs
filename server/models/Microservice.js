/**
 * Microservice MongoDB Model
 * Mongoose schema for microservice documents
 */

import mongoose from 'mongoose';

const microserviceSchema = new mongoose.Schema({
    // Custom ID using ULID instead of MongoDB ObjectId
    _id: {
        type: String,
        required: true
    },
    
    // Basic microservice information
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 1000
    },
    
    // API type classification
    api_type: {
        type: String,
        required: true,
        enum: ['Admin', 'Portal', 'Webhook', 'Integraciones']
    },
    
    // Development information
    owner_dev_name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    
    version: {
        type: String,
        default: '1.0.0',
        trim: true,
        maxlength: 20
    },
    
    // Status tracking
    status: {
        type: String,
        required: true,
        enum: ['draft', 'active', 'deprecated'],
        default: 'draft'
    },
    
    // Tags for categorization
    tags: {
        type: String,
        default: '',
        maxlength: 500
    },
    
    // File information
    spec_filename: {
        type: String,
        required: true,
        unique: true
    },
    
    // Timestamps
    created_at: {
        type: Date,
        default: Date.now
    },
    
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    // Disable automatic _id generation since we use ULID
    _id: false,
    // Enable automatic updatedAt
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    // Include virtual fields in JSON output
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
microserviceSchema.index({ name: 1 });
microserviceSchema.index({ api_type: 1 });
microserviceSchema.index({ status: 1 });
microserviceSchema.index({ owner_dev_name: 1 });
microserviceSchema.index({ created_at: -1 });

// Virtual field for formatted creation date
microserviceSchema.virtual('created_at_formatted').get(function() {
    return this.created_at.toISOString();
});

// Virtual field for formatted update date  
microserviceSchema.virtual('updated_at_formatted').get(function() {
    return this.updated_at.toISOString();
});

// Static method to find by API type
microserviceSchema.statics.findByApiType = function(apiType) {
    return this.find({ api_type: apiType });
};

// Static method to find active services
microserviceSchema.statics.findActive = function() {
    return this.find({ status: 'active' });
};

// Instance method to check if service is active
microserviceSchema.methods.isActive = function() {
    return this.status === 'active';
};

// Pre-save middleware to update the updated_at field
microserviceSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.updated_at = new Date();
    }
    next();
});

// Pre-save middleware for validation
microserviceSchema.pre('save', function(next) {
    // Ensure spec_filename has proper extension
    if (this.spec_filename && !this.spec_filename.endsWith('.json')) {
        this.spec_filename += '.json';
    }
    
    // Clean up tags
    if (this.tags) {
        this.tags = this.tags.trim();
    }
    
    next();
});

const Microservice = mongoose.model('Microservice', microserviceSchema);

export default Microservice;