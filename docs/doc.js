// Simple and clean sidebar navigation with debug logs - Using data-target
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing sidebar...');
    initializeSidebarNavigation();
    initializeSidebarScroll();
    initializeCollapsibleSections();
    initializeDynamicContentSystem();
});

function initializeSidebarNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item[data-target]');
    const sections = document.querySelectorAll('.section');
    
    console.log(`📊 Found ${sidebarItems.length} sidebar items with data-target`);
    console.log(`📊 Found ${sections.length} sections`);
    
    // Debug: List all sidebar items found with their data-target
    sidebarItems.forEach((item, index) => {
        const target = item.getAttribute('data-target');
        const text = item.textContent.trim();
        console.log(`Sidebar item ${index}: "${text}" → target: "${target}"`);
    });
    
    // Debug: List all sections found
    sections.forEach((section, index) => {
        console.log(`Section ${index}: id="${section.id}"`);
    });
    
    // Click handler for sidebar items
    sidebarItems.forEach((item, index) => {
        item.addEventListener('click', function(e) {
            console.log(`🖱️ Clicked sidebar item ${index}:`, this.textContent.trim());
            
            const targetId = this.getAttribute('data-target');
            console.log(`🎯 Target ID from data-target: "${targetId}"`);
            
            if (targetId) {
                console.log(`✅ Found target ID, navigating to: ${targetId}`);
                
                // Update active state
                setActiveItem(this, sidebarItems);
                
                // Scroll to section
                scrollToSection(targetId);
                
                // Update dynamic content
                handleSidebarClick(targetId);
            } else {
                console.warn(`❌ No data-target attribute found on item`);
            }
        });
    });
    
    // Scroll listener to update active item
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateActiveItemOnScroll(sidebarItems, sections);
        }, 50);
    });
}

function setActiveItem(activeItem, allItems) {
    console.log('🎯 Setting active item:', activeItem.textContent.trim());
    
    // Remove active class from all items
    allItems.forEach(item => {
        if (item.classList.contains('active')) {
            console.log('❌ Removing active from:', item.textContent.trim());
        }
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    activeItem.classList.add('active');
    console.log('✅ Added active class to:', activeItem.textContent.trim());
    
    // Scroll sidebar to show active item
    scrollSidebarToActive(activeItem);
}

function scrollToSection(sectionId) {
    console.log(`🔍 Looking for section with ID: "${sectionId}"`);
    
    const section = document.getElementById(sectionId);
    if (section) {
        console.log('✅ Section found, scrolling to:', section);
        
        const headerOffset = 80; // Adjust for fixed header
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        console.log(`📐 Scroll calculation:
            - Element position: ${elementPosition}
            - Page Y offset: ${window.pageYOffset}
            - Header offset: ${headerOffset}
            - Final position: ${offsetPosition}`);

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        console.log('🚀 Scroll initiated');
    } else {
        console.error(`❌ Section not found with ID: "${sectionId}"`);
        console.log('Available sections:');
        document.querySelectorAll('.section').forEach(s => {
            console.log(`  - ${s.id}`);
        });
    }
}

function updateActiveItemOnScroll(sidebarItems, sections) {
    let currentSectionId = '';
    
    // Find which section is currently in view
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
            currentSectionId = section.id;
        }
    });
    
    if (currentSectionId) {
        console.log(`📜 Scroll detected - current section: ${currentSectionId}`);
        // Update dynamic content based on current section
        updateDynamicContentDisplay(currentSectionId);
    }
    
    // Update active sidebar item
    if (currentSectionId) {
        sidebarItems.forEach(item => {
            const wasActive = item.classList.contains('active');
            item.classList.remove('active');
            
            const targetId = item.getAttribute('data-target');
            if (targetId === currentSectionId) {
                item.classList.add('active');
                if (!wasActive) {
                    console.log(`🎯 Auto-activated sidebar item: ${item.textContent.trim()}`);
                }
                scrollSidebarToActive(item);
            }
        });
    }
}

function scrollSidebarToActive(activeItem) {
    console.log('📤 Scrolling sidebar to show active item');
    
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
        console.warn('❌ Sidebar element not found');
        return;
    }
    
    const sidebarRect = sidebar.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    
    console.log(`📐 Sidebar scroll check:
        - Sidebar top: ${sidebarRect.top}
        - Sidebar bottom: ${sidebarRect.bottom}
        - Item top: ${itemRect.top}
        - Item bottom: ${itemRect.bottom}`);
    
    // Check if item is outside visible area
    if (itemRect.top < sidebarRect.top + 50 || itemRect.bottom > sidebarRect.bottom - 50) {
        const itemTop = activeItem.offsetTop;
        const sidebarHeight = sidebar.clientHeight;
        const targetScroll = itemTop - (sidebarHeight / 2);
        
        console.log(`🚀 Scrolling sidebar to position: ${Math.max(0, targetScroll)}`);
        
        sidebar.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: 'smooth'
        });
    } else {
        console.log('✅ Active item already visible in sidebar');
    }
}

function initializeSidebarScroll() {
    console.log('📜 Initializing sidebar scroll...');
    
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        // Add scroll styling
        sidebar.style.height = '100vh';
        sidebar.style.overflowY = 'auto';
        sidebar.style.scrollBehavior = 'smooth';
        console.log('✅ Sidebar scroll configured');
    } else {
        console.warn('❌ Sidebar element not found for scroll initialization');
    }
}

function initializeCollapsibleSections() {
    console.log('🔽 Initializing collapsible sections...');
    
    const sectionTitles = document.querySelectorAll('.sidebar-section-title');
    console.log(`📊 Found ${sectionTitles.length} collapsible section titles`);
    
    sectionTitles.forEach((title, index) => {
        title.addEventListener('click', function() {
            console.log(`🖱️ Clicked section title ${index}:`, this.textContent);
            
            const section = this.parentElement;
            const items = this.nextElementSibling;
            
            // Toggle collapsed state
            const wasCollapsed = section.classList.contains('collapsed');
            section.classList.toggle('collapsed');
            
            console.log(`🔄 Section ${wasCollapsed ? 'expanded' : 'collapsed'}:`, this.textContent);
            
            // Animate section
            if (section.classList.contains('collapsed')) {
                items.style.maxHeight = '0';
                items.style.opacity = '0';
            } else {
                items.style.maxHeight = items.scrollHeight + 'px';
                items.style.opacity = '1';
            }
        });
        
        // Add cursor pointer
        title.style.cursor = 'pointer';
    });
    
    console.log('✅ Collapsible sections initialized');
}

// Optional: Tree structure functionality (if you have parameter trees)
function initializeTreeToggles() {
    console.log('🌳 Initializing tree toggles...');
    
    const toggles = document.querySelectorAll('.tree-toggle');
    console.log(`📊 Found ${toggles.length} tree toggles`);
    
    toggles.forEach((toggle, index) => {
        toggle.addEventListener('click', function() {
            console.log(`🖱️ Clicked tree toggle ${index}`);
            
            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const icon = this.querySelector('.toggle-icon');
            const text = this.querySelector('.toggle-text');
            
            console.log(`🎯 Tree toggle target: ${targetId}`);
            
            if (content) {
                const isHidden = content.style.display === 'none' || !content.style.display;
                
                if (isHidden) {
                    // Expand
                    content.style.display = 'block';
                    if (icon) icon.textContent = '−';
                    if (text) text.textContent = 'Ocultar propiedades';
                    console.log(`✅ Expanded tree section: ${targetId}`);
                } else {
                    // Collapse
                    content.style.display = 'none';
                    if (icon) icon.textContent = '+';
                    if (text) text.textContent = 'Mostrar propiedades';
                    console.log(`❌ Collapsed tree section: ${targetId}`);
                }
            } else {
                console.warn(`❌ Tree toggle target not found: ${targetId}`);
            }
        });
    });
    
    console.log('✅ Tree toggles initialized');
}

// Initialize tree toggles if they exist
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.tree-toggle')) {
        console.log('🌳 Tree toggles detected, initializing...');
        initializeTreeToggles();
    } else {
        console.log('📝 No tree toggles found');
    }
});

function toggleTheme() {
    const body = document.body;
    const themeButton = document.querySelector('.theme-toggle');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        themeButton.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeButton.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

// ========== DYNAMIC CONTENT FUNCTIONALITY ==========

// Variable para trackear la sección activa actual
let currentActiveSection = null;

function initializeDynamicContentSystem() {
    console.log('🎭 Initializing dynamic content system...');
    
    // Ocultar todos los elementos al inicio
    hideAllDynamicElements();
    
    console.log('✅ Dynamic content system initialized');
}

function updateDynamicContentDisplay(sectionId) {
    console.log(`🎭 Updating dynamic content for section: ${sectionId}`);
    
    // Si es la misma sección, no hacer nada
    /*if (currentActiveSection === sectionId) {
        console.log(`ℹ️ Same section as current: ${sectionId}, no change needed`);
        return;
    }*/
    
    // Solo actualizar si hay elementos correspondientes para la nueva sección
    const requestElementId = sectionId + '-request';
    const responseElementId = sectionId + '-response';
    const requestElement = document.getElementById(requestElementId);
    const responseElement = document.getElementById(responseElementId);
    
    // Si existe al menos uno de los elementos para la nueva sección, proceder
    if (requestElement || responseElement) {
        console.log(`✅ Found elements for section: ${sectionId}, updating content`);
        console.log(`📝 Previous section: ${currentActiveSection} → New section: ${sectionId}`);
        
        // Paso 1: Ocultar todos los elementos request-section y response-section
        hideAllDynamicElements();
        
        // Paso 2: Mostrar elementos específicos para la sección actual
        showElementsForSection(sectionId);
        
        // Actualizar la sección activa
        currentActiveSection = sectionId;
    } else {
        if(sectionId!="main-parameters"){
          hideAllDynamicElements();
        }
        console.log(`ℹ️ No elements found for section: ${sectionId}, keeping current content visible (${currentActiveSection})`);
    }
}

function hideAllDynamicElements() {
    // Ocultar todos los elementos con clase request-section
    const requestSections = document.querySelectorAll('.request-section');
    requestSections.forEach(element => {
        element.style.display = 'none';
    });
    
    // Ocultar todos los elementos con clase response-section
    const responseSections = document.querySelectorAll('.response-section');
    responseSections.forEach(element => {
        element.style.display = 'none';
    });
    
    console.log(`🙈 Hidden ${requestSections.length} request sections and ${responseSections.length} response sections`);
}

function showElementsForSection(sectionId) {
    if (!sectionId) {
        console.log('ℹ️ No section ID provided, keeping elements hidden');
        return;
    }
    
    // Construir los IDs de los elementos a mostrar
    const requestElementId = sectionId + '-request';
    const responseElementId = sectionId + '-response';
    
    console.log(`🔍 Looking for elements: ${requestElementId} and ${responseElementId}`);
    
    // Buscar y mostrar el elemento request
    const requestElement = document.getElementById(requestElementId);
    if (requestElement) {
        requestElement.style.display = 'block';
        console.log(`👁️ Shown request element: ${requestElementId}`);
    } else {
        console.log(`❌ Request element not found: ${requestElementId}`);
    }
    
    // Buscar y mostrar el elemento response
    const responseElement = document.getElementById(responseElementId);
    if (responseElement) {
        responseElement.style.display = 'block';
        console.log(`👁️ Shown response element: ${responseElementId}`);
    } else {
        console.log(`❌ Response element not found: ${responseElementId}`);
    }
}

// Función para manejar clicks en el sidebar
function handleSidebarClick(targetId) {
    console.log(`🖱️ Sidebar click detected for: ${targetId}`);
    
    // Actualizar contenido dinámico inmediatamente
    updateDynamicContentDisplay(targetId);
}





        class AIAssistant {
            constructor() {
                this.apiUrl = 'https://bt0uhaicmc.execute-api.us-east-1.amazonaws.com/dev/openapi';
                this.isOpen = false;
                this.isLoading = false;
                
                this.initializeElements();
                this.bindEvents();
                this.autoResizeTextarea();
            }

            initializeElements() {
                this.button = document.getElementById('aiAssistantButton');
                this.container = document.getElementById('aiChatContainer');
                this.closeButton = document.getElementById('aiCloseButton');
                this.messagesContainer = document.getElementById('aiChatMessages');
                this.inputField = document.getElementById('aiInputField');
                this.sendButton = document.getElementById('aiSendButton');
                this.loadingIndicator = document.getElementById('loadingIndicator');
            }

            bindEvents() {
                this.button.addEventListener('click', () => this.toggleChat());
                this.closeButton.addEventListener('click', () => this.closeChat());
                this.sendButton.addEventListener('click', () => this.sendMessage());
                this.inputField.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendMessage();
                    }
                });

                // Cerrar con Escape
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.isOpen) {
                        this.closeChat();
                    }
                });
            }

            autoResizeTextarea() {
                this.inputField.addEventListener('input', () => {
                    this.inputField.style.height = 'auto';
                    this.inputField.style.height = Math.min(this.inputField.scrollHeight, 100) + 'px';
                });
            }

            toggleChat() {
                if (this.isOpen) {
                    this.closeChat();
                } else {
                    this.openChat();
                }
            }

            openChat() {
                this.isOpen = true;
                this.container.classList.add('open');
                this.button.classList.remove('minimized');
                this.button.classList.add('expanded');
                this.inputField.focus();
            }

            closeChat() {
                this.isOpen = false;
                this.container.classList.remove('open');
                this.button.classList.remove('expanded');
                this.button.classList.add('minimized');
            }

            async sendMessage() {
                const message = this.inputField.value.trim();
                if (!message || this.isLoading) return;

                // Agregar mensaje del usuario
                this.addMessage(message, 'user');
                this.inputField.value = '';
                this.inputField.style.height = 'auto';

                // Mostrar loading
                this.setLoading(true);

                try {
                    const response = await this.callAI(message);
                    this.addMessage(response.answer, 'bot');
                } catch (error) {
                    console.error('Error calling AI:', error);
                    this.addMessage('Lo siento, hubo un error al procesar tu pregunta. Por favor, inténtalo de nuevo.', 'bot', true);
                } finally {
                    this.setLoading(false);
                }
            }

            async callAI(question) {
                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        question: question,
                        model: 'gpt-4o'
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            }

            addMessage(text, sender, isError = false) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${sender}`;
                
                const bubbleDiv = document.createElement('div');
                bubbleDiv.className = 'message-bubble';
                if (isError) {
                    bubbleDiv.style.background = '#fee2e2';
                    bubbleDiv.style.color = '#dc2626';
                    bubbleDiv.style.borderColor = '#fecaca';
                }
                bubbleDiv.textContent = text;
                
                const timeDiv = document.createElement('div');
                timeDiv.className = 'message-time';
                timeDiv.textContent = this.getCurrentTime();
                
                messageDiv.appendChild(bubbleDiv);
                messageDiv.appendChild(timeDiv);
                
                this.messagesContainer.appendChild(messageDiv);
                this.scrollToBottom();
            }

            setLoading(loading) {
                this.isLoading = loading;
                this.sendButton.disabled = loading;
                this.loadingIndicator.style.display = loading ? 'block' : 'none';
                
                if (loading) {
                    this.scrollToBottom();
                }
            }

            scrollToBottom() {
                setTimeout(() => {
                    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
                }, 100);
            }

            getCurrentTime() {
                return new Date().toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            }
        }

        // Inicializar cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', () => {
            new AIAssistant();
        });
