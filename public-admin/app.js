/**
 * Admin Panel JavaScript
 * Handles CRUD operations for microservices management
 */

// Configuration
const API_BASE = 'https://elr7vjo2sq7enr53727zflpqw40zxdhw.lambda-url.us-east-1.on.aws/';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// State management
let currentMicroservices = [];
let currentFilters = {};
let editingService = null;

// DOM elements
const elements = {
    // Filters
    searchInput: document.getElementById('search'),
    apiTypeSelect: document.getElementById('api_type'),
    statusSelect: document.getElementById('status'),
    tagsInput: document.getElementById('tags'),
    applyFiltersBtn: document.getElementById('apply-filters'),
    
    // Table
    servicesTable: document.getElementById('services-table'),
    emptyState: document.getElementById('empty-state'),
    
    // Actions
    newServiceBtn: document.getElementById('new-service-btn'),
    
    // Side panel
    sidePanel: document.getElementById('side-panel'),
    panelTitle: document.getElementById('panel-title'),
    closePanelBtn: document.getElementById('close-panel'),
    overlay: document.getElementById('overlay'),
    
    // Form
    serviceForm: document.getElementById('service-form'),
    serviceIdInput: document.getElementById('service-id'),
    nameInput: document.getElementById('name'),
    descriptionInput: document.getElementById('description'),
    ownerInput: document.getElementById('owner_dev_name'),
    formApiTypeSelect: document.getElementById('form_api_type'),
    versionInput: document.getElementById('version'),
    formStatusSelect: document.getElementById('form_status'),
    formTagsInput: document.getElementById('form_tags'),
    specFileInput: document.getElementById('spec-file'),
    fileUpload: document.getElementById('file-upload'),
    fileInfo: document.getElementById('file-info'),
    specUploadSection: document.getElementById('spec-upload-section'),
    cancelBtn: document.getElementById('cancel-btn'),
    submitBtn: document.getElementById('submit-btn')
};

/**
 * Initialize the application
 */
function init() {
    console.log('Initializing Admin Panel...');
    
    // Load initial data
    loadMicroservices();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup file upload
    setupFileUpload();
    
    console.log('Admin Panel initialized successfully');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Filter events
    elements.applyFiltersBtn.addEventListener('click', applyFilters);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyFilters();
    });
    
    // Panel events
    elements.newServiceBtn.addEventListener('click', openNewServicePanel);
    elements.closePanelBtn.addEventListener('click', closePanel);
    elements.cancelBtn.addEventListener('click', closePanel);
    elements.overlay.addEventListener('click', closePanel);
    
    // Form events
    elements.serviceForm.addEventListener('submit', handleFormSubmit);
    
    // ESC key to close panel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.sidePanel.classList.contains('open')) {
            closePanel();
        }
    });
}

/**
 * Setup file upload functionality
 */
function setupFileUpload() {
    // Clic para subir
    elements.fileUpload.addEventListener('click', () => {
        elements.specFileInput.click();
    });
    
    // File input change
    elements.specFileInput.addEventListener('change', handleFileSelect);
    
    // Arrastrar y soltar
    elements.fileUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.fileUpload.classList.add('dragover');
    });
    
    elements.fileUpload.addEventListener('dragleave', () => {
        elements.fileUpload.classList.remove('dragover');
    });
    
    elements.fileUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.fileUpload.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect({ target: { files } });
        }
    });
}

/**
 * Load microservices data from API
 */
async function loadMicroservices(filters = {}) {
    try {
        showLoading(true);
        
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE}/microservices?${params}`);
        const result = await response.json();
        
        if (result.ok) {
            currentMicroservices = result.data || [];
            currentFilters = filters;
            renderTable();
        } else {
            showToast(result.message || 'Error al cargar microservicios', 'error');
        }
        
    } catch (error) {
        console.error('Error loading microservices:', error);
        showToast('Error al conectar con el servidor', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Apply filters and reload data
 */
function applyFilters() {
    const filters = {
        q: elements.searchInput.value.trim(),
        api_type: elements.apiTypeSelect.value,
        status: elements.statusSelect.value,
        tags: elements.tagsInput.value.trim()
    };
    
    // Remove empty filters
    Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
    });
    
    loadMicroservices(filters);
}

/**
 * Render the services table
 */
function renderTable() {
    const tbody = elements.servicesTable;
    
    if (currentMicroservices.length === 0) {
        tbody.innerHTML = '';
        elements.emptyState.style.display = 'block';
        return;
    }
    
    elements.emptyState.style.display = 'none';
    
    tbody.innerHTML = currentMicroservices.map(service => `
        <tr>
            <td>
                <strong>${escapeHtml(service.name)}</strong><br>
                <small class="text-muted">${escapeHtml(service.description)}</small>
            </td>
            <td><span class="api-type">${escapeHtml(service.api_type)}</span></td>
            <td><span class="status status-${service.status}">${translateStatus(service.status)}</span></td>
            <td>${escapeHtml(service.owner_dev_name)}</td>
            <td>${escapeHtml(service.version || '')}</td>
            <td>
                <div class="tags">
                    ${service.tags ? service.tags.split(',').map(tag => 
                        `<span class="tag">${escapeHtml(tag.trim())}</span>`
                    ).join('') : ''}
                </div>
            </td>
            <td>
                <small>${formatDate(service.updated_at)}</small>
            </td>
            <td>
                <div class="actions">
                    <button class="btn btn-sm btn-primary" onclick="editService('${service.id}')">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="replaceSpec('${service.id}')">
                        Replace JSON
                    </button>
                    <a href="/specs/${service.spec_filename}" target="_blank" class="btn btn-sm btn-secondary">
                        View JSON
                    </a>
                    ${service.status !== 'deprecated' ? 
                        `<button class="btn btn-sm btn-danger" onclick="deprecateService('${service.id}')">
                            Marcar Obsoleto
                        </button>` : ''
                    }
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Open new service panel
 */
function openNewServicePanel() {
    editingService = null;
    elements.panelTitle.textContent = 'Nuevo Microservicio';
    elements.specUploadSection.style.display = 'block';
    resetForm();
    openPanel();
}

/**
 * Edit existing service
 */
window.editService = async function(serviceId) {
    try {
        const response = await fetch(`${API_BASE}/microservices/${serviceId}`);
        const result = await response.json();
        
        if (result.ok) {
            editingService = result.data;
            elements.panelTitle.textContent = 'Editar Microservicio';
            elements.specUploadSection.style.display = 'none'; // Hide file upload for editing
            fillForm(result.data);
            openPanel();
        } else {
            showToast(result.message || 'Error al cargar servicio', 'error');
        }
    } catch (error) {
        console.error('Error loading service:', error);
        showToast('Error al conectar con el servidor', 'error');
    }
};

/**
 * Replace JSON specification
 */
window.replaceSpec = async function(serviceId) {
    try {
        const response = await fetch(`${API_BASE}/microservices/${serviceId}`);
        const result = await response.json();
        
        if (result.ok) {
            editingService = result.data;
            elements.panelTitle.textContent = 'Replace JSON Specification';
            
            // Hide all form fields except file upload
            const formGroups = elements.serviceForm.querySelectorAll('.form-group');
            formGroups.forEach(group => {
                if (group.id === 'spec-upload-section') {
                    group.style.display = 'block';
                } else {
                    group.style.display = 'none';
                }
            });
            
            resetForm();
            openPanel();
        } else {
            showToast(result.message || 'Error al cargar servicio', 'error');
        }
    } catch (error) {
        console.error('Error loading service:', error);
        showToast('Error al conectar con el servidor', 'error');
    }
};

/**
 * Deprecate service
 */
window.deprecateService = async function(serviceId) {
    const service = currentMicroservices.find(s => s.id === serviceId);
    const serviceName = service ? service.name : 'this service';
    
    const confirmed = showConfirmDialog(
        'Marcar Microservicio como Obsoleto',
        `Are you sure you want to deprecate "${serviceName}"?`,
        'Esto marcará el servicio como obsoleto y lo ocultará de los listados activos. La especificación de la API seguirá siendo accesible para las integraciones existentes.',
        'Marcar Obsoleto',
        'danger'
    );
    
    if (!confirmed) return;
    
    try {
        const response = await fetch(`${API_BASE}/microservices/${serviceId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        
        if (result.ok) {
            showToast('Servicio marcado como obsoleto exitosamente', 'success');
            loadMicroservices(currentFilters);
        } else {
            showToast(result.message || 'Error al marcar servicio como obsoleto', 'error');
        }
    } catch (error) {
        console.error('Error deprecating service:', error);
        showToast('Error al conectar con el servidor', 'error');
    }
};

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const isReplaceSpec = elements.panelTitle.textContent.includes('Replace JSON');
    const isEdit = editingService && !isReplaceSpec;
    
    if (isReplaceSpec) {
        await handleSpecReplacement();
    } else if (isEdit) {
        await handleServiceUpdate();
    } else {
        await handleServiceCreation();
    }
}

/**
 * Handle service creation
 */
async function handleServiceCreation() {
    const formData = new FormData();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'owner_dev_name', 'api_type'];
    for (const field of requiredFields) {
        const value = elements.serviceForm.querySelector(`[name="${field}"]`).value.trim();
        if (!value) {
            showToast(`${field.replace('_', ' ')} is required`, 'error');
            return;
        }
        formData.append(field, value);
    }
    
    // Optional fields
    const optionalFields = ['version', 'status', 'tags'];
    for (const field of optionalFields) {
        const value = elements.serviceForm.querySelector(`[name="${field}"]`).value.trim();
        if (value) formData.append(field, value);
    }
    
    // File validation
    const file = elements.specFileInput.files[0];
    if (!file) {
        showToast('JSON specification file is required', 'error');
        return;
    }
    
    if (!validateFile(file)) return;
    
    formData.append('spec_file', file);
    
    try {
        elements.submitBtn.disabled = true;
        elements.submitBtn.textContent = 'Creating...';
        
        const response = await fetch(`${API_BASE}/microservices`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        if (result.ok) {
            showToast('Microservice created successfully', 'success');
            closePanel();
            loadMicroservices(currentFilters);
        } else {
            showToast(result.message || 'Error al crear servicio', 'error');
        }
    } catch (error) {
        console.error('Error creating service:', error);
        showToast('Error al conectar con el servidor', 'error');
    } finally {
        elements.submitBtn.disabled = false;
        elements.submitBtn.textContent = 'Guardar Microservicio';
    }
}

/**
 * Handle service update
 */
async function handleServiceUpdate() {
    const updateData = {};
    
    // Collect form data
    const fields = ['name', 'description', 'owner_dev_name', 'api_type', 'version', 'status', 'tags'];
    for (const field of fields) {
        const value = elements.serviceForm.querySelector(`[name="${field}"]`).value.trim();
        if (value) updateData[field] = value;
    }
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'owner_dev_name', 'api_type'];
    for (const field of requiredFields) {
        if (!updateData[field]) {
            showToast(`${field.replace('_', ' ')} is required`, 'error');
            return;
        }
    }
    
    try {
        elements.submitBtn.disabled = true;
        elements.submitBtn.textContent = 'Updating...';
        
        const response = await fetch(`${API_BASE}/microservices/${editingService.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        const result = await response.json();
        
        if (result.ok) {
            showToast('Microservice updated successfully', 'success');
            closePanel();
            loadMicroservices(currentFilters);
        } else {
            showToast(result.message || 'Error al actualizar servicio', 'error');
        }
    } catch (error) {
        console.error('Error updating service:', error);
        showToast('Error al conectar con el servidor', 'error');
    } finally {
        elements.submitBtn.disabled = false;
        elements.submitBtn.textContent = 'Guardar Microservicio';
    }
}

/**
 * Handle specification replacement
 */
async function handleSpecReplacement() {
    const file = elements.specFileInput.files[0];
    if (!file) {
        showToast('JSON specification file is required', 'error');
        return;
    }
    
    if (!validateFile(file)) return;
    
    // Check if this is a version update by analyzing filename
    const currentFilename = editingService.spec_filename;
    const currentVersion = editingService.version;
    const suggestedFilename = generateSuggestedFilename(editingService.api_type, editingService.name, currentVersion);
    
    // Show warning if replacing with potentially different version
    if (currentFilename && suggestedFilename !== currentFilename) {
        const shouldContinue = showConfirmDialog(
            'Replace API Specification',
            `You're about to replace the JSON specification for "${editingService.name}".`,
            `Current file: ${currentFilename}\nSuggested file: ${suggestedFilename}\n\nNote: If this is a new version, consider updating the version field first to generate a more appropriate filename. The system will automatically handle filename generation.`,
            'Replace Specification',
            'warning'
        );
        
        if (!shouldContinue) return;
    }
    
    const formData = new FormData();
    formData.append('spec_file', file);
    
    try {
        elements.submitBtn.disabled = true;
        elements.submitBtn.textContent = 'Replacing...';
        
        const response = await fetch(`${API_BASE}/microservices/${editingService.id}/spec`, {
            method: 'PUT',
            body: formData
        });
        const result = await response.json();
        
        if (result.ok) {
            showToast('Specification replaced successfully', 'success');
            closePanel();
            loadMicroservices(currentFilters);
        } else {
            showToast(result.message || 'Error al reemplazar especificación', 'error');
        }
    } catch (error) {
        console.error('Error replacing specification:', error);
        showToast('Error al conectar con el servidor', 'error');
    } finally {
        elements.submitBtn.disabled = false;
        elements.submitBtn.textContent = 'Guardar Microservicio';
    }
}

/**
 * Validate uploaded file
 */
function validateFile(file) {
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.json')) {
        showToast('Solo se permiten archivos JSON', 'error');
        return false;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        showToast('El tamaño del archivo excede el límite máximo (5MB)', 'error');
        return false;
    }
    
    return true;
}

/**
 * Handle file selection
 */
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) {
        elements.fileInfo.style.display = 'none';
        return;
    }
    
    if (!validateFile(file)) {
        elements.specFileInput.value = '';
        return;
    }
    
    // Show file info
    elements.fileInfo.style.display = 'block';
    elements.fileInfo.innerHTML = `
        <strong>Selected file:</strong> ${escapeHtml(file.name)}<br>
        <strong>Size:</strong> ${formatFileSize(file.size)}<br>
        <strong>Type:</strong> ${file.type || 'application/json'}
    `;
}

/**
 * Panel management
 */
function openPanel() {
    elements.sidePanel.classList.add('open');
    elements.overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closePanel() {
    elements.sidePanel.classList.remove('open');
    elements.overlay.classList.remove('show');
    document.body.style.overflow = '';
    
    // Reset form visibility
    const formGroups = elements.serviceForm.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.style.display = 'block';
    });
    
    resetForm();
}

/**
 * Form management
 */
function resetForm() {
    elements.serviceForm.reset();
    elements.serviceIdInput.value = '';
    elements.formStatusSelect.value = 'active';
    elements.fileInfo.style.display = 'none';
    editingService = null;
}

function fillForm(service) {
    elements.serviceIdInput.value = service.id;
    elements.nameInput.value = service.name;
    elements.descriptionInput.value = service.description;
    elements.ownerInput.value = service.owner_dev_name;
    elements.formApiTypeSelect.value = service.api_type;
    elements.versionInput.value = service.version || '';
    elements.formStatusSelect.value = service.status;
    elements.formTagsInput.value = service.tags || '';
}

/**
 * UI helpers
 */
function showLoading(show) {
    const container = document.querySelector('.container');
    if (show) {
        container.classList.add('loading');
    } else {
        container.classList.remove('loading');
    }
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

/**
 * Show confirmation dialog
 */
function showConfirmDialog(title, message, details, confirmText = 'Confirmar', type = 'primary') {
    const typeColors = {
        primary: '#3498db',
        danger: '#e74c3c',
        warning: '#f39c12',
        success: '#27ae60'
    };
    
    const typeTextColors = {
        primary: 'white',
        danger: 'white', 
        warning: 'white',
        success: 'white'
    };
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    `;
    
    // Create modal dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        max-width: 500px;
        width: 100%;
        animation: modalSlideIn 0.2s ease-out;
    `;
    
    // Add animation keyframes
    if (!document.getElementById('modal-animations')) {
        const style = document.createElement('style');
        style.id = 'modal-animations';
        style.textContent = `
            @keyframes modalSlideIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    dialog.innerHTML = `
        <div style="padding: 1.5rem; border-bottom: 1px solid #eee;">
            <h3 style="margin: 0; color: #2c3e50; font-size: 1.1rem;">${escapeHtml(title)}</h3>
        </div>
        <div style="padding: 1.5rem;">
            <p style="margin: 0 0 1rem 0; color: #555; line-height: 1.5;">${escapeHtml(message)}</p>
            ${details ? `<div style="background: #f8f9fa; padding: 0.75rem; border-radius: 4px; font-size: 0.85rem; color: #666; white-space: pre-line; margin-bottom: 1rem;">${escapeHtml(details)}</div>` : ''}
        </div>
        <div style="padding: 0 1.5rem 1.5rem 1.5rem; display: flex; gap: 0.75rem; justify-content: flex-end;">
            <button id="modal-cancel" style="
                padding: 0.5rem 1rem;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: white;
                color: #666;
                cursor: pointer;
                font-size: 0.9rem;
            ">Cancelar</button>
            <button id="modal-confirm" style="
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 4px;
                background: ${typeColors[type]};
                color: ${typeTextColors[type]};
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: 500;
            ">${escapeHtml(confirmText)}</button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    return new Promise((resolve) => {
        const cleanup = () => {
            document.body.style.overflow = '';
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        };
        
        // Handle confirm
        dialog.querySelector('#modal-confirm').addEventListener('click', () => {
            cleanup();
            resolve(true);
        });
        
        // Handle cancel
        dialog.querySelector('#modal-cancel').addEventListener('click', () => {
            cleanup();
            resolve(false);
        });
        
        // Handle escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                cleanup();
                resolve(false);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Handle overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cleanup();
                resolve(false);
            }
        });
        
        // Focus confirm button
        dialog.querySelector('#modal-confirm').focus();
    });
}

/**
 * Generate suggested filename for current service
 */
function generateSuggestedFilename(apiType, name, version) {
    const finalVersion = version || '0.1.0';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `${apiType}-${name}-${finalVersion}-${date}.json`;
}

/**
 * Utility functions
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Translate status values to Spanish
 */
function translateStatus(status) {
    const translations = {
        'active': 'Activo',
        'draft': 'Borrador',
        'deprecated': 'Obsoleto'
    };
    return translations[status] || status;
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}