#!/usr/bin/env node
/**
 * Script to prepare static sites for deployment
 * Updates API URLs and configurations for different stages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stage = process.env.SST_STAGE || 'dev';
// Para desarrollo local, mantener API local
let apiBaseUrl = process.env.API_URL || '/api';

// For Lambda deployment, add /api prefix to the base URL
if (process.env.API_URL && process.env.API_URL.includes('lambda-url')) {
    // Remove trailing slash first
    if (apiBaseUrl.endsWith('/')) {
        apiBaseUrl = apiBaseUrl.slice(0, -1);
    }
    // Add /api prefix
    apiBaseUrl = apiBaseUrl + '/api';
} else {
    // For local development, API_BASE should already include /api
    if (apiBaseUrl.endsWith('/')) {
        apiBaseUrl = apiBaseUrl.slice(0, -1);
    }
}

console.log(`🚀 Preparing deployment for stage: ${stage}`);
console.log(`📡 API URL: ${apiBaseUrl}`);

// Update public-admin API configuration
const adminAppPath = path.join(__dirname, '..', 'public-admin', 'app.js');
if (fs.existsSync(adminAppPath)) {
    let adminContent = fs.readFileSync(adminAppPath, 'utf8');
    
    // Replace API_BASE constant  
    adminContent = adminContent.replace(
        /const API_BASE = ['"][^'"]*['"];/,
        `const API_BASE = '${apiBaseUrl}';`
    );
    
    fs.writeFileSync(adminAppPath, adminContent);
    console.log('✅ Updated public-admin API configuration');
}

// Update public-front API configuration
const frontAppPath = path.join(__dirname, '..', 'public-front', 'app.js');
if (fs.existsSync(frontAppPath)) {
    let frontContent = fs.readFileSync(frontAppPath, 'utf8');
    
    // Replace API_BASE constant
    frontContent = frontContent.replace(
        /const API_BASE = ['"][^'"]*['"];/,
        `const API_BASE = '${apiBaseUrl}';`
    );
    
    fs.writeFileSync(frontAppPath, frontContent);
    console.log('✅ Updated public-front API configuration');
}

// Create environment info file for docs
const envInfoPath = path.join(__dirname, '..', 'docs', 'env.json');
const envInfo = {
    stage: stage,
    apiUrl: apiBaseUrl,
    deployedAt: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
};

fs.writeFileSync(envInfoPath, JSON.stringify(envInfo, null, 2));
console.log('✅ Created environment info for docs');

console.log('🎉 Deployment preparation completed');