# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an API documentation generator that creates interactive HTML documentation from JSON/YAML configuration files. The project focuses on generating comprehensive API documentation with features like:

- Dynamic documentation generation from OpenAPI-like specifications
- Interactive UI with sidebar navigation
- Code examples and request/response details
- AI assistant integration for documentation assistance
- Theme switching capabilities
- Export functionality for LLM consumption

## Architecture

The project consists of several key components that work together:

### Core Files

- **`api-doc-generator.js`** - Main documentation generator class (`APIDocGenerator`) that transforms JSON/YAML configurations into HTML documentation
- **`doc.js`** - DOM manipulation and navigation system for the generated documentation, handles sidebar interaction and scrolling
- **`main.js`** - Entry point with utility functions for loading configurations, import/export functionality, and admin controls
- **`index.html`** - Main HTML template that orchestrates all components
- **`style.css`** - Complete styling for the documentation interface

### Configuration Files

- **`api-config.json`** - Primary API configuration in JSON format (OpenAPI-like structure)
- **`api-config.yaml`** - Alternative YAML configuration format
- Both files define API endpoints, authentication, request/response schemas, and metadata

### Key Architecture Patterns

1. **Generator Pattern**: `APIDocGenerator` class encapsulates all documentation generation logic
2. **Event-Driven**: Uses custom events (`documentationGenerated`) for component communication  
3. **Modular Design**: Separate files handle different concerns (generation, navigation, utilities)
4. **Configuration-Driven**: Documentation structure entirely defined by JSON/YAML config files

## Common Development Tasks

### Loading Documentation
```javascript
// Load from JSON (primary method)
loadFromJSON('api-config.json');

// Load from YAML (alternative)
loadFromYAML('api-config.yaml');
```

### Development Workflow
1. Open `index.html` in a browser to view the generated documentation
2. Modify `api-config.json` or `api-config.yaml` to update content
3. Refresh browser or use dynamic loading functions to see changes
4. Use browser developer tools for debugging JavaScript functionality

### Admin Controls
- Press `Ctrl+Alt+A` to open admin panel with import/export/modification controls
- Use "Exportar para IA" button in header to copy configuration for LLM analysis

### Configuration Structure
The JSON/YAML config follows this pattern:
- `info`: API metadata (title, version, description)
- `servers`: API server endpoints
- `security`: Authentication schemes
- `paths`: API endpoints with operations (GET, POST, etc.)
- Each path contains: summary, description, tags, request/response schemas

### Dynamic Content Updates
The system supports runtime updates:
```javascript
// Add new endpoint dynamically
addNewEndpoint();

// Update entire configuration
updateDocumentation(newConfig);

// Export current state
exportCurrentConfig();
```

## Integration Notes

- The system integrates with existing JavaScript if present (AI Assistant, theme toggles)
- Uses custom event system for loose coupling between components
- Preserves existing DOM elements when regenerating documentation
- Supports both file-based and runtime configuration updates