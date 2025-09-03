/**
 * Frontend JavaScript for API Documentation Catalog
 * Handles service browsing, filtering, and display
 */

// Configuration
const API_BASE = '/api';

// State management
let allServices = [];
let currentSection = 'all';
let currentSearch = '';

// DOM elements
const elements = {
    // Sidebar
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    searchInput: document.getElementById('search-input'),
    clearFiltersBtn: document.getElementById('clear-filters-btn'),
    
    // Navigation
    navButtons: document.querySelectorAll('.nav-section-btn'),
    
    // Header
    sectionTitle: document.getElementById('section-title'),
    sectionDescription: document.getElementById('section-description'),
    totalServicesCount: document.getElementById('total-services'),
    activeServicesCount: document.getElementById('active-services'),
    
    // Content
    loadingState: document.getElementById('loading-state'),
    servicesGrid: document.getElementById('services-grid'),
    emptyState: document.getElementById('empty-state'),
    emptyStateMessage: document.getElementById('empty-state-message'),
    
    // Section counters
    countAll: document.getElementById('count-all'),
    countAdmin: document.getElementById('count-admin'),
    countPortal: document.getElementById('count-portal'),
    countWebhook: document.getElementById('count-webhook'),
    countIntegraciones: document.getElementById('count-integraciones')
};

// Section metadata
const sectionInfo = {
    all: {
        title: 'Todos los Servicios',
        description: 'Explora todas las APIs de microservicios disponibles',
        icon: '📋'
    },
    Admin: {
        title: 'Servicios de Administración',
        description: 'APIs internas de administración y gestión',
        icon: '🔧'
    },
    Portal: {
        title: 'Servicios de Portal',
        description: 'APIs públicas y de portal para clientes',
        icon: '🌐'
    },
    Webhook: {
        title: 'Servicios de Webhook',
        description: 'Endpoints de webhooks basados en eventos y notificaciones',
        icon: '🔗'
    },
    Integraciones: {
        title: 'Servicios de Integración',
        description: 'APIs de integración y conectores de terceros',
        icon: '🔌'
    }
};

/**
 * Initialize the application
 */
function init() {
    console.log('Initializing Frontend Catalog...');
    
    // Load initial data
    loadServices();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('Frontend Catalog initialized successfully');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Navigation section buttons
    elements.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            selectSection(section);
        });
    });
    
    // Search functionality
    elements.searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim();
        filterAndRenderServices();
    });
    
    // Clear filters
    elements.clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Mobile menu
    elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    elements.sidebarOverlay.addEventListener('click', closeMobileMenu);
    
    // Close mobile menu on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
    
    // Close mobile menu when clicking on navigation
    elements.navButtons.forEach(btn => {
        btn.addEventListener('click', closeMobileMenu);
    });
}

/**
 * Load services from API
 */
async function loadServices() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/microservices`);
        const result = await response.json();
        
        if (result.ok) {
            allServices = result.data || [];
            updateCounts();
            filterAndRenderServices();
        } else {
            showError('Error al cargar servicios: ' + (result.message || 'Error desconocido'));
        }
        
    } catch (error) {
        console.error('Error loading services:', error);
        showError('Error al conectar con el servidor');
    } finally {
        showLoading(false);
    }
}

/**
 * Select a navigation section
 */
function selectSection(section) {
    currentSection = section;
    
    // Update active navigation button
    elements.navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
    });
    
    // Update header
    const info = sectionInfo[section];
    elements.sectionTitle.textContent = info.title;
    elements.sectionDescription.textContent = info.description;
    
    // Filter and render services
    filterAndRenderServices();
}

/**
 * Clear all filters
 */
function clearFilters() {
    currentSearch = '';
    elements.searchInput.value = '';
    selectSection('all');
}

/**
 * Filter and render services based on current state
 */
function filterAndRenderServices() {
    let filteredServices = [...allServices];
    
    // Filter by section
    if (currentSection !== 'all') {
        filteredServices = filteredServices.filter(service => 
            service.api_type === currentSection
        );
    }
    
    // Filter by search
    if (currentSearch) {
        const searchLower = currentSearch.toLowerCase();
        filteredServices = filteredServices.filter(service =>
            service.name.toLowerCase().includes(searchLower) ||
            service.description.toLowerCase().includes(searchLower) ||
            service.owner_dev_name.toLowerCase().includes(searchLower) ||
            (service.tags && service.tags.toLowerCase().includes(searchLower))
        );
    }
    
    // Sort services: active status first, then by name
    filteredServices.sort((a, b) => {
        // First sort by status (active first)
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        
        // Then sort by name
        return a.name.localeCompare(b.name);
    });
    
    renderServices(filteredServices);
    updateStats(filteredServices);
}

/**
 * Render services grid
 */
function renderServices(services) {
    if (services.length === 0) {
        showEmptyState();
        return;
    }
    
    elements.servicesGrid.style.display = 'grid';
    elements.emptyState.style.display = 'none';
    
    elements.servicesGrid.innerHTML = services.map(service => createServiceCard(service)).join('');
}

/**
 * Create a service card HTML
 */
function createServiceCard(service) {
    const tags = service.tags ? service.tags.split(',').map(tag => tag.trim()) : [];
    const truncatedDescription = truncateText(service.description, 120);
    
    return `
        <div class="service-card">
            <div class="service-card-header">
                <div class="service-title">
                    <span>${escapeHtml(service.name)}</span>
                    <span class="service-type ${service.api_type.toLowerCase()}">
                        ${service.api_type}
                    </span>
                </div>
                <div class="service-description">
                    ${escapeHtml(truncatedDescription)}
                </div>
            </div>
            
            <div class="service-card-body">
                <div class="service-meta">
                    <div class="meta-item">
                        <span class="meta-icon">👤</span>
                        <span>${escapeHtml(service.owner_dev_name)}</span>
                    </div>
                    ${service.version ? `
                        <div class="meta-item">
                            <span class="meta-icon">🏷️</span>
                            <span>v${escapeHtml(service.version)}</span>
                        </div>
                    ` : ''}
                    <div class="meta-item">
                        <span class="meta-icon">🕒</span>
                        <span>${formatDate(service.updated_at)}</span>
                    </div>
                </div>
                
                ${tags.length > 0 ? `
                    <div class="service-tags">
                        ${tags.map(tag => `
                            <span class="service-tag">${escapeHtml(tag)}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="service-card-footer">
                <div class="service-status">
                    <div class="status-dot ${service.status}"></div>
                    <span>${capitalizeFirst(service.status)}</span>
                </div>
                <a 
                    href="/docs/index.html?spec=/specs/${service.spec_filename}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="view-docs-btn"
                >
                    Ver Documentación
                    <span>🔗</span>
                </a>
            </div>
        </div>
    `;
}

/**
 * Update section counters
 */
function updateCounts() {
    const counts = {
        all: allServices.length,
        admin: 0,
        portal: 0,
        webhook: 0,
        integraciones: 0
    };
    
    allServices.forEach(service => {
        switch (service.api_type) {
            case 'Admin':
                counts.admin++;
                break;
            case 'Portal':
                counts.portal++;
                break;
            case 'Webhook':
                counts.webhook++;
                break;
            case 'Integraciones':
                counts.integraciones++;
                break;
        }
    });
    
    elements.countAll.textContent = counts.all;
    elements.countAdmin.textContent = counts.admin;
    elements.countPortal.textContent = counts.portal;
    elements.countWebhook.textContent = counts.webhook;
    elements.countIntegraciones.textContent = counts.integraciones;
}

/**
 * Update header stats
 */
function updateStats(filteredServices) {
    const activeServices = filteredServices.filter(s => s.status === 'active').length;
    
    elements.totalServicesCount.textContent = filteredServices.length;
    elements.activeServicesCount.textContent = activeServices;
}

/**
 * Show empty state
 */
function showEmptyState() {
    elements.servicesGrid.style.display = 'none';
    elements.emptyState.style.display = 'block';
    
    let message = 'No hay microservicios que coincidan con tus filtros actuales.';
    
    if (currentSearch) {
        message = `No se encontraron servicios para "${currentSearch}".`;
    } else if (currentSection !== 'all') {
        message = `No se encontraron servicios en la sección ${sectionInfo[currentSection].title.toLowerCase()}.`;
    }
    
    elements.emptyStateMessage.textContent = message;
}

/**
 * Show loading state
 */
function showLoading(show) {
    if (show) {
        elements.loadingState.style.display = 'flex';
        elements.servicesGrid.style.display = 'none';
        elements.emptyState.style.display = 'none';
    } else {
        elements.loadingState.style.display = 'none';
    }
}

/**
 * Show error message
 */
function showError(message) {
    elements.loadingState.style.display = 'none';
    elements.servicesGrid.style.display = 'none';
    elements.emptyState.style.display = 'block';
    
    elements.emptyState.innerHTML = `
        <div class="empty-state-icon">⚠️</div>
        <h3>Error al Cargar Servicios</h3>
        <p>${escapeHtml(message)}</p>
        <button onclick="loadServices()" class="view-docs-btn" style="margin-top: 1rem;">
            Intentar de Nuevo
        </button>
    `;
}

/**
 * Mobile menu functions
 */
function toggleMobileMenu() {
    elements.sidebar.classList.toggle('open');
    elements.sidebarOverlay.classList.toggle('show');
}

function closeMobileMenu() {
    elements.sidebar.classList.remove('open');
    elements.sidebarOverlay.classList.remove('show');
}

/**
 * Utility functions
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `hace ${diffDays} días`;
    if (diffDays < 30) return `hace ${Math.ceil(diffDays / 7)} semanas`;
    if (diffDays < 365) return `hace ${Math.ceil(diffDays / 30)} meses`;
    
    return date.toLocaleDateString();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Make loadServices available globally for error retry
window.loadServices = loadServices;