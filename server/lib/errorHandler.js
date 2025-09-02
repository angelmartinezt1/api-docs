/**
 * Custom error classes for consistent error handling
 */
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}

export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

export class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
    }
}

/**
 * Create standardized API response
 */
export function createResponse(ok, message, data = null, statusCode = 200) {
    return {
        ok,
        message,
        data,
        statusCode
    };
}

/**
 * Success response helper
 */
export function successResponse(message, data = null) {
    return createResponse(true, message, data, 200);
}

/**
 * Error response helper
 */
export function errorResponse(message, statusCode = 500, data = null) {
    return createResponse(false, message, data, statusCode);
}

/**
 * Global error handling middleware
 * Catches all errors and returns consistent JSON responses
 */
export function errorHandler(error, req, res, next) {
    console.error(`[${new Date().toISOString()}] Error:`, error);
    
    let statusCode = 500;
    let message = 'Internal server error';
    
    // Handle known error types
    if (error.statusCode) {
        statusCode = error.statusCode;
        message = error.message;
    } else if (error.name === 'ValidationError') {
        statusCode = 400;
        message = error.message;
    } else if (error.name === 'NotFoundError') {
        statusCode = 404;
        message = error.message;
    } else if (error.name === 'ConflictError') {
        statusCode = 409;
        message = error.message;
    } else if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        statusCode = 409;
        message = 'Resource already exists';
    } else if (error.code && error.code.startsWith('SQLITE_')) {
        statusCode = 500;
        message = 'Database error occurred';
    } else if (error.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'File size exceeds maximum allowed limit (5MB)';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        statusCode = 400;
        message = 'Unexpected file upload';
    } else if (error.type === 'entity.parse.failed') {
        statusCode = 400;
        message = 'Invalid JSON format in request body';
    } else if (error.type === 'entity.too.large') {
        statusCode = 400;
        message = 'Request body too large';
    }
    
    // Don't expose internal error details in production
    const response = errorResponse(
        message,
        statusCode,
        process.env.NODE_ENV === 'development' ? { 
            error: error.message,
            stack: error.stack?.split('\n').slice(0, 5) 
        } : null
    );
    
    res.status(statusCode).json({
        ok: response.ok,
        message: response.message,
        data: response.data
    });
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req, res) {
    res.status(404).json({
        ok: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        data: null
    });
}

/**
 * Async route wrapper to catch errors
 * Wraps async route handlers to automatically catch and pass errors to error middleware
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Response helpers to attach to res object
 */
export function attachResponseHelpers(req, res, next) {
    // Success responses
    res.success = function(message, data = null, statusCode = 200) {
        const response = successResponse(message, data);
        return res.status(statusCode).json({
            ok: response.ok,
            message: response.message,
            data: response.data
        });
    };
    
    // Error responses
    res.error = function(message, statusCode = 500, data = null) {
        const response = errorResponse(message, statusCode, data);
        return res.status(statusCode).json({
            ok: response.ok,
            message: response.message,
            data: response.data
        });
    };
    
    // Validation error
    res.validationError = function(message, data = null) {
        return res.error(message, 400, data);
    };
    
    // Not found error
    res.notFound = function(message = 'Resource not found', data = null) {
        return res.error(message, 404, data);
    };
    
    // Conflict error
    res.conflict = function(message, data = null) {
        return res.error(message, 409, data);
    };
    
    next();
}