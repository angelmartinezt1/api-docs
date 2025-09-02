import { ulid } from 'ulid';

/**
 * Get current timestamp in ISO format
 * @returns {string} ISO timestamp
 */
export function nowIso() {
    return new Date().toISOString();
}

/**
 * Generate new ULID
 * @returns {string} ULID string
 */
export function newId() {
    return ulid();
}

/**
 * Valid API types as defined in PROJECT.md
 */
const ALLOWED_API_TYPES = ['Admin', 'Portal', 'Webhook', 'Integraciones'];

/**
 * Valid status values
 */
const ALLOWED_STATUS = ['draft', 'active', 'deprecated'];

/**
 * Check if API type is allowed
 * @param {string} value - API type to validate
 * @returns {boolean} True if valid
 */
export function isAllowedApiType(value) {
    return ALLOWED_API_TYPES.includes(value);
}

/**
 * Check if status is allowed
 * @param {string} value - Status to validate
 * @returns {boolean} True if valid
 */
export function isAllowedStatus(value) {
    return ALLOWED_STATUS.includes(value);
}

/**
 * Get all allowed API types
 * @returns {string[]} Array of valid API types
 */
export function getAllowedApiTypes() {
    return [...ALLOWED_API_TYPES];
}

/**
 * Get all allowed status values
 * @returns {string[]} Array of valid status values
 */
export function getAllowedStatus() {
    return [...ALLOWED_STATUS];
}