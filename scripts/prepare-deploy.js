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
let apiBaseUrl = 'https://3we0wv453m.execute-api.us-east-1.amazonaws.com/dev';

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

// Generate cache busting hash
const deployTimestamp = Date.now();
const cacheHash = deployTimestamp.toString(36);

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

// Add cache busting to HTML files
function addCacheBusting(htmlPath, jsFile) {
    if (fs.existsSync(htmlPath)) {
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Replace JS file references to include cache busting
        const jsPattern = new RegExp(`(src=["']${jsFile})(["'])`, 'g');
        htmlContent = htmlContent.replace(jsPattern, `$1?v=${cacheHash}$2`);
        
        fs.writeFileSync(htmlPath, htmlContent);
        return true;
    }
    return false;
}

// Update admin panel HTML
const adminHtmlPath = path.join(__dirname, '..', 'public-admin', 'index.html');
if (addCacheBusting(adminHtmlPath, 'app.js')) {
    console.log('✅ Added cache busting to admin panel');
}

// Update front catalog HTML
const frontHtmlPath = path.join(__dirname, '..', 'public-front', 'index.html');
if (addCacheBusting(frontHtmlPath, 'app.js')) {
    console.log('✅ Added cache busting to front catalog');
}

// Update docs HTML
const docsHtmlPath = path.join(__dirname, '..', 'docs', 'index.html');
if (addCacheBusting(docsHtmlPath, 'swagger-ui-bundle.js') | 
   addCacheBusting(docsHtmlPath, 'swagger-ui-standalone-preset.js')) {
    console.log('✅ Added cache busting to docs');
}

console.log('🎉 Deployment preparation completed');