/**
 * Generador de Documentación API
 * Toma un JSON de configuración y genera la documentación HTML
 */

class APIDocGenerator {
    constructor() {
        this.config = null;
        this.lastActiveSectionId = null;
        this.uniqueIdCounter = 0;
    }
    
    /**
     * Genera un ID único para elementos del DOM
     */
    generateUniqueId(prefix = 'id') {
        return `${prefix}-${++this.uniqueIdCounter}`;
    }

    /**
     * Genera la documentación a partir de un JSON
     */
    generateFromJSON(jsonConfig) {
        try {
            this.config = typeof jsonConfig === 'string' ? JSON.parse(jsonConfig) : jsonConfig;
            this.generateDocumentation();
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    }

    /**
     * Genera la documentación a partir de YAML
     */
    generateFromYAML(yamlString) {
        // Implementar parser YAML simple o usar librería
        try {
            const json = this.yamlToJson(yamlString);
            this.generateFromJSON(json);
        } catch (error) {
            console.error('Error parsing YAML:', error);
        }
    }

    /**
     * Genera toda la documentación
     */
    generateDocumentation() {
        if (!this.config) {
            console.error('No configuration available');
            return;
        }

        // Validar configuración
        if (!this.validateConfig(this.config)) {
            console.error('Invalid configuration provided');
            return;
        }

        try {
            // Limpiar contenido existente
            this.clearExistingContent();
            
            // Generar header
            this.generateHeader();
            
            // Generar sidebar
            this.generateSidebar();
            
            // Generar contenido principal
            this.generateMainContent();
            
            // Generar code sidebar
            this.generateCodeSidebar();
            
            // Inicializar eventos (después de que se haya construido todo)
            this.initializeEvents();

            // Integrar con el sistema existente de doc.js si está disponible
            this.integrateWithExistingSystem();

            console.log('Documentation generated successfully');
        } catch (error) {
            console.error('Error generating documentation:', error);
        }
    }

    /**
     * Integra con el sistema JavaScript existente
     */
    integrateWithExistingSystem() {
        console.log('🔗 Integrating with existing doc.js system...');
        
        // Si existe el sistema de AI Assistant, mantenerlo
        if (window.AIAssistant) {
            console.log('✅ AI Assistant system detected and preserved');
        }
        
        // Disparar evento personalizado para notificar que la documentación está lista
        const event = new CustomEvent('documentationGenerated', {
            detail: { 
                config: this.config,
                generator: this 
            }
        });
        document.dispatchEvent(event);
        
        // Handle initial URL hash navigation
        setTimeout(() => {
            this.handleInitialHashNavigation();
        }, 300);
        
        // Si existe toggleTheme en el scope global, preservarlo
        if (typeof window.toggleTheme === 'function') {
            console.log('✅ Theme toggle function preserved');
        } else if (typeof toggleTheme === 'function') {
            window.toggleTheme = toggleTheme;
            console.log('✅ Theme toggle function attached to window');
        }
        
        console.log('✅ Integration with existing system completed');
    }

    /**
     * Genera el header
     */
    generateHeader() {
        const header = document.querySelector('.header .logo');
        if (header && this.config.info) {
            header.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="27" height="25" fill="none" viewBox="0 0 28 26" class="api-logo-svg" style="min-height: 20px; max-width: 20px; flex-shrink: 0;margin-right: 10px;">
                    <path fill="#D93A26" d="M18.69 10.828h2.766c.105 0 .175 0 .245.07V24.62c0 .595.56 1.015 1.155.84 1.296-.525 2.976-1.19 4.201-1.75.21-.105.49-.21.49-.63V2.496a.867.867 0 0 0-.875-.875h-2.065c-.385 0-.7.245-.84.595-.84 2.346-2.45 4.096-4.866 4.516-.105 0-.21.035-.35.035-.455.07-.77.42-.77.875v2.275c0 .49.385.876.875.876z"></path>
                    <path fill="#D93A26" d="M22.331.71c-.105-.105-.28-.21-.455-.21H1.608C.978.5.452.955.452 1.55v3.08c0 .736.14 1.086 1.05 1.086H8.26c.175 0 .315.14.315.315v17.013c0 .315.21.56.525.7.595.245 2.66 1.26 3.36 1.645s1.926-.28 1.926-1.26V6.38c-.035-.245 0-.49.245-.595h2.38c4.83-.455 5.321-4.2 5.356-4.62V.99c0-.105 0-.175-.105-.245z"></path>
                </svg>
                <span class="api-title">${this.config.info.title || 'dev docs'}</span>
                <button id="export-llm-btn" class="export-ai-btn" style="margin-left:18px;padding:6px 14px;border-radius:5px;border:1px solid #e5e7eb;background:#2563eb;color:#fff;font-weight:bold;cursor:pointer;font-size:1em;">
                    <span class="export-btn-text">Exportar para IA</span>
                    <span class="export-btn-icon" style="display: none;">📋</span>
                </button>
            `;
        }

        // Actualizar título de la página
        if (this.config.info?.title) {
            document.title = this.config.info.title;
        }

        // Botón exportar para IA
        setTimeout(() => {
            const btn = document.getElementById('export-llm-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    let docText = '';
                    try {
                        // Exportar como JSON legible para LLM
                        docText = JSON.stringify(this.config, null, 2);
                    } catch (err) {
                        docText = 'Error al exportar la documentación.';
                    }
                    // Copiar al portapapeles
                    navigator.clipboard.writeText(docText).then(() => {
                        const textSpan = btn.querySelector('.export-btn-text');
                        const iconSpan = btn.querySelector('.export-btn-icon');
                        
                        // Mostrar "Copiado ✓" temporalmente
                        if (textSpan) textSpan.textContent = 'Copiado ✓';
                        if (iconSpan) iconSpan.textContent = '✓';
                        btn.style.background = '#16a34a';
                        
                        setTimeout(() => {
                            // Restaurar contenido original
                            if (textSpan) textSpan.textContent = 'Exportar para IA';
                            if (iconSpan) iconSpan.textContent = '📋';
                            btn.style.background = '#2563eb';
                        }, 1200);
                    });
                });
            }
        }, 200);
    }

    /**
     * Genera el sidebar de navegación
     */
    generateSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar || !this.config.paths) return;

        // Limpiar sidebar existente
        sidebar.innerHTML = '';

        // Header del sidebar
        const sidebarHeader = document.createElement('div');
        sidebarHeader.className = 'sidebar-header';
        sidebarHeader.innerHTML = `
            <div class="sidebar-title">${this.config.info?.title || 'API'}</div>
            <div class="sidebar-version">${this.config.info?.version || 'v1.0'}</div>
        `;
        sidebar.appendChild(sidebarHeader);

        // Search bar
        const searchBar = document.createElement('div');
        searchBar.className = 'sidebar-searchbar';
        searchBar.innerHTML = `
            <input type="text" class="sidebar-search-input" placeholder="Buscar endpoint..." style="width:100%;padding:7px 12px;margin:10px 0 18px 0;border-radius:5px;border:1px solid #e5e7eb;font-size:1em;">
        `;
        sidebar.appendChild(searchBar);

        // Sección de inicio
        this.generateIntroSection(sidebar);

        // Agrupar endpoints por tags
        const groupedPaths = this.groupPathsByTags();
        
        // Generar secciones por grupo
        Object.entries(groupedPaths).forEach(([tag, paths]) => {
            this.generateSidebarSection(sidebar, tag, paths);
        });

        // Implement search functionality
        const searchInput = searchBar.querySelector('.sidebar-search-input');
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            const items = sidebar.querySelectorAll('.sidebar-item');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = (!query || text.includes(query)) ? '' : 'none';
            });
        });
    }

    /**
     * Genera la sección de introducción en el sidebar
     */
    generateIntroSection(sidebar) {
        const introSection = document.createElement('div');
        introSection.className = 'sidebar-section';
        introSection.innerHTML = `
            <div class="sidebar-section-title">Inicio</div>
            <div class="sidebar-items">
                <div class="sidebar-item" data-target="introduction">Introducción</div>
                <div class="sidebar-item" data-target="authentication">Autenticación</div>
                <div class="sidebar-item" data-target="base-url">URL del Servicio</div>
                <div class="sidebar-item" data-target="sso">SSO - Access Token</div>
                <div class="sidebar-item" data-target="status-codes">Estatus y códigos de Error</div>
                <div class="sidebar-item" data-target="cors-diagnostics">Diagnóstico CORS</div>
            </div>
        `;
        sidebar.appendChild(introSection);
    }

    /**
     * Genera una sección del sidebar
     */
    generateSidebarSection(sidebar, tag, paths) {
        const section = document.createElement('div');
        section.className = 'sidebar-section';
        
        const sectionTitle = document.createElement('div');
        sectionTitle.className = 'sidebar-section-title';
        sectionTitle.textContent = tag;
        section.appendChild(sectionTitle);

        const sidebarItems = document.createElement('div');
        sidebarItems.className = 'sidebar-items';

        paths.forEach(({ path, method, operation }) => {
            const item = document.createElement('div');
            item.className = 'sidebar-item';
            item.setAttribute('data-target', this.generateOperationId(path, method));
            
            const methodTag = document.createElement('span');
            methodTag.className = `method-tag method-${method.toLowerCase()}`;
            methodTag.textContent = method.toUpperCase();
            
            item.appendChild(methodTag);
            item.appendChild(document.createTextNode(operation.summary || path));
            
            sidebarItems.appendChild(item);
        });

        section.appendChild(sidebarItems);
        sidebar.appendChild(section);
    }

    /**
     * Genera el contenido principal
     */
    generateMainContent() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        // Limpiar contenido existente
        mainContent.innerHTML = '';

        // Título principal
        const title = document.createElement('h1');
        title.className = 'content-title';
        title.textContent = this.config.info?.title || 'API Documentation';
        mainContent.appendChild(title);

        // Generar secciones de introducción
        this.generateIntroSections(mainContent);

        // Generar endpoints
        Object.entries(this.config.paths || {}).forEach(([path, methods]) => {
            Object.entries(methods).forEach(([method, operation]) => {
                this.generateEndpointSection(mainContent, path, method, operation);
            });
        });
    }

    /**
     * Genera las secciones de introducción
     */
    generateIntroSections(mainContent) {
        // Introducción
        const introSection = this.createSection('introduction', 'Introducción', 
            this.config.info?.description || 'Documentación de la API');
        mainContent.appendChild(introSection);

        // Autenticación
        const authSection = this.createSection('authentication', 'Autenticación', 
            this.config.security?.[0] ? this.generateAuthDescription() : 'Información de autenticación no disponible');
        mainContent.appendChild(authSection);

        // URL Base
        const baseUrlSection = this.createSection('base-url', 'URL Base');
        const urlDiv = document.createElement('div');
        urlDiv.className = 'endpoint-url';
        urlDiv.textContent = this.config.servers?.[0]?.url || 'https://api.example.com';
        baseUrlSection.appendChild(urlDiv);
        mainContent.appendChild(baseUrlSection);

        // SSO - Obtener Access Token
        const ssoSection = this.generateSSOSection();
        mainContent.appendChild(ssoSection);

        // Códigos de estado
        const statusSection = this.generateStatusCodesSection();
        mainContent.appendChild(statusSection);

        // CORS Diagnostics
        const corsSection = this.generateCORSDiagnosticsSection();
        mainContent.appendChild(corsSection);
    }

    /**
     * Genera una sección de endpoint
     */
    generateEndpointSection(mainContent, path, method, operation) {
        const section = document.createElement('section');
        section.id = this.generateOperationId(path, method);
        section.className = 'section';

        // Header de la sección
        const header = document.createElement('div');
        header.className = 'section-header';
        const title = document.createElement('h2');
        title.textContent = operation.summary || `${method.toUpperCase()} ${path}`;
        header.appendChild(title);
        section.appendChild(header);

        // Descripción
        if (operation.description) {
            const desc = document.createElement('p');
            desc.className = 'section-description';
            desc.textContent = operation.description;
            section.appendChild(desc);
        }

        // URL del endpoint
        const endpointUrl = document.createElement('div');
        endpointUrl.className = 'endpoint-url';
        endpointUrl.innerHTML = `
            <span class="http-method ${method.toLowerCase()}">${method.toUpperCase()}</span>${path}
        `;
        section.appendChild(endpointUrl);

        // Parámetros
        if (operation.parameters) {
            const paramsSection = this.generateParametersSection(operation.parameters);
            section.appendChild(paramsSection);
        }

        // Request body
        if (operation.requestBody) {
            const requestSection = this.generateRequestBodySection(operation.requestBody);
            section.appendChild(requestSection);
        }

        // Formulario interactivo tipo Swagger
        const interactiveForm = document.createElement('form');
        interactiveForm.className = 'interactive-endpoint-form';
        interactiveForm.style.margin = '20px 0';
        // Verificar si hay token SSO disponible
        const hasValidToken = this.getValidAccessToken() !== null;
        const tokenStatus = hasValidToken 
            ? `<div class="sso-token-indicator valid">🔑 Usando token SSO automáticamente</div>`
            : `<div class="sso-token-indicator invalid">⚠️ Token SSO no disponible - <a href="#sso">Obtener token</a></div>`;
        
        interactiveForm.innerHTML = `
            <h3 style="margin-bottom:10px">
                Probar endpoint 
                <span style="font-size:0.8em;color:#888">(Swagger Style)</span>
            </h3>
            ${this.config.security?.[0] ? tokenStatus : ''}
        `;

        // Inputs para parámetros
        const paramInputs = [];
        if (operation.parameters) {
            operation.parameters.forEach(param => {
                const inputDiv = document.createElement('div');
                inputDiv.style.marginBottom = '8px';
                inputDiv.innerHTML = `<label style="font-weight:bold">${param.name}${param.required ? ' *' : ''} (${param.in})</label><br>`;
                const input = document.createElement('input');
                input.type = 'text';
                input.name = param.name;
                input.placeholder = param.description || '';
                input.required = !!param.required;
                input.className = 'swagger-input';
                inputDiv.appendChild(input);
                paramInputs.push({ input, param });
                interactiveForm.appendChild(inputDiv);
            });
        }

        // Body (solo para POST/PUT/PATCH con requestBody)
        let bodyInput = null;
        let formFields = [];
        
        if (operation.requestBody && ['post','put','patch'].includes(method.toLowerCase())) {
            // Detectar tipo de contenido
            const contentTypes = Object.keys(operation.requestBody?.content || {});
            const isMultipartForm = contentTypes.some(type => type.includes('multipart/form-data'));
            
            if (isMultipartForm) {
                // Generar campos de formulario multipart
                const formDiv = document.createElement('div');
                formDiv.style.marginBottom = '8px';
                formDiv.innerHTML = `<label style="font-weight:bold">Campos del Formulario</label><br>`;
                
                const schema = operation.requestBody.content['multipart/form-data']?.schema;
                if (schema && schema.properties) {
                    Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
                        const fieldDiv = document.createElement('div');
                        fieldDiv.style.marginBottom = '8px';
                        
                        const isRequired = schema.required?.includes(fieldName);
                        const isFile = fieldSchema.format === 'binary';
                        const hasEnum = fieldSchema.enum && fieldSchema.enum.length > 0;
                        
                        fieldDiv.innerHTML = `<label style="font-weight:bold">${fieldName}${isRequired ? ' *' : ''}</label><br>`;
                        
                        let input;
                        if (isFile) {
                            input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.json,.txt,.pdf,.doc,.docx,.png,.jpg,.jpeg';
                        } else if (hasEnum) {
                            input = document.createElement('select');
                            fieldSchema.enum.forEach(option => {
                                const optionElement = document.createElement('option');
                                optionElement.value = option;
                                optionElement.textContent = option;
                                input.appendChild(optionElement);
                            });
                        } else {
                            input = document.createElement('input');
                            input.type = 'text';
                        }
                        
                        input.name = fieldName;
                        input.required = isRequired;
                        input.className = 'swagger-input';
                        input.placeholder = fieldSchema.description || '';
                        fieldDiv.appendChild(input);
                        formDiv.appendChild(fieldDiv);
                        
                        formFields.push({ input, fieldName, isFile, fieldSchema });
                    });
                }
                
                interactiveForm.appendChild(formDiv);
            } else {
                // Formulario JSON tradicional
                const bodyDiv = document.createElement('div');
                bodyDiv.style.marginBottom = '8px';
                bodyDiv.innerHTML = `<label style="font-weight:bold">Body (JSON)</label><br>`;
                bodyInput = document.createElement('textarea');
                bodyInput.name = 'body';
                bodyInput.rows = 5;
                bodyInput.style.width = '100%';
                bodyInput.placeholder = '{\n  "key": "value"\n}';
                bodyInput.className = 'swagger-input';
                bodyDiv.appendChild(bodyInput);
                interactiveForm.appendChild(bodyDiv);
            }
        }

        // Botón para enviar
        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.textContent = 'Probar';
        submitBtn.className = 'swagger-try-btn';
        submitBtn.style.marginTop = '10px';
        interactiveForm.appendChild(submitBtn);

        // Área para mostrar respuesta
        const responseArea = document.createElement('pre');
        responseArea.className = 'swagger-response-area';
        responseArea.style.background = '#f6f8fa';
        responseArea.style.border = '1px solid #ddd';
        responseArea.style.padding = '10px';
        responseArea.style.marginTop = '15px';
        responseArea.style.display = 'none';
        interactiveForm.appendChild(responseArea);

        // Evento submit
        interactiveForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            responseArea.style.display = 'block';
            responseArea.textContent = 'Enviando...';

            // Barra superior para código y tiempo
            let statusBar = interactiveForm.querySelector('.swagger-status-bar');
            if (!statusBar) {
                statusBar = document.createElement('div');
                statusBar.className = 'swagger-status-bar';
                statusBar.style.display = 'none';
                statusBar.style.marginBottom = '8px';
                statusBar.style.padding = '10px 16px';
                statusBar.style.background = '#f3f4f6';
                statusBar.style.border = '1px solid #e5e7eb';
                statusBar.style.borderRadius = '6px';
                statusBar.style.fontWeight = 'bold';
                statusBar.style.fontSize = '1.05em';
                statusBar.style.color = '#222';
                interactiveForm.insertBefore(statusBar, responseArea);
            }

            // ...existing code...
            // Construir URL con parámetros de path y query
            let url = (this.config.servers?.[0]?.url || '') + path;
            let queryParams = [];
            let pathParams = {};
            paramInputs.forEach(({ input, param }) => {
                if (param.in === 'path') {
                    pathParams[param.name] = input.value;
                } else if (param.in === 'query') {
                    if (input.value) queryParams.push(`${encodeURIComponent(param.name)}=${encodeURIComponent(input.value)}`);
                }
            });
            url = url.replace(/{([^}]+)}/g, (_, key) => pathParams[key] || `{${key}}`);
            if (queryParams.length) url += '?' + queryParams.join('&');

            // Detectar si es multipart
            const contentTypes = Object.keys(operation.requestBody?.content || {});
            const isMultipartForm = contentTypes.some(type => type.includes('multipart/form-data'));
            
            const fetchOptions = {
                method: method.toUpperCase(),
                headers: {}
            };
            
            if (isMultipartForm && formFields.length > 0) {
                // Usar FormData para multipart
                const formData = new FormData();
                
                formFields.forEach(({ input, fieldName, isFile }) => {
                    if (isFile && input.files && input.files[0]) {
                        formData.append(fieldName, input.files[0]);
                    } else if (!isFile && input.value) {
                        formData.append(fieldName, input.value);
                    }
                });
                
                fetchOptions.body = formData;
                // No establecer Content-Type para multipart, el navegador lo hace automáticamente
            } else if (bodyInput && bodyInput.value) {
                // JSON tradicional
                fetchOptions.headers['Content-Type'] = 'application/json';
                try {
                    fetchOptions.body = bodyInput.value;
                } catch (err) {
                    responseArea.textContent = 'Error en el body JSON: ' + err.message;
                    return;
                }
            }
            // Agregar Authorization header si hay configuración de seguridad
            if (this.config.security?.[0]) {
                const accessToken = this.getValidAccessToken();
                if (accessToken) {
                    fetchOptions.headers['Authorization'] = `Bearer ${accessToken}`;
                } else {
                    fetchOptions.headers['Authorization'] = 'Bearer {access_token}';
                    // Mostrar advertencia en la respuesta
                    responseArea.textContent = '⚠️ Token SSO no disponible o expirado. Obtenga un nuevo token en la sección SSO.';
                    responseArea.style.color = '#f59e0b';
                    return;
                }
            }

            const startTime = performance.now();
            try {
                const res = await fetch(url, fetchOptions);
                const endTime = performance.now();
                const elapsed = (endTime - startTime).toFixed(2);
                const text = await res.text();
                let json;
                let output = '';
                // Mostrar código y tiempo en barra superior
                statusBar.style.display = 'block';
                statusBar.innerHTML = `<span style="color:#2563eb">HTTP ${res.status}</span> <span style="margin-left:18px;color:#555">${res.statusText}</span> <span style="margin-left:28px;color:#388e3c">${elapsed} ms</span>`;
                try {
                    json = JSON.parse(text);
                    output += JSON.stringify(json, null, 2);
                } catch {
                    output += text;
                }
                responseArea.textContent = output;
                if (!res.ok) {
                    output += `\n\nDetalles del error:\n`;
                    try {
                        const errorJson = JSON.parse(text);
                        output += JSON.stringify(errorJson, null, 2);
                    } catch {
                        output += text;
                    }
                    responseArea.textContent = output;
                }
            } catch (err) {
                statusBar.style.display = 'block';
                statusBar.innerHTML = `<span style='color:#d32f2f'>Error</span>`;
                let errorMsg = `Error: ${err.message}`;
                if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                    errorMsg += '\n\nPosible error de CORS o el endpoint no está disponible desde el navegador.';
                }
                responseArea.textContent = errorMsg;
            }
        });

        section.appendChild(interactiveForm);
        mainContent.appendChild(section);
    }

    /**
     * Genera sección de parámetros
     */
    generateParametersSection(parameters) {
        const section = document.createElement('section');
        section.className = 'section';
        
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = 'Parámetros';
        section.appendChild(title);

        const paramsList = document.createElement('div');
        paramsList.className = 'parameters-list';

        const paramItem = document.createElement('div');
        paramItem.className = 'parameter-item tree-root';

        const contentId = this.generateUniqueId('params-section');
        const toggle = document.createElement('div');
        toggle.className = 'tree-toggle expanded';
        toggle.setAttribute('data-target', contentId);
        toggle.innerHTML = `
            <span class="toggle-icon">−</span>
            <span class="toggle-text">Ocultar propiedades</span>
        `;
        paramItem.appendChild(toggle);

        const content = document.createElement('div');
        content.className = 'tree-content expanded';
        content.style.display = 'block';
        content.id = contentId;

        parameters.forEach(param => {
            const paramDiv = document.createElement('div');
            paramDiv.className = 'parameter-item tree-level-1';
            
            const header = document.createElement('div');
            header.className = 'parameter-header';
            header.innerHTML = `
                <span class="parameter-name">${param.name}</span>
                <span class="parameter-type">${param.schema?.type || 'string'}</span>
                <span class="parameter-badge ${param.required ? 'required' : 'optional'}">
                    ${param.required ? 'requerido' : 'opcional'}
                </span>
            `;
            paramDiv.appendChild(header);

            if (param.description) {
                const desc = document.createElement('div');
                desc.className = 'parameter-description';
                desc.textContent = param.description;
                paramDiv.appendChild(desc);
            }

            content.appendChild(paramDiv);
        });

        paramItem.appendChild(content);
        paramsList.appendChild(paramItem);
        section.appendChild(paramsList);

        return section;
    }

    /**
     * Genera sección de request body
     */
    generateRequestBodySection(requestBody) {
        const section = document.createElement('section');
        section.className = 'section';
        
        // Detectar tipo de contenido
        const contentTypes = Object.keys(requestBody?.content || {});
        const isMultipartForm = contentTypes.some(type => type.includes('multipart/form-data'));
        const isJsonBody = contentTypes.some(type => type.includes('application/json'));
        
        const title = document.createElement('h2');
        title.className = 'section-title';
        if (isMultipartForm) {
            title.textContent = 'Campos del Formulario (Multipart)';
        } else {
            title.textContent = 'Parámetros del Body (JSON)';
        }
        section.appendChild(title);

        const paramsList = document.createElement('div');
        paramsList.className = 'parameters-list';

        const paramItem = document.createElement('div');
        paramItem.className = 'parameter-item tree-root';

        const contentId = this.generateUniqueId('request-body-params');
        const toggle = document.createElement('div');
        toggle.className = 'tree-toggle expanded';
        toggle.setAttribute('data-target', contentId);
        toggle.innerHTML = `
            <span class="toggle-icon">−</span>
            <span class="toggle-text">Ocultar propiedades</span>
        `;
        paramItem.appendChild(toggle);

        const content = document.createElement('div');
        content.className = 'tree-content expanded';
        content.style.display = 'block';
        content.id = contentId;

        // Obtener el schema del request body
        let schema = null;
        if (isMultipartForm) {
            schema = requestBody?.content?.['multipart/form-data']?.schema;
        } else if (isJsonBody) {
            schema = requestBody?.content?.['application/json']?.schema;
        }

        if (schema && schema.properties) {
            if (isMultipartForm) {
                this.generateMultipartFormProperties(content, schema, 1);
            } else {
                this.generateSchemaProperties(content, schema, 1);
            }
        }

        paramItem.appendChild(content);
        paramsList.appendChild(paramItem);
        section.appendChild(paramsList);

        return section;
    }

    /**
     * Genera propiedades específicas para formularios multipart
     */
    generateMultipartFormProperties(container, schema, level = 1) {
        if (!schema.properties) return;

        Object.entries(schema.properties).forEach(([propName, propSchema]) => {
            const paramDiv = document.createElement('div');
            paramDiv.className = `parameter-item tree-level-${level}`;
            
            const header = document.createElement('div');
            header.className = 'parameter-header';
            
            const isRequired = schema.required?.includes(propName);
            const type = propSchema.format === 'binary' ? 'file' : (propSchema.type || 'string');
            
            header.innerHTML = `
                <span class="parameter-name">${propName}</span>
                <span class="parameter-type">${type}</span>
                <span class="parameter-badge ${isRequired ? 'required' : 'optional'}">
                    ${isRequired ? 'requerido' : 'opcional'}
                </span>
            `;
            paramDiv.appendChild(header);

            if (propSchema.description) {
                const desc = document.createElement('div');
                desc.className = 'parameter-description';
                desc.textContent = propSchema.description;
                paramDiv.appendChild(desc);
            }

            container.appendChild(paramDiv);
        });
    }

    /**
     * Genera propiedades de un schema
     */
    generateSchemaProperties(container, schema, level = 1) {
        if (!schema.properties) return;

        Object.entries(schema.properties).forEach(([propName, propSchema]) => {
            const paramDiv = document.createElement('div');
            paramDiv.className = `parameter-item tree-level-${level}`;
            
            const header = document.createElement('div');
            header.className = 'parameter-header';
            
            const isRequired = schema.required?.includes(propName);
            const type = propSchema.type || 'string';
            
            header.innerHTML = `
                <span class="parameter-name">${propName}</span>
                <span class="parameter-type">${type}</span>
                <span class="parameter-badge ${isRequired ? 'required' : 'optional'}">
                    ${isRequired ? 'requerido' : 'opcional'}
                </span>
            `;
            paramDiv.appendChild(header);

            if (propSchema.description) {
                const desc = document.createElement('div');
                desc.className = 'parameter-description';
                desc.textContent = propSchema.description;
                paramDiv.appendChild(desc);
            }

            // Si tiene propiedades anidadas
            if (propSchema.properties) {
                const nestedId = `${propName}-props-${level}`;
                const nestedToggle = document.createElement('div');
                nestedToggle.className = 'tree-toggle expanded';
                nestedToggle.setAttribute('data-target', nestedId);
                nestedToggle.innerHTML = `
                    <span class="toggle-icon">−</span>
                    <span class="toggle-text">Ocultar propiedades de ${propName}</span>
                `;
                paramDiv.appendChild(nestedToggle);

                const nestedContent = document.createElement('div');
                nestedContent.className = 'tree-content expanded';
                nestedContent.id = nestedId;
                nestedContent.style.display = 'block';
                this.generateSchemaProperties(nestedContent, propSchema, level + 1);
                paramDiv.appendChild(nestedContent);
            }

            // Si es un array con items
            if (propSchema.type === 'array' && propSchema.items) {
                const arrayNote = document.createElement('div');
                arrayNote.className = 'parameter-note';
                arrayNote.textContent = `Array de ${propSchema.items.type || 'objetos'}`;
                paramDiv.appendChild(arrayNote);

                if (propSchema.items.properties) {
                    const arrayId = `${propName}-items-${level}`;
                    const arrayToggle = document.createElement('div');
                    arrayToggle.className = 'tree-toggle expanded';
                    arrayToggle.setAttribute('data-target', arrayId);
                    arrayToggle.innerHTML = `
                        <span class="toggle-icon">−</span>
                        <span class="toggle-text">Ocultar propiedades de ${propName} items</span>
                    `;
                    paramDiv.appendChild(arrayToggle);

                    const arrayContent = document.createElement('div');
                    arrayContent.className = 'tree-content expanded';
                    arrayContent.id = arrayId;
                    arrayContent.style.display = 'block';
                    this.generateSchemaProperties(arrayContent, propSchema.items, level + 1);
                    paramDiv.appendChild(arrayContent);
                }
            }

            container.appendChild(paramDiv);
        });
    }

    /**
     * Genera el sidebar de código
     */
    generateCodeSidebar() {
        const codeSidebar = document.querySelector('.code-sidebar');
        if (!codeSidebar) return;

        // Limpiar contenido existente excepto las secciones fijas
        const existingSections = codeSidebar.querySelectorAll('.section-urls, .request-section, .response-section');
        existingSections.forEach(section => section.remove());

        // Generar lista de servicios (section-urls)
        this.generateServicesList(codeSidebar);

        // Generar ejemplos de código para cada endpoint
        Object.entries(this.config.paths || {}).forEach(([path, methods]) => {
            Object.entries(methods).forEach(([method, operation]) => {
                this.generateCodeExample(codeSidebar, path, method, operation);
            });
        });
    }

    /**
     * Genera la lista de servicios web (section-urls)
     */
    generateServicesList(codeSidebar) {
        const servicesSection = document.createElement('div');
        servicesSection.className = 'section-urls';
        servicesSection.style.marginTop = '50px';

        // Header de la sección
        const header = document.createElement('div');
        header.className = 'response-header';
        header.innerHTML = '<span class="response-text">Servicios web</span>';
        servicesSection.appendChild(header);

        // Contenido de la sección
        const content = document.createElement('div');
        content.className = 'response-content';

        // Agrupar endpoints por tags para mejor organización
        const groupedEndpoints = this.groupEndpointsByTags();

        Object.entries(groupedEndpoints).forEach(([tag, endpoints]) => {
            // Si hay múltiples tags, agregar separador visual
            /*if (Object.keys(groupedEndpoints).length > 1 && tag !== 'General') {
                const separator = document.createElement('div');
                separator.style.cssText = 'margin: 20px 0 10px 0; padding: 5px 0; border-top: 1px solid #eee; font-size: 12px; color: #666; font-weight: bold;';
                separator.textContent = tag;
                content.appendChild(separator);
            }*/

            endpoints.forEach(({ path, method, operation }) => {
                // Acción del servicio
                const actionDiv = document.createElement('div');
                actionDiv.className = 'status-action';
                
                const actionSpan = document.createElement('span');
                actionSpan.className = 'http-method';
                actionSpan.textContent = operation.summary || `${method.toUpperCase()} ${path}`;
                actionDiv.appendChild(actionSpan);
                
                content.appendChild(actionDiv);

                // Línea de estado con método y path
                const statusLine = document.createElement('div');
                statusLine.className = 'response-status-line';
                
                const methodTag = document.createElement('span');
                methodTag.className = `method-tag method-${method.toLowerCase()}`;
                methodTag.textContent = method.toUpperCase();
                
                const statusText = document.createElement('span');
                statusText.className = 'status-text';
                statusText.textContent = this.formatPathForDisplay(path, operation);
                
                statusLine.appendChild(methodTag);
                statusLine.appendChild(statusText);
                content.appendChild(statusLine);
            });
        });

        servicesSection.appendChild(content);
        codeSidebar.appendChild(servicesSection);
    }

    /**
     * Agrupa endpoints por tags para la sección de servicios
     */
    groupEndpointsByTags() {
        const grouped = {};
        
        Object.entries(this.config.paths || {}).forEach(([path, methods]) => {
            Object.entries(methods).forEach(([method, operation]) => {
                const tag = operation.tags?.[0] || 'General';
                if (!grouped[tag]) {
                    grouped[tag] = [];
                }
                grouped[tag].push({ path, method, operation });
            });
        });

        return grouped;
    }

    /**
     * Formatea el path para mostrar en la lista de servicios
     */
    formatPathForDisplay(path, operation) {
        // Para endpoints PATCH con múltiples opciones, mostrar información adicional
        if (operation.requestBody?.content?.['application/json']?.schema?.properties?.option) {
            const optionSchema = operation.requestBody.content['application/json'].schema.properties.option;
            
            if (optionSchema.enum && optionSchema.enum.length > 1) {
                // Si hay múltiples opciones, mostrar que es configurable
                return `${path} (option: configurable)`;
            } else if (optionSchema.enum && optionSchema.enum.length === 1) {
                // Si hay una sola opción, mostrarla
                return `${path} (option: "${optionSchema.enum[0]}")`;
            }
        }
        
        // Para endpoints con parámetros de path, mostrar formato más claro
        if (path.includes('{') && path.includes('}')) {
            return path.replace(/{([^}]+)}/g, '{$1}');
        }
        
        return path;
    }

    /**
     * Genera ejemplo de código para un endpoint
     */
    generateCodeExample(codeSidebar, path, method, operation) {
        const operationId = this.generateOperationId(path, method);
        
        // Request section
        const requestSection = document.createElement('div');
        requestSection.className = 'request-section';
        requestSection.id = `${operationId}-request`;

        // Endpoint header
        const endpointHeader = document.createElement('div');
        endpointHeader.className = 'endpoint-header';
        endpointHeader.innerHTML = `
            <span class="method-tag method-${method.toLowerCase()}">${method.toUpperCase()}</span>
            <span class="endpoint-url">${path}</span>
        `;
        requestSection.appendChild(endpointHeader);


        // Language selector with tabs
        const langSelector = document.createElement('div');
        langSelector.className = 'code-language-selector';
        langSelector.innerHTML = `
            <button class="lang-tab active" data-lang="curl">cURL</button>
            <button class="lang-tab" data-lang="js">JavaScript</button>
            <button class="lang-tab" data-lang="python">Python</button>
            <button class="lang-tab" data-lang="go">Go</button>
            <button class="lang-tab" data-lang="node">Node.js</button>
            <div class="copy-button" title="Copiar"><img src="https://ordershub-s3.s3.us-east-1.amazonaws.com/docs/copy.png" width="15"></div>
        `;
        requestSection.appendChild(langSelector);

        // Code blocks for each language
        const codeBlock = document.createElement('div');
        codeBlock.className = 'code-block';

        const curlBlock = this.generateCurlExample(path, method, operation);
        console.log('🔍 curlBlock generated:', curlBlock);
        console.log('🔍 curlBlock is null?', curlBlock === null);
        console.log('🔍 curlBlock content:', curlBlock?.innerHTML?.substring(0, 100));
        
        if (curlBlock) {
            curlBlock.classList.add('code-content', 'active');
            curlBlock.setAttribute('data-lang', 'curl');
            codeBlock.appendChild(curlBlock);
            console.log('✅ cURL block added to codeBlock');
        } else {
            console.error('❌ curlBlock is null! Cannot add to DOM');
        }

        const jsBlock = this.generateJSExample(path, method, operation);
        jsBlock.classList.add('code-content');
        jsBlock.setAttribute('data-lang', 'js');
        codeBlock.appendChild(jsBlock);

        const pythonBlock = this.generatePythonExample(path, method, operation);
        pythonBlock.classList.add('code-content');
        pythonBlock.setAttribute('data-lang', 'python');
        codeBlock.appendChild(pythonBlock);

        const goBlock = this.generateGoExample(path, method, operation);
        goBlock.classList.add('code-content');
        goBlock.setAttribute('data-lang', 'go');
        codeBlock.appendChild(goBlock);

        const nodeBlock = this.generateNodeExample(path, method, operation);
        nodeBlock.classList.add('code-content');
        nodeBlock.setAttribute('data-lang', 'node');
        codeBlock.appendChild(nodeBlock);

        requestSection.appendChild(codeBlock);

        // Tab switching and copy functionality
        langSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('lang-tab')) {
                const lang = e.target.getAttribute('data-lang');
                console.log(`🔄 Switching to tab: ${lang}`);
                
                // Remove active from all tabs
                Array.from(langSelector.querySelectorAll('.lang-tab')).forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active to clicked tab
                e.target.classList.add('active');
                console.log(`✅ Tab activated: ${lang}`);
                
                // Switch code content
                const codeBlocks = Array.from(codeBlock.querySelectorAll('.code-content'));
                console.log(`📊 Found ${codeBlocks.length} code blocks`);
                
                codeBlocks.forEach((block, index) => {
                    const blockLang = block.getAttribute('data-lang');
                    const shouldBeActive = blockLang === lang;
                    
                    console.log(`Block ${index}: element=`, block);
                    console.log(`Block ${index}: lang="${blockLang}", shouldBeActive=${shouldBeActive}`);
                    console.log(`Block ${index}: is null?`, block === null);
                    console.log(`Block ${index}: className="${block?.className}"`);
                    
                    if (!block) {
                        console.error(`❌ Block ${index} is null!`);
                        return;
                    }
                    
                    // Remove active class
                    block.classList.remove('active');
                    
                    // Add active class if it matches
                    if (shouldBeActive) {
                        block.classList.add('active');
                        console.log(`✅ Activated block for ${blockLang}`);
                        
                        // Verify the block has content
                        const hasContent = block.children.length > 0 || block.textContent.trim().length > 0;
                        console.log(`📝 Block has content: ${hasContent}`);
                        console.log(`📝 Block children count: ${block.children.length}`);
                        console.log(`📝 Block textContent length: ${block.textContent.trim().length}`);
                        
                        if (hasContent && block.children.length > 0) {
                            console.log(`📄 Block content preview:`, block.innerHTML.substring(0, 100) + '...');
                        } else {
                            console.warn(`⚠️ Block ${blockLang} has no content!`);
                        }
                    }
                });
            }
            if (e.target.closest('.copy-button')) {
                const activeBlock = codeBlock.querySelector('.code-content.active');
                let code = '';
                if (activeBlock) {
                    code = Array.from(activeBlock.querySelectorAll('.code-text')).map(el => el.textContent).join('\n');
                }
                if (code) {
                    navigator.clipboard.writeText(code);
                }
            }
        });

        // Response section
        const responseSection = this.generateResponseExample(operationId, operation);

        codeSidebar.appendChild(requestSection);
        codeSidebar.appendChild(responseSection);
    }

    /**
     * Genera ejemplo cURL
     */
    generateCurlExample(path, method, operation) {
        console.log(`📝 Generating cURL example for ${method.toUpperCase()} ${path}`);
        
        const codeBlock = document.createElement('div');
        const baseUrl = this.config?.servers?.[0]?.url || 'https://api.example.com';
        
        let curlCommand = `curl -X ${method.toUpperCase()} "${baseUrl}${path}"`;

        // Headers
        if (this.config.security?.[0]) {
            const accessToken = this.getValidAccessToken();
            if (accessToken) {
                curlCommand += `\n  -H "Authorization: Bearer ${accessToken}"`;
            } else {
                curlCommand += '\n  -H "Authorization: Bearer {access_token}"';
            }
        }

        // Detectar tipo de contenido y generar body apropiado
        if (['post', 'put', 'patch'].includes(method.toLowerCase()) && operation.requestBody) {
            const contentTypes = Object.keys(operation.requestBody?.content || {});
            const isMultipartForm = contentTypes.some(type => type.includes('multipart/form-data'));
            
            if (isMultipartForm) {
                // No agregar Content-Type header para multipart (curl lo maneja automáticamente)
                const schema = operation.requestBody.content['multipart/form-data']?.schema;
                if (schema && schema.properties) {
                    // Generar campos del formulario multipart
                    Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
                        if (fieldSchema.format === 'binary') {
                            curlCommand += `\n  -F "${fieldName}=@/path/to/file"`;
                        } else if (fieldSchema.enum && fieldSchema.enum.length > 0) {
                            curlCommand += `\n  -F "${fieldName}=${fieldSchema.enum[0]}"`;
                        } else {
                            const exampleValue = fieldSchema.type === 'string' ? `"example_${fieldName}"` : 'example_value';
                            curlCommand += `\n  -F "${fieldName}=${exampleValue}"`;
                        }
                    });
                }
            } else {
                // Formulario JSON tradicional
                curlCommand += '\n  -H "Content-Type: application/json"';
                curlCommand += '\n  -d @/request.json';
            }
        }

        codeBlock.innerHTML = this.formatCodeBlock(curlCommand, 'curl');
        return codeBlock;
    }

    /**
     * Genera ejemplo JavaScript (fetch)
     */
    generateJSExample(path, method, operation) {
        const codeBlock = document.createElement('div');
        const baseUrl = this.config.servers?.[0]?.url || 'https://api.example.com';
        
        // Detectar tipo de contenido
        let isMultipartForm = false;
        let schema = null;
        if (['post', 'put', 'patch'].includes(method.toLowerCase()) && operation.requestBody) {
            const contentTypes = Object.keys(operation.requestBody?.content || {});
            isMultipartForm = contentTypes.some(type => type.includes('multipart/form-data'));
            schema = isMultipartForm ? 
                operation.requestBody.content['multipart/form-data']?.schema :
                operation.requestBody.content['application/json']?.schema;
        }
        
        let code = `fetch('${baseUrl}${path}', {\n    method: '${method.toUpperCase()}',\n    headers: {`;
        
        if (this.config.security?.[0]) {
            const accessToken = this.getValidAccessToken();
            if (accessToken) {
                code += `\n        'Authorization': 'Bearer ${accessToken}',`;
            } else {
                code += `\n        'Authorization': 'Bearer {access_token}',`;
            }
        }
        
        if (isMultipartForm) {
            code += `\n        // Content-Type será establecido automáticamente por el navegador`;
            code += `\n    },`;
            code += `\n    body: (() => {\n        const formData = new FormData();`;
            
            if (schema && schema.properties) {
                Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
                    if (fieldSchema.format === 'binary') {
                        code += `\n        formData.append('${fieldName}', fileInput.files[0]); // File input`;
                    } else if (fieldSchema.enum && fieldSchema.enum.length > 0) {
                        code += `\n        formData.append('${fieldName}', '${fieldSchema.enum[0]}');`;
                    } else {
                        const exampleValue = fieldSchema.type === 'string' ? `example_${fieldName}` : 'example_value';
                        code += `\n        formData.append('${fieldName}', '${exampleValue}');`;
                    }
                });
            }
            code += `\n        return formData;\n    })(),`;
        } else {
            code += `\n        'Content-Type': 'application/json',`;
            code += `\n    },`;
            if (['post', 'put', 'patch'].includes(method.toLowerCase()) && operation.requestBody) {
                code += `\n    body: JSON.stringify({ /* datos */ }),`;
            }
        }
        
        code += `\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error(error));`;
        codeBlock.innerHTML = this.formatCodeBlock(code, 'js');
        return codeBlock;
    }

    /**
     * Genera ejemplo Python (requests)
     */
    generatePythonExample(path, method, operation) {
        const baseUrl = this.config.servers?.[0]?.url || 'https://api.example.com';
        
        // Detectar tipo de contenido
        let isMultipartForm = false;
        let schema = null;
        if (['post', 'put', 'patch'].includes(method.toLowerCase()) && operation.requestBody) {
            const contentTypes = Object.keys(operation.requestBody?.content || {});
            isMultipartForm = contentTypes.some(type => type.includes('multipart/form-data'));
            schema = isMultipartForm ? 
                operation.requestBody.content['multipart/form-data']?.schema :
                operation.requestBody.content['application/json']?.schema;
        }
        
        let code = `import requests\n\nurl = '${baseUrl}${path}'\nheaders = {`;
        
        if (this.config.security?.[0]) {
            const accessToken = this.getValidAccessToken();
            if (accessToken) {
                code += `\n    'Authorization': 'Bearer ${accessToken}',`;
            } else {
                code += `\n    'Authorization': 'Bearer {access_token}',`;
            }
        }
        
        if (isMultipartForm) {
            code += `\n}\n\nfiles = {`;
            let dataFields = [];
            
            if (schema && schema.properties) {
                Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
                    if (fieldSchema.format === 'binary') {
                        code += `\n    '${fieldName}': open('/path/to/file', 'rb'),`;
                    } else if (fieldSchema.enum && fieldSchema.enum.length > 0) {
                        dataFields.push(`    '${fieldName}': '${fieldSchema.enum[0]}',`);
                    } else {
                        const exampleValue = fieldSchema.type === 'string' ? `example_${fieldName}` : 'example_value';
                        dataFields.push(`    '${fieldName}': '${exampleValue}',`);
                    }
                });
            }
            
            code += `\n}`;
            if (dataFields.length > 0) {
                code += `\n\ndata = {\n${dataFields.join('\n')}\n}`;
            }
            
            if (['post', 'put', 'patch'].includes(method.toLowerCase()) && operation.requestBody) {
                code += `\n\nresponse = requests.${method.toLowerCase()}(url, headers=headers, files=files${dataFields.length > 0 ? ', data=data' : ''})`;
            } else {
                code += `\n\nresponse = requests.${method.toLowerCase()}(url, headers=headers)`;
            }
        } else {
            code += `\n    'Content-Type': 'application/json',`;
            code += `\n}`;
            if (['post', 'put', 'patch'].includes(method.toLowerCase()) && operation.requestBody) {
                code += `\ndata = { # datos }\nresponse = requests.${method.toLowerCase()}(url, headers=headers, json=data)`;
            } else {
                code += `\nresponse = requests.${method.toLowerCase()}(url, headers=headers)`;
            }
        }
        
        code += `\nprint(response.json())`;
        const codeBlock = document.createElement('div');
        codeBlock.innerHTML = this.formatCodeBlock(code, 'python');
        return codeBlock;
    }

    /**
     * Genera ejemplo Go (net/http)
     */
    generateGoExample(path, method, operation) {
        const baseUrl = this.config.servers?.[0]?.url || 'https://api.example.com';
        
        // Detectar tipo de contenido
        let isMultipartForm = false;
        let schema = null;
        if (['post', 'put', 'patch'].includes(method.toLowerCase()) && operation.requestBody) {
            const contentTypes = Object.keys(operation.requestBody?.content || {});
            isMultipartForm = contentTypes.some(type => type.includes('multipart/form-data'));
            schema = isMultipartForm ? 
                operation.requestBody.content['multipart/form-data']?.schema :
                operation.requestBody.content['application/json']?.schema;
        }
        
        let code = `package main\n\nimport (\n    "bytes"\n    ${isMultipartForm ? '"mime/multipart"\n    "os"' : '"encoding/json"'}\n    "fmt"\n    "net/http"\n    "io/ioutil"\n)\n\nfunc main() {\n    url := "${baseUrl}${path}"\n    client := &http.Client{}\n    `;
        
        if (isMultipartForm) {
            code += `var buf bytes.Buffer\n    writer := multipart.NewWriter(&buf)\n    `;
            
            if (schema && schema.properties) {
                Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
                    if (fieldSchema.format === 'binary') {
                        code += `\n    // File field\n    file, err := os.Open("/path/to/file")\n    if err != nil {\n        panic(err)\n    }\n    defer file.Close()\n    fileWriter, _ := writer.CreateFormFile("${fieldName}", "filename")\n    io.Copy(fileWriter, file)`;
                    } else if (fieldSchema.enum && fieldSchema.enum.length > 0) {
                        code += `\n    writer.WriteField("${fieldName}", "${fieldSchema.enum[0]}")`;
                    } else {
                        const exampleValue = fieldSchema.type === 'string' ? `example_${fieldName}` : 'example_value';
                        code += `\n    writer.WriteField("${fieldName}", "${exampleValue}")`;
                    }
                });
            }
            
            code += `\n    writer.Close()\n    \n    req, err := http.NewRequest("${method.toUpperCase()}", url, &buf)\n    if err != nil {\n        panic(err)\n    }\n    req.Header.Set("Content-Type", writer.FormDataContentType())`;
        } else {
            code += `req, err := http.NewRequest("${method.toUpperCase()}", url, nil)\n    if err != nil {\n        panic(err)\n    }\n    req.Header.Set("Content-Type", "application/json")`;
            
            if (['post', 'put', 'patch'].includes(method.toLowerCase()) && operation.requestBody) {
                code += `\n    data := map[string]interface{}{ /* datos */ }\n    jsonData, _ := json.Marshal(data)\n    req.Body = ioutil.NopCloser(bytes.NewBuffer(jsonData))`;
            }
        }
        
        if (this.config.security?.[0]) {
            code += `\n    req.Header.Set("Authorization", "Bearer {access_token}")`;
        }
        
        code += `\n    resp, err := client.Do(req)\n    if err != nil {\n        panic(err)\n    }\n    defer resp.Body.Close()\n    fmt.Println(resp.Status)\n}`;
        
        const codeBlock = document.createElement('div');
        codeBlock.innerHTML = this.formatCodeBlock(code, 'go');
        return codeBlock;
    }

    /**
     * Genera ejemplo Node.js (axios)
     */
    generateNodeExample(path, method, operation) {
        const baseUrl = this.config.servers?.[0]?.url || 'https://api.example.com';
        
        // Detectar tipo de contenido
        let isMultipartForm = false;
        let schema = null;
        if (['post', 'put', 'patch'].includes(method.toLowerCase()) && operation.requestBody) {
            const contentTypes = Object.keys(operation.requestBody?.content || {});
            isMultipartForm = contentTypes.some(type => type.includes('multipart/form-data'));
            schema = isMultipartForm ? 
                operation.requestBody.content['multipart/form-data']?.schema :
                operation.requestBody.content['application/json']?.schema;
        }
        
        let code = `const axios = require('axios');\n${isMultipartForm ? 'const FormData = require(\'form-data\');\nconst fs = require(\'fs\');\n' : ''}\n`;
        
        if (isMultipartForm) {
            code += `const form = new FormData();\n`;
            
            if (schema && schema.properties) {
                Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
                    if (fieldSchema.format === 'binary') {
                        code += `form.append('${fieldName}', fs.createReadStream('/path/to/file'));\n`;
                    } else if (fieldSchema.enum && fieldSchema.enum.length > 0) {
                        code += `form.append('${fieldName}', '${fieldSchema.enum[0]}');\n`;
                    } else {
                        const exampleValue = fieldSchema.type === 'string' ? `example_${fieldName}` : 'example_value';
                        code += `form.append('${fieldName}', '${exampleValue}');\n`;
                    }
                });
            }
            
            code += `\naxios({\n    url: '${baseUrl}${path}',\n    method: '${method.toLowerCase()}',\n    headers: {\n        ...form.getHeaders(),`;
            
            if (this.config.security?.[0]) {
                code += `\n        'Authorization': 'Bearer {access_token}',`;
            }
            
            code += `\n    },\n    data: form,`;
        } else {
            code += `axios({\n    url: '${baseUrl}${path}',\n    method: '${method.toLowerCase()}',\n    headers: {\n        'Content-Type': 'application/json',`;
            
            if (this.config.security?.[0]) {
                code += `\n        'Authorization': 'Bearer {access_token}',`;
            }
            
            code += `\n    },`;
            
            if (['post', 'put', 'patch'].includes(method.toLowerCase()) && operation.requestBody) {
                code += `\n    data: { /* datos */ },`;
            }
        }
        
        code += `\n})\n.then(response => {\n    console.log(response.data);\n})\n.catch(error => {\n    console.error(error);\n});`;
        
        const codeBlock = document.createElement('div');
        codeBlock.innerHTML = this.formatCodeBlock(code, 'node');
        return codeBlock;
    }

    /**
     * Highlight code using Highlight.js
     */
    highlightSyntax(code, lang) {
        console.log(`🔍 highlightSyntax called with code length: ${code?.length}, lang: ${lang}`);
        
        if (!code || typeof code !== 'string') {
            console.log(`⚠️ highlightSyntax: invalid code input, returning empty string`);
            return '';
        }
        
        // Map our language names to Highlight.js language names
        const langMap = {
            'js': 'javascript',
            'javascript': 'javascript',
            'node': 'javascript',
            'python': 'python',
            'go': 'go',
            'curl': 'bash',
            'json': 'json'
        };
        
        const hljsLang = langMap[lang] || lang;
        console.log(`🔍 Mapped language: ${lang} → ${hljsLang}`);
        
        try {
            // Check if Highlight.js is available
            if (typeof window === 'undefined') {
                console.warn('⚠️ Window object not available');
                return code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }
            
            if (!window.hljs) {
                console.warn('⚠️ Highlight.js not loaded on window');
                return code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }
            
            if (!window.hljs.highlight) {
                console.warn('⚠️ Highlight.js highlight function not available');
                return code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }
            
            // Use Highlight.js to highlight the code
            console.log(`🔍 Calling hljs.highlight with language: ${hljsLang}`);
            const result = window.hljs.highlight(code, { language: hljsLang });
            console.log(`🔍 hljs.highlight result:`, result);
            console.log(`🔍 hljs.highlight result.value:`, result?.value);
            
            return result?.value || code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        } catch (error) {
            console.warn('❌ Error highlighting code:', error);
            console.log('🔧 Falling back to escaped HTML');
            return code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
    }

    /**
     * Formatea el bloque de código para mostrarlo con líneas y estilos
     */
    formatCodeBlock(code, lang) {
        if (!code || typeof code !== 'string') {
            return '<div class="code-line"><span class="line-number">1</span><span class="code-text">// No code available</span></div>';
        }
        
        // Highlight the entire code block at once (more efficient for Highlight.js)
        const highlightedCode = this.highlightSyntax(code, lang);
        
        // Split the highlighted code into lines
        const lines = highlightedCode.split('\n');
        
        const formattedLines = lines.map((line, idx) => {
            return `<div class="code-line"><span class="line-number">${idx + 1}</span><span class="code-text">${line}</span></div>`;
        });
        
        return formattedLines.join('');
    }

    /**
     * Formatea una línea de cURL (usando Highlight.js)
     */
    formatCurlLine(line) {
        console.log(`🔍 formatCurlLine called with:`, line);
        
        if (!line || typeof line !== 'string') {
            console.log(`⚠️ formatCurlLine: invalid input, returning empty string`);
            return '';
        }
        
        const result = this.highlightSyntax(line, 'bash');
        console.log(`🔍 formatCurlLine result:`, result);
        console.log(`🔍 formatCurlLine result is null?`, result === null);
        
        return result || line; // Fallback to original line if highlighting fails
    }

    /**
     * Genera ejemplo de respuesta
     */
    generateResponseExample(operationId, operation) {
        // Verificar si hay ejemplos definidos en la operación
        if (!this.hasResponseExamples(operation)) {
            // Si no hay ejemplos, retornar un div vacío o null
            const emptySection = document.createElement('div');
            emptySection.style.display = 'none';
            return emptySection;
        }

        const responseSection = document.createElement('div');
        responseSection.className = 'response-section';
        responseSection.id = `${operationId}-response`;

        const header = document.createElement('div');
        header.className = 'response-header';
        header.innerHTML = `
            <span class="response-text">Response</span>
            <span class="response-format">JSON</span>
        `;
        responseSection.appendChild(header);

        const content = document.createElement('div');
        content.className = 'response-content';

        // Status line
        const statusLine = document.createElement('div');
        statusLine.className = 'response-status-line';
        statusLine.innerHTML = `
            <span class="line-number">1</span>
            <span class="status-text">HTTP/1.1 200 OK</span>
        `;
        content.appendChild(statusLine);

        // JSON response
        const jsonResponse = this.generateJSONResponse(operation);
        content.appendChild(jsonResponse);

        responseSection.appendChild(content);
        return responseSection;
    }

    /**
     * Verifica si la operación tiene ejemplos de respuesta definidos
     */
    hasResponseExamples(operation) {
        if (!operation || !operation.responses) {
            return false;
        }

        // Buscar ejemplos en todas las respuestas
        for (const [statusCode, response] of Object.entries(operation.responses)) {
            if (response.content) {
                for (const [mediaType, mediaContent] of Object.entries(response.content)) {
                    // Verificar si hay ejemplos múltiples
                    if (mediaContent.examples && Object.keys(mediaContent.examples).length > 0) {
                        return true;
                    }
                    // Verificar si hay un ejemplo singular
                    if (mediaContent.example !== undefined) {
                        return true;
                    }
                    // Verificar si hay ejemplos en el schema
                    if (mediaContent.schema && mediaContent.schema.example !== undefined) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Genera respuesta JSON de ejemplo
     */
    generateJSONResponse(operation) {
        const jsonResponse = document.createElement('div');
        jsonResponse.className = 'json-response';

        // Ejemplo básico de respuesta
        const exampleResponse = {
            data: {
                message: "Operation completed successfully",
                id: "12345"
            },
            metadata: {
                message: "success",
                http_code: 200,
                status: "ok",
                date_time: new Date().toISOString()
            }
        };

        const jsonString = JSON.stringify(exampleResponse, null, 2);
        const lines = jsonString.split('\n');

        lines.forEach((line, index) => {
            const jsonLine = document.createElement('div');
            jsonLine.className = 'json-line';
            
            const lineNumber = document.createElement('span');
            lineNumber.className = 'line-number';
            lineNumber.textContent = index + 2;
            
            const jsonContent = document.createElement('span');
            jsonContent.className = 'json-content';
            jsonContent.innerHTML = this.formatJSONLine(line);
            
            jsonLine.appendChild(lineNumber);
            jsonLine.appendChild(jsonContent);
            jsonResponse.appendChild(jsonLine);
        });

        return jsonResponse;
    }

    /**
     * Formatea una línea JSON
     */
    formatJSONLine(line) {
        // Crear un elemento temporal para manipular el HTML de forma segura
        const tempDiv = document.createElement('div');
        tempDiv.textContent = line;
        let htmlContent = tempDiv.innerHTML;
        
        // Aplicar transformaciones de forma segura
        htmlContent = htmlContent
            .replace(/&quot;([^&]+)&quot;:\s*&quot;([^&]+)&quot;/g, '<span class="json-key">&quot;$1&quot;</span>: <span class="json-string">&quot;$2&quot;</span>')
            .replace(/&quot;([^&]+)&quot;:\s*(\d+)/g, '<span class="json-key">&quot;$1&quot;</span>: <span class="json-number">$2</span>')
            .replace(/&quot;([^&]+)&quot;:\s*{/g, '<span class="json-key">&quot;$1&quot;</span>: {')
            .replace(/:\s*\[/g, ': [');
        
        return htmlContent;
    }

    /**
     * Métodos auxiliares
     */
    generateOperationId(path, method) {
        return `${method.toLowerCase()}-${path.replace(/[^a-zA-Z0-9]/g, '-')}`;
    }

    groupPathsByTags() {
        const grouped = {};
        
        Object.entries(this.config.paths || {}).forEach(([path, methods]) => {
            Object.entries(methods).forEach(([method, operation]) => {
                const tag = operation.tags?.[0] || 'General';
                if (!grouped[tag]) {
                    grouped[tag] = [];
                }
                grouped[tag].push({ path, method, operation });
            });
        });

        return grouped;
    }

    createSection(id, title, description = '') {
        const section = document.createElement('section');
        section.id = id;
        section.className = 'section';

        const titleEl = document.createElement('h2');
        titleEl.className = 'section-title';
        titleEl.textContent = title;
        section.appendChild(titleEl);

        if (description) {
            const descEl = document.createElement('p');
            descEl.className = 'description';
            descEl.textContent = description;
            section.appendChild(descEl);
        }

        return section;
    }

    generateAuthDescription() {
        const securityScheme = this.config.security?.[0];
        if (!securityScheme) return '';

        return 'Todas las solicitudes requieren autenticación mediante token de acceso válido.';
    }

    generateStatusCodesSection() {
        const section = document.createElement('section');
        section.id = 'status-codes';
        section.className = 'section';
        
        const header = document.createElement('div');
        header.className = 'section-header';
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = 'Códigos de Estado y Error';
        header.appendChild(title);
        section.appendChild(header);

        const description = document.createElement('p');
        description.className = 'section-description';
        description.style.marginBottom = '30px';
        description.textContent = 'Todas las consultas de la API devuelven códigos de estado HTTP que pueden proporcionar más información sobre la respuesta.';
        section.appendChild(description);

        // Códigos de éxito
        const successSection = document.createElement('section');
        successSection.id = 'success-codes';
        successSection.className = 'section';
        
        const successTitle = document.createElement('h3');
        successTitle.className = 'subsection-title';
        successTitle.textContent = 'Códigos de Éxito (2xx)';
        successSection.appendChild(successTitle);

        const successCodes = [
            { code: '200', title: 'OK', description: 'La solicitud fue exitosa. El recurso solicitado se ha obtenido y transmitido en el cuerpo de la respuesta.' },
            { code: '201', title: 'Created', description: 'La solicitud fue exitosa y se ha creado un nuevo recurso como resultado.' },
            { code: '204', title: 'No Content', description: 'La solicitud fue exitosa pero no hay contenido que devolver. Típicamente usado para operaciones de eliminación.' }
        ];

        successCodes.forEach(statusCode => {
            const statusItem = this.createStatusCodeItem(statusCode, 'success');
            successSection.appendChild(statusItem);
        });

        section.appendChild(successSection);

        // Códigos de error del cliente
        const clientErrorSection = document.createElement('section');
        clientErrorSection.id = 'client-error-codes';
        clientErrorSection.className = 'section';
        
        const clientErrorTitle = document.createElement('h3');
        clientErrorTitle.className = 'subsection-title';
        clientErrorTitle.textContent = 'Errores del Cliente (4xx)';
        clientErrorSection.appendChild(clientErrorTitle);

        const clientErrorCodes = [
            { code: '400', title: 'Bad Request', description: 'La solicitud contiene sintaxis incorrecta o no puede ser procesada. Revisa los parámetros enviados.' },
            { code: '401', title: 'Unauthorized', description: 'El cliente no tiene las credenciales de autenticación correctas. Verifica tu token de acceso.' },
            { code: '403', title: 'Forbidden', description: 'El servidor se niega a responder. Típicamente causado por permisos de acceso incorrectos.' },
            { code: '404', title: 'Not Found', description: 'El recurso solicitado no fue encontrado pero podría estar disponible nuevamente en el futuro.' },
            { code: '422', title: 'Unprocessable Entity', description: 'El cuerpo de la solicitud contiene errores semánticos. Típicamente causado por formato incorrecto, campos requeridos omitidos, o errores lógicos.' },
            { code: '429', title: 'Too Many Requests', description: 'El cliente ha excedido el límite de velocidad. Implementa un retraso antes de reintentar.' }
        ];

        clientErrorCodes.forEach(statusCode => {
            const statusItem = this.createStatusCodeItem(statusCode, 'error');
            clientErrorSection.appendChild(statusItem);
        });

        section.appendChild(clientErrorSection);

        return section;
    }

    /**
     * Genera la sección de diagnóstico CORS
     */
    generateCORSDiagnosticsSection() {
        const section = document.createElement('section');
        section.id = 'cors-diagnostics';
        section.className = 'section';
        
        const header = document.createElement('div');
        header.className = 'section-header';
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = 'Diagnóstico CORS';
        header.appendChild(title);
        section.appendChild(header);

        const description = document.createElement('p');
        description.className = 'section-description';
        description.style.marginBottom = '30px';
        description.textContent = 'Verifica la configuración CORS de todos los endpoints de la API para identificar problemas de acceso desde diferentes dominios.';
        section.appendChild(description);

        // Botón para ejecutar diagnóstico
        const diagnosticButton = document.createElement('button');
        diagnosticButton.className = 'cors-diagnostic-btn';
        diagnosticButton.textContent = '🔍 Ejecutar Diagnóstico CORS';
        diagnosticButton.style.cssText = `
            background: #10b981;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 20px;
        `;
        
        diagnosticButton.addEventListener('mouseover', () => {
            diagnosticButton.style.background = '#059669';
        });
        
        diagnosticButton.addEventListener('mouseout', () => {
            diagnosticButton.style.background = '#10b981';
        });

        section.appendChild(diagnosticButton);

        // Contenedor de resultados
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'cors-results';
        resultsContainer.className = 'cors-results-container';
        resultsContainer.style.display = 'none';
        section.appendChild(resultsContainer);

        // Event listener para el botón
        diagnosticButton.addEventListener('click', () => {
            this.executeCORSDiagnostic(diagnosticButton, resultsContainer);
        });

        return section;
    }

    /**
     * Ejecuta el diagnóstico CORS en todos los endpoints
     */
    async executeCORSDiagnostic(button, container) {
        // Cambiar estado del botón
        const originalText = button.textContent;
        button.textContent = '⏳ Ejecutando diagnóstico...';
        button.disabled = true;
        button.style.background = '#6b7280';

        // Limpiar resultados anteriores
        container.innerHTML = '';
        container.style.display = 'block';

        // Obtener todos los endpoints
        const endpoints = this.getAllEndpoints();
        
        const results = [];
        
        // Crear indicador de progreso
        const progressContainer = document.createElement('div');
        progressContainer.className = 'cors-progress';
        progressContainer.innerHTML = `
            <div class="progress-header">
                <h4>Probando endpoints CORS...</h4>
                <span class="progress-counter">0 / ${endpoints.length}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        `;
        container.appendChild(progressContainer);

        let completed = 0;

        // Probar cada endpoint
        for (const endpoint of endpoints) {
            const result = await this.testCORSForEndpoint(endpoint);
            results.push(result);
            
            completed++;
            const progress = (completed / endpoints.length) * 100;
            
            // Actualizar progreso
            const counter = progressContainer.querySelector('.progress-counter');
            const fill = progressContainer.querySelector('.progress-fill');
            counter.textContent = `${completed} / ${endpoints.length}`;
            fill.style.width = `${progress}%`;
        }

        // Mostrar resultados
        this.displayCORSResults(container, results);

        // Restaurar botón
        button.textContent = originalText;
        button.disabled = false;
        button.style.background = '#10b981';
        
        // Ocultar progreso
        progressContainer.style.display = 'none';
    }

    /**
     * Obtiene todos los endpoints de la API
     */
    getAllEndpoints() {
        const endpoints = [];
        const baseUrl = this.config.servers?.[0]?.url || 'https://api.example.com';
        
        Object.entries(this.config.paths || {}).forEach(([path, methods]) => {
            Object.entries(methods).forEach(([method, operation]) => {
                endpoints.push({
                    path,
                    method: method.toUpperCase(),
                    operation,
                    url: baseUrl + path
                });
            });
        });
        
        return endpoints;
    }

    /**
     * Prueba CORS para un endpoint específico
     */
    async testCORSForEndpoint(endpoint) {
        const result = {
            path: endpoint.path,
            method: endpoint.method,
            url: endpoint.url,
            corsEnabled: false,
            allowedOrigins: [],
            allowedMethods: [],
            allowedHeaders: [],
            error: null
        };

        try {
            // Realizar petición OPTIONS para verificar CORS
            const response = await fetch(endpoint.url, {
                method: 'OPTIONS',
                headers: {
                    'Origin': window.location.origin,
                    'Access-Control-Request-Method': endpoint.method,
                    'Access-Control-Request-Headers': 'Content-Type, Authorization'
                }
            });

            // Verificar headers CORS
            const corsHeaders = {
                origin: response.headers.get('Access-Control-Allow-Origin'),
                methods: response.headers.get('Access-Control-Allow-Methods'),
                headers: response.headers.get('Access-Control-Allow-Headers'),
                credentials: response.headers.get('Access-Control-Allow-Credentials')
            };

            if (corsHeaders.origin) {
                result.corsEnabled = true;
                result.allowedOrigins = corsHeaders.origin === '*' ? ['*'] : [corsHeaders.origin];
                result.allowedMethods = corsHeaders.methods ? corsHeaders.methods.split(',').map(m => m.trim()) : [];
                result.allowedHeaders = corsHeaders.headers ? corsHeaders.headers.split(',').map(h => h.trim()) : [];
                result.allowCredentials = corsHeaders.credentials === 'true';
            }

        } catch (error) {
            result.error = error.message;
        }

        return result;
    }

    /**
     * Muestra los resultados del diagnóstico CORS
     */
    displayCORSResults(container, results) {
        const resultsSection = document.createElement('div');
        resultsSection.className = 'cors-results';

        // Estadísticas generales
        const totalEndpoints = results.length;
        const corsEnabledCount = results.filter(r => r.corsEnabled).length;
        const errorCount = results.filter(r => r.error).length;

        const statsDiv = document.createElement('div');
        statsDiv.className = 'cors-stats';
        statsDiv.innerHTML = `
            <div class="stats-header">
                <h4>Resumen del Diagnóstico</h4>
            </div>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-number">${totalEndpoints}</span>
                    <span class="stat-label">Total Endpoints</span>
                </div>
                <div class="stat-item success">
                    <span class="stat-number">${corsEnabledCount}</span>
                    <span class="stat-label">CORS Habilitado</span>
                </div>
                <div class="stat-item error">
                    <span class="stat-number">${errorCount}</span>
                    <span class="stat-label">Errores</span>
                </div>
            </div>
        `;
        resultsSection.appendChild(statsDiv);

        // Resultados detallados
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'cors-details';

        results.forEach(result => {
            const itemDiv = document.createElement('div');
            itemDiv.className = `cors-item ${result.corsEnabled ? 'cors-enabled' : 'cors-disabled'}`;
            
            let statusIcon = result.error ? '❌' : (result.corsEnabled ? '✅' : '⚠️');
            let statusText = result.error ? 'Error' : (result.corsEnabled ? 'CORS Habilitado' : 'CORS Deshabilitado');
            
            itemDiv.innerHTML = `
                <div class="cors-item-header">
                    <span class="cors-status">${statusIcon} ${statusText}</span>
                    <span class="cors-endpoint">${result.method} ${result.path}</span>
                </div>
                <div class="cors-item-details">
                    ${result.corsEnabled ? `
                        <div class="cors-detail">
                            <strong>Orígenes permitidos:</strong> ${result.allowedOrigins.join(', ') || 'No especificado'}
                        </div>
                        <div class="cors-detail">
                            <strong>Métodos permitidos:</strong> ${result.allowedMethods.join(', ') || 'No especificado'}
                        </div>
                        <div class="cors-detail">
                            <strong>Headers permitidos:</strong> ${result.allowedHeaders.join(', ') || 'No especificado'}
                        </div>
                    ` : ''}
                    ${result.error ? `
                        <div class="cors-error">
                            <strong>Error:</strong> ${result.error}
                        </div>
                    ` : ''}
                </div>
            `;
            
            detailsDiv.appendChild(itemDiv);
        });

        resultsSection.appendChild(detailsDiv);
        container.appendChild(resultsSection);
    }

    createStatusCodeItem(statusCode, type) {
        const statusItem = document.createElement('div');
        statusItem.className = 'status-code-item';

        const statusHeader = document.createElement('div');
        statusHeader.className = 'status-header';
        statusHeader.innerHTML = `
            <span class="status-code ${type}">${statusCode.code}</span>
            <span class="status-title">${statusCode.title}</span>
        `;
        statusItem.appendChild(statusHeader);

        const statusDescription = document.createElement('div');
        statusDescription.className = 'status-description';
        statusDescription.textContent = statusCode.description;
        statusItem.appendChild(statusDescription);

        return statusItem;
    }

    /**
     * Parser YAML mejorado
     */
    yamlToJson(yamlString) {
        // Para uso completo recomiendo usar la librería js-yaml
        // Este es un parser básico para casos simples
        try {
            const lines = yamlString.split('\n');
            const result = {};
            const stack = [result];
            let currentIndent = 0;

            lines.forEach(line => {
                if (line.trim() === '' || line.trim().startsWith('#')) return;

                const indent = line.length - line.trimLeft().length;
                const trimmed = line.trim();
                
                if (trimmed.includes(':')) {
                    const [key, ...valueParts] = trimmed.split(':');
                    const value = valueParts.join(':').trim();
                    
                    // Ajustar el stack según la indentación
                    while (stack.length > 1 && indent <= currentIndent) {
                        stack.pop();
                        currentIndent -= 2;
                    }
                    
                    const current = stack[stack.length - 1];
                    
                    if (value === '' || value === '{}' || value === '[]') {
                        current[key.trim()] = value === '[]' ? [] : {};
                        stack.push(current[key.trim()]);
                        currentIndent = indent;
                    } else {
                        // Procesar el valor
                        let processedValue = value;
                        if (value.startsWith('"') && value.endsWith('"')) {
                            processedValue = value.slice(1, -1);
                        } else if (value === 'true') {
                            processedValue = true;
                        } else if (value === 'false') {
                            processedValue = false;
                        } else if (!isNaN(value) && value !== '') {
                            processedValue = Number(value);
                        }
                        current[key.trim()] = processedValue;
                    }
                }
            });

            return result;
        } catch (error) {
            console.error('Error parsing YAML:', error);
            return {};
        }
    }

    /**
     * Inicializa los eventos de la interfaz
     */
    initializeEvents() {
        // Agregar delegación de eventos como respaldo para toggles
        this.setupToggleDelegation();
        
        // Esperar un poco para que el DOM se actualice completamente
        setTimeout(() => {
            this.initializeSidebarEvents();
            this.initializeTreeToggles();
            this.initializeCopyButtons();
            this.initializeCollapsibleSections();
            this.initializeDynamicContentSystem();
        }, 100);
    }

    /**
     * Configura delegación de eventos para toggles como respaldo
     */
    setupToggleDelegation() {
        document.addEventListener('click', (e) => {
            const toggle = e.target.closest('.tree-toggle');
            if (!toggle) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🎯 Delegation: clicked toggle');
            
            const targetId = toggle.getAttribute('data-target');
            let content = null;
            
            if (targetId) {
                content = document.getElementById(targetId);
            } else {
                content = toggle.nextElementSibling;
                if (content && !content.classList.contains('tree-content')) {
                    content = toggle.parentElement.querySelector('.tree-content');
                }
            }
            
            const icon = toggle.querySelector('.toggle-icon');
            const text = toggle.querySelector('.toggle-text');
            
            if (content) {
                const isExpanded = toggle.classList.contains('expanded');
                
                if (isExpanded) {
                    toggle.classList.remove('expanded');
                    content.classList.remove('expanded');
                    content.style.display = 'none';
                    if (icon) icon.textContent = '+';
                    if (text) text.textContent = 'Mostrar propiedades';
                    console.log('🎯 Delegation: collapsed');
                } else {
                    toggle.classList.add('expanded');
                    content.classList.add('expanded');
                    content.style.display = 'block';
                    if (icon) icon.textContent = '−';
                    if (text) text.textContent = 'Ocultar propiedades';
                    console.log('🎯 Delegation: expanded');
                }
            }
        });
    }

    /**
     * Inicializa eventos del sidebar
     */
    initializeSidebarEvents() {
        console.log('🚀 Initializing sidebar navigation...');
        
        const sidebarItems = document.querySelectorAll('.sidebar-item[data-target]');
        const sections = document.querySelectorAll('.section');
        
        console.log(`📊 Found ${sidebarItems.length} sidebar items with data-target`);
        console.log(`📊 Found ${sections.length} sections`);
        
        // Click handler for sidebar items
        sidebarItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                console.log(`🖱️ Clicked sidebar item ${index}:`, item.textContent.trim());
                
                const targetId = item.getAttribute('data-target');
                console.log(`🎯 Target ID from data-target: "${targetId}"`);
                
                if (targetId) {
                    // Update active state
                    this.setActiveItem(item, sidebarItems);
                    
                    // Scroll to section
                    this.scrollToSection(targetId);
                    
                    // Update dynamic content
                    this.updateDynamicContentDisplay(targetId);
                }
            });
        });

        // Optimized scroll listener with immediate response and debounced URL update
        let scrollTimeout;
        let isNavigating = false;
        
        window.addEventListener('scroll', () => {
            // Immediate content update for better responsiveness
            if (!isNavigating) {
                this.updateActiveItemOnScroll(sidebarItems, sections, true);
            }
            
            // Debounced URL update to avoid excessive history changes
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (!isNavigating) {
                    this.updateActiveItemOnScroll(sidebarItems, sections, false, true);
                }
            }, 100);
        });
        
        // Helper to control navigation state
        this.setNavigatingState = (state) => {
            isNavigating = state;
            if (state) {
                setTimeout(() => { isNavigating = false; }, 500);
            }
        };
        
        // Handle browser back/forward navigation
        window.addEventListener('popstate', () => {
            const hash = window.location.hash;
            if (hash && hash.startsWith('#')) {
                const sectionId = hash.substring(1);
                console.log(`🔄 Popstate navigation to: ${sectionId}`);
                this.scrollToSection(sectionId);
                
                // Update sidebar active state
                sidebarItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('data-target') === sectionId) {
                        item.classList.add('active');
                        this.scrollSidebarToActive(item);
                    }
                });
                
                // Update dynamic content
                this.updateDynamicContentDisplay(sectionId);
            }
        });
    }

    /**
     * Inicializa toggles de árbol
     */
    initializeTreeToggles() {
        console.log('🌳 Initializing tree toggles...');
        
        // Remover listeners existentes primero para evitar duplicados
        const existingToggles = document.querySelectorAll('.tree-toggle[data-initialized]');
        existingToggles.forEach(toggle => {
            toggle.replaceWith(toggle.cloneNode(true));
        });
        
        const toggles = document.querySelectorAll('.tree-toggle');
        console.log(`📊 Found ${toggles.length} tree toggles`);
        
        toggles.forEach((toggle, index) => {
            // Marcar como inicializado
            toggle.setAttribute('data-initialized', 'true');
            
            // Debug: log toggle info
            const targetId = toggle.getAttribute('data-target');
            const text = toggle.querySelector('.toggle-text')?.textContent;
            console.log(`🔧 Initializing toggle ${index}: target="${targetId}", text="${text}"`);
            
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`🖱️ Clicked tree toggle ${index} with target: ${targetId}`);
                
                let content = null;
                
                if (targetId) {
                    content = document.getElementById(targetId);
                    console.log(`🎯 Found content by ID: ${content ? 'YES' : 'NO'}`);
                } else {
                    // Si no hay data-target, buscar el siguiente elemento con tree-content
                    content = toggle.nextElementSibling;
                    if (content && !content.classList.contains('tree-content')) {
                        content = toggle.parentElement.querySelector('.tree-content');
                    }
                    console.log(`🔍 Found content by fallback: ${content ? 'YES' : 'NO'}`);
                }
                
                const icon = toggle.querySelector('.toggle-icon');
                const text = toggle.querySelector('.toggle-text');
                
                if (content) {
                    const isExpanded = toggle.classList.contains('expanded');
                    console.log(`📊 Current state: ${isExpanded ? 'EXPANDED' : 'COLLAPSED'}`);
                    
                    if (isExpanded) {
                        // Collapse
                        toggle.classList.remove('expanded');
                        content.classList.remove('expanded');
                        content.style.display = 'none';
                        if (icon) icon.textContent = '+';
                        if (text) text.textContent = 'Mostrar propiedades';
                        console.log(`➖ Collapsed tree section`);
                    } else {
                        // Expand
                        toggle.classList.add('expanded');
                        content.classList.add('expanded');
                        content.style.display = 'block';
                        if (icon) icon.textContent = '−';
                        if (text) text.textContent = 'Ocultar propiedades';
                        console.log(`➕ Expanded tree section`);
                    }
                } else {
                    console.error(`❌ Tree toggle content not found! targetId: ${targetId}`);
                    console.error(`❌ Toggle element:`, toggle);
                    console.error(`❌ Parent element:`, toggle.parentElement);
                }
            });
        });
        
        console.log('✅ Tree toggles initialized');
    }

    /**
     * Inicializa botones de copiar
     */
    initializeCopyButtons() {
        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const codeBlock = e.currentTarget.closest('.request-section')?.querySelector('.code-content');
                if (codeBlock) {
                    const codeText = codeBlock.innerText;
                    navigator.clipboard.writeText(codeText).then(() => {
                        // Mostrar feedback visual
                        const originalHTML = e.currentTarget.innerHTML;
                        e.currentTarget.innerHTML = '✓';
                        setTimeout(() => {
                            e.currentTarget.innerHTML = originalHTML;
                        }, 2000);
                    }).catch(err => {
                        console.error('Error copying to clipboard:', err);
                    });
                }
            });
        });
    }

    /**
     * Inicializa secciones colapsables
     */
    initializeCollapsibleSections() {
        console.log('📽 Initializing collapsible sections...');
        
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
                    if (items) {
                        items.style.maxHeight = '0';
                        items.style.opacity = '0';
                    }
                } else {
                    if (items) {
                        items.style.maxHeight = items.scrollHeight + 'px';
                        items.style.opacity = '1';
                    }
                }
            });
            
            // Add cursor pointer
            title.style.cursor = 'pointer';
        });
    }

    /**
     * Inicializa sistema de contenido dinámico
     */
    initializeDynamicContentSystem() {
        console.log('🎭 Initializing dynamic content system...');
        this.currentActiveSection = null;
        this.hideAllDynamicElements();
        console.log('✅ Dynamic content system initialized');
    }

    /**
     * Actualiza contenido dinámico
     */
    updateDynamicContentDisplay(sectionId) {
        console.log(`🎭 Updating dynamic content for section: ${sectionId}`);
        
        const requestElementId = sectionId + '-request';
        const responseElementId = sectionId + '-response';
        const requestElement = document.getElementById(requestElementId);
        const responseElement = document.getElementById(responseElementId);
        
        if (requestElement || responseElement) {
            console.log(`✅ Found elements for section: ${sectionId}, updating content`);
            
            this.hideAllDynamicElements();
            this.showElementsForSection(sectionId);
            this.currentActiveSection = sectionId;
        } else {
            if (sectionId !== "main-parameters") {
                this.hideAllDynamicElements();
            }
            console.log(`ℹ️ No elements found for section: ${sectionId}`);
        }
    }

    /**
     * Oculta todos los elementos dinámicos
     */
    hideAllDynamicElements() {
        const requestSections = document.querySelectorAll('.request-section');
        const responseSections = document.querySelectorAll('.response-section');
        
        requestSections.forEach(element => element.style.display = 'none');
        responseSections.forEach(element => element.style.display = 'none');
        
        console.log(`🙈 Hidden ${requestSections.length} request sections and ${responseSections.length} response sections`);
    }

    /**
     * Muestra elementos para una sección específica
     */
    showElementsForSection(sectionId) {
        if (!sectionId) return;
        
        const requestElementId = sectionId + '-request';
        const responseElementId = sectionId + '-response';
        
        const requestElement = document.getElementById(requestElementId);
        const responseElement = document.getElementById(responseElementId);
        
        if (requestElement) {
            requestElement.style.display = 'block';
            console.log(`👁️ Shown request element: ${requestElementId}`);
        }
        
        if (responseElement) {
            responseElement.style.display = 'block';
            console.log(`👁️ Shown response element: ${responseElementId}`);
        }
    }

    /**
     * Establece item activo en sidebar
     */
    setActiveItem(activeItem, allItems) {
        console.log('🎯 Setting active item:', activeItem.textContent.trim());
        
        allItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
        
        this.scrollSidebarToActive(activeItem);
    }

    /**
     * Scroll a sección
     */
    scrollToSection(sectionId) {
        console.log(`🔍 Looking for section with ID: "${sectionId}"`);
        
        const section = document.getElementById(sectionId);
        if (section) {
            // Set navigating state to prevent scroll interference
            if (this.setNavigatingState) {
                this.setNavigatingState(true);
            }
            
            // Update URL hash
            window.history.pushState(null, null, `#${sectionId}`);
            
            // Immediately update dynamic content for instant response
            this.updateDynamicContentDisplay(sectionId);
            this.lastActiveSectionId = sectionId;
            
            const headerOffset = 80;
            const elementPosition = section.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Highlight the section briefly
            section.style.background = '#fffbf0';
            section.style.transition = 'background-color 0.3s ease';
            setTimeout(() => {
                section.style.background = '';
            }, 2000);
            
            console.log(`🚀 Scroll initiated to section: ${sectionId}`);
            console.log(`🔗 URL updated with hash: #${sectionId}`);
            console.log(`👁️ Dynamic content updated immediately`);
        } else {
            console.error(`⚠️ Section not found with ID: "${sectionId}"`);
        }
    }

    /**
     * Actualiza item activo en scroll
     */
    updateActiveItemOnScroll(sidebarItems, sections, immediateUpdate = false, updateUrl = false) {
        let currentSectionId = '';
        let bestSection = null;
        let bestDistance = Infinity;
        
        // Improved section detection - find the section closest to viewport center
        const viewportCenter = window.innerHeight / 2;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionCenter = rect.top + (rect.height / 2);
            const distance = Math.abs(sectionCenter - viewportCenter);
            
            // Section is in viewport and closer to center
            if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestSection = section;
                    currentSectionId = section.id;
                }
            }
        });
        
        // Fallback: if no section in center, use the topmost visible section
        if (!currentSectionId) {
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom >= 150) {
                    currentSectionId = section.id;
                }
            });
        }
        
        if (currentSectionId && currentSectionId !== this.lastActiveSectionId) {
            console.log(`🎯 Active section changed to: ${currentSectionId}`);
            
            // Update URL hash only if requested and different from current hash
            if (updateUrl) {
                const currentHash = window.location.hash.substring(1);
                if (currentHash !== currentSectionId) {
                    window.history.replaceState(null, null, `#${currentSectionId}`);
                }
            }
            
            // Always update dynamic content immediately for responsiveness
            this.updateDynamicContentDisplay(currentSectionId);
            
            // Update sidebar active state
            sidebarItems.forEach(item => {
                item.classList.remove('active');
                const targetId = item.getAttribute('data-target');
                if (targetId === currentSectionId) {
                    item.classList.add('active');
                    // Only scroll sidebar on immediate updates to avoid conflicts
                    if (immediateUpdate) {
                        this.scrollSidebarToActive(item);
                    }
                }
            });
            
            this.lastActiveSectionId = currentSectionId;
        }
    }

    /**
     * Handle initial navigation from URL hash
     */
    handleInitialHashNavigation() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#')) {
            const sectionId = hash.substring(1);
            console.log(`🔗 Generator handling initial hash navigation to: ${sectionId}`);
            
            // Wait a bit more for DOM to be fully ready
            setTimeout(() => {
                this.scrollToSection(sectionId);
                
                // Update sidebar active state
                const sidebarItems = document.querySelectorAll('.sidebar-item[data-target]');
                sidebarItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('data-target') === sectionId) {
                        item.classList.add('active');
                        this.scrollSidebarToActive(item);
                    }
                });
                
                // Update dynamic content
                this.updateDynamicContentDisplay(sectionId);
            }, 100);
        }
    }

    /**
     * Scroll sidebar para mostrar item activo
     */
    scrollSidebarToActive(activeItem) {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        const sidebarRect = sidebar.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        
        if (itemRect.top < sidebarRect.top + 50 || itemRect.bottom > sidebarRect.bottom - 50) {
            const itemTop = activeItem.offsetTop;
            const sidebarHeight = sidebar.clientHeight;
            const targetScroll = itemTop - (sidebarHeight / 2);
            
            sidebar.scrollTo({
                top: Math.max(0, targetScroll),
                behavior: 'smooth'
            });
        }
    }

    /**
     * Función de utilidad para validar la configuración
     */
    validateConfig(config) {
        const errors = [];

        if (!config.info) {
            errors.push('Missing info section');
        } else {
            if (!config.info.title) errors.push('Missing info.title');
            if (!config.info.version) errors.push('Missing info.version');
        }

        if (!config.paths || Object.keys(config.paths).length === 0) {
            errors.push('Missing or empty paths section');
        }

        if (errors.length > 0) {
            console.warn('Configuration validation warnings:', errors);
        }

        return errors.length === 0;
    }

    /**
     * Función para limpiar el contenido existente
     */
    clearExistingContent() {
        // Limpiar sidebar
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.innerHTML = '';
        }

        // Limpiar contenido principal
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = '';
        }

        // Limpiar code sidebar
        const codeSidebar = document.querySelector('.code-sidebar');
        if (codeSidebar) {
            const existingSections = codeSidebar.querySelectorAll('.section-urls, .request-section, .response-section');
            existingSections.forEach(section => section.remove());
        }
    }

    /**
     * Genera la sección SSO para obtener access token
     */
    generateSSOSection() {
        const section = document.createElement('section');
        section.id = 'sso';
        section.className = 'section';
        
        const header = document.createElement('div');
        header.className = 'section-header';
        
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = 'SSO - Obtener Access Token';
        header.appendChild(title);
        section.appendChild(header);
        
        const description = document.createElement('p');
        description.style.marginBottom = '20px';
        description.textContent = 'Configure y obtenga su access token para autenticarse con la API usando Keycloak SSO.';
        section.appendChild(description);
        
        const formContainer = document.createElement('div');
        formContainer.className = 'sso-form-container';
        formContainer.innerHTML = `
            <form id="sso-form" class="sso-form">
                <div class="form-group">
                    <label for="sso-url">URL del Servidor SSO:</label>
                    <input type="url" id="sso-url" name="url" required>
                </div>
                
                <div class="form-group">
                    <label for="sso-client-id">Client ID:</label>
                    <input type="text" id="sso-client-id" name="client_id" required>
                </div>
                
                <div class="form-group">
                    <label for="sso-username">Username:</label>
                    <input type="text" id="sso-username" name="username" required>
                </div>
                
                <div class="form-group">
                    <label for="sso-password">Password:</label>
                    <input type="password" id="sso-password" name="password" required>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary" id="sso-submit">Obtener Access Token</button>
                    <button type="button" class="btn-secondary" id="sso-clear">Limpiar Datos</button>
                </div>
                
                <div class="sso-status" id="sso-status"></div>
                <div class="sso-token-info" id="sso-token-info"></div>
            </form>
        `;
        
        section.appendChild(formContainer);
        
        // Inicializar funcionalidad SSO
        setTimeout(() => this.initializeSSOForm(), 100);
        
        return section;
    }

    /**
     * Inicializa la funcionalidad del formulario SSO
     */
    initializeSSOForm() {
        // Cargar datos guardados
        this.loadSSOData();
        
        // Event listeners
        const form = document.getElementById('sso-form');
        const clearBtn = document.getElementById('sso-clear');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleSSOSubmit(e));
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSSOData());
        }
        
        // Mostrar información del token actual
        this.updateTokenInfo();
    }

    /**
     * Maneja el envío del formulario SSO
     */
    async handleSSOSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const statusDiv = document.getElementById('sso-status');
        const submitBtn = document.getElementById('sso-submit');
        
        // Datos del formulario
        const ssoData = {
            url: formData.get('url'),
            client_id: formData.get('client_id'),
            username: formData.get('username'),
            password: formData.get('password')
        };
        
        // Guardar datos en localStorage (sin password)
        const dataToSave = { ...ssoData };
        delete dataToSave.password;
        localStorage.setItem('sso_data', JSON.stringify(dataToSave));
        
        // UI de carga
        submitBtn.disabled = true;
        submitBtn.textContent = 'Obteniendo token...';
        statusDiv.className = 'sso-status loading';
        statusDiv.textContent = 'Conectando con el servidor SSO...';
        
        try {
            const response = await fetch(ssoData.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: ssoData.client_id,
                    grant_type: 'password',
                    username: ssoData.username,
                    password: ssoData.password
                })
            });
            
            const result = await response.json();
            
            if (response.ok && result.access_token) {
                // Guardar token con timestamp
                const tokenData = {
                    access_token: result.access_token,
                    expires_in: result.expires_in || 3600,
                    token_type: result.token_type || 'Bearer',
                    timestamp: Date.now()
                };
                
                localStorage.setItem('sso_token', JSON.stringify(tokenData));
                
                statusDiv.className = 'sso-status success';
                statusDiv.textContent = '✅ Access token obtenido exitosamente';
                
                this.updateTokenInfo();
                
                // Actualizar todos los indicadores de token en la página
                this.updateAllTokenIndicators();
                
            } else {
                throw new Error(result.error_description || result.error || 'Error desconocido');
            }
            
        } catch (error) {
            console.error('Error SSO:', error);
            statusDiv.className = 'sso-status error';
            statusDiv.textContent = `❌ Error: ${error.message}`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Obtener Access Token';
        }
    }

    /**
     * Carga los datos SSO guardados
     */
    loadSSOData() {
        const savedData = localStorage.getItem('sso_data');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                document.getElementById('sso-url').value = data.url || '';
                document.getElementById('sso-client-id').value = data.client_id || '';
                document.getElementById('sso-username').value = data.username || '';
            } catch (e) {
                console.error('Error loading SSO data:', e);
            }
        } else {
            // Datos por defecto
            document.getElementById('sso-url').value = 'https://sso.dev.claroshop.com/auth/realms/claroshop-sapi-sa-cv/protocol/openid-connect/token';
            document.getElementById('sso-client-id').value = 'Onboarding-t1';
            document.getElementById('sso-username').value = 'telmex@t1.com';
            document.getElementById('sso-password').value = 'Carso123';
        }
    }

    /**
     * Limpia los datos SSO
     */
    clearSSOData() {
        if (confirm('¿Está seguro de que desea limpiar todos los datos SSO y el token?')) {
            localStorage.removeItem('sso_data');
            localStorage.removeItem('sso_token');
            
            document.getElementById('sso-form').reset();
            document.getElementById('sso-status').textContent = '';
            document.getElementById('sso-token-info').textContent = '';
            
            // Restaurar valores por defecto
            this.loadSSOData();
            
            // Actualizar todos los indicadores de token en la página
            this.updateAllTokenIndicators();
        }
    }

    /**
     * Actualiza la información del token
     */
    updateTokenInfo() {
        const tokenData = localStorage.getItem('sso_token');
        const tokenInfoDiv = document.getElementById('sso-token-info');
        
        if (tokenData && tokenInfoDiv) {
            try {
                const token = JSON.parse(tokenData);
                const expiresAt = new Date(token.timestamp + (token.expires_in * 1000));
                const isExpired = Date.now() > expiresAt.getTime();
                
                tokenInfoDiv.className = isExpired ? 'sso-token-info expired' : 'sso-token-info valid';
                tokenInfoDiv.innerHTML = `
                    <h4>🔑 Token Información:</h4>
                    <div class="token-details">
                        <p><strong>Tipo:</strong> ${token.token_type}</p>
                        <p><strong>Expira:</strong> ${expiresAt.toLocaleString()}</p>
                        <p><strong>Estado:</strong> ${isExpired ? '❌ Expirado' : '✅ Válido'}</p>
                        <div class="token-row">
                            <p><strong>Token:</strong> <code id="token-display">${token.access_token.substring(0, 30)}...</code></p>
                            <button class="btn-copy" id="copy-token-btn" title="Copiar token completo">📋</button>
                        </div>
                    </div>
                `;
                
                // Agregar event listener para el botón de copiar
                setTimeout(() => {
                    const copyBtn = document.getElementById('copy-token-btn');
                    if (copyBtn) {
                        copyBtn.addEventListener('click', () => this.copyTokenToClipboard(token.access_token));
                    }
                }, 100);
            } catch (e) {
                console.error('Error displaying token info:', e);
            }
        }
    }

    /**
     * Actualiza todos los indicadores de token SSO en la página
     */
    updateAllTokenIndicators() {
        const hasValidToken = this.getValidAccessToken() !== null;
        const indicators = document.querySelectorAll('.sso-token-indicator');
        
        indicators.forEach((indicator, index) => {
            const indicatorId = `token-indicator-${index}`;
            indicator.setAttribute('data-indicator-id', indicatorId);
            
            if (hasValidToken) {
                const tokenInfo = this.getTokenInfo();
                const isManual = tokenInfo && tokenInfo.isManual;
                indicator.className = 'sso-token-indicator valid';
                
                if (isManual) {
                    indicator.innerHTML = `
                        🔑 Usando token manual
                        <span class="token-options">
                            | <a href="#sso">Cambiar a SSO</a> | 
                            <a href="#" onclick="generator.showManualTokenInput('${indicatorId}'); return false;">Cambiar token</a>
                        </span>
                    `;
                } else {
                    indicator.innerHTML = `
                        🔑 Usando token SSO automático
                        <span class="token-options">
                            | <a href="#" onclick="generator.showManualTokenInput('${indicatorId}'); return false;">Cambiar a manual</a>
                        </span>
                    `;
                }
            } else {
                indicator.className = 'sso-token-indicator invalid';
                indicator.innerHTML = `
                    ⚠️ Token no disponible
                    <span class="token-options">
                        - <a href="#sso">Obtener SSO</a> | 
                        <a href="#" onclick="generator.showManualTokenInput('${indicatorId}'); return false;">Token manual</a>
                    </span>
                `;
            }
        });
        
        console.log(`📊 Updated ${indicators.length} token indicators`);
        
        // También actualizar los ejemplos de código en los sidebars
        this.updateAllCodeExamples();
    }

    /**
     * Actualiza todos los ejemplos de código en los sidebars
     */
    updateAllCodeExamples() {
        // Buscar todos los code-content activos y regenerarlos
        const activeCodeContents = document.querySelectorAll('.code-content[data-lang]');
        activeCodeContents.forEach(codeContent => {
            const lang = codeContent.getAttribute('data-lang');
            const sectionId = this.findParentSectionId(codeContent);
            
            if (sectionId && lang) {
                this.regenerateCodeExample(codeContent, lang, sectionId);
            }
        });
        
        console.log(`🔄 Updated ${activeCodeContents.length} code examples`);
    }

    /**
     * Encuentra el ID de la sección padre de un elemento
     */
    findParentSectionId(element) {
        let current = element;
        while (current && current !== document.body) {
            if (current.classList.contains('section') && current.id) {
                return current.id;
            }
            current = current.parentElement;
        }
        return null;
    }

    /**
     * Regenera un ejemplo de código específico
     */
    regenerateCodeExample(codeContent, lang, sectionId) {
        // Buscar la sección correspondiente para obtener path, method, operation
        const section = document.getElementById(sectionId);
        if (!section) return;

        // Extraer información del section ID (formato: método-path)
        const parts = sectionId.split('-');
        if (parts.length < 2) return;

        const method = parts[0];
        let path = '/' + parts.slice(1).join('/').replace(/-/g, '/');
        
        // Buscar la operación correspondiente en la configuración
        const pathConfig = this.config?.paths?.[path];
        const operation = pathConfig?.[method.toLowerCase()];
        
        if (!operation) return;

        // Regenerar el ejemplo según el lenguaje
        let newContent = '';
        switch (lang) {
            case 'curl':
                newContent = this.generateCurlCodeContent(path, method, operation);
                break;
            case 'js':
                newContent = this.generateJSCodeContent(path, method, operation);
                break;
            case 'python':
                newContent = this.generatePythonCodeContent(path, method, operation);
                break;
            default:
                return;
        }
        
        if (newContent) {
            codeContent.innerHTML = newContent;
        }
    }

    /**
     * Genera el contenido HTML para cURL
     */
    generateCurlCodeContent(path, method, operation) {
        const baseUrl = this.config?.servers?.[0]?.url || 'https://api.example.com';
        let curlCommand = `curl -X ${method.toUpperCase()} "${baseUrl}${path}"`;

        // Headers
        if (this.config.security?.[0]) {
            const accessToken = this.getValidAccessToken();
            if (accessToken) {
                curlCommand += `\n  -H "Authorization: Bearer ${accessToken}"`;
            } else {
                curlCommand += '\n  -H "Authorization: Bearer {access_token}"';
            }
        }

        // Detectar tipo de contenido y generar body apropiado
        if (['post', 'put', 'patch'].includes(method.toLowerCase()) && operation.requestBody) {
            const contentTypes = Object.keys(operation.requestBody?.content || {});
            const isMultipartForm = contentTypes.some(type => type.includes('multipart/form-data'));
            
            if (isMultipartForm) {
                // No agregar Content-Type header para multipart (curl lo maneja automáticamente)
                const schema = operation.requestBody.content['multipart/form-data']?.schema;
                if (schema && schema.properties) {
                    // Generar campos del formulario multipart
                    Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
                        if (fieldSchema.format === 'binary') {
                            curlCommand += `\n  -F "${fieldName}=@/path/to/file"`;
                        } else if (fieldSchema.enum && fieldSchema.enum.length > 0) {
                            curlCommand += `\n  -F "${fieldName}=${fieldSchema.enum[0]}"`;
                        } else {
                            const exampleValue = fieldSchema.type === 'string' ? `"example_${fieldName}"` : 'example_value';
                            curlCommand += `\n  -F "${fieldName}=${exampleValue}"`;
                        }
                    });
                }
            } else {
                // Formulario JSON tradicional
                curlCommand += '\n  -H "Content-Type: application/json"';
                curlCommand += '\n  -d @/request.json';
            }
        }

        return this.formatCodeBlock(curlCommand, 'curl');
    }

    /**
     * Genera el contenido HTML para JavaScript
     */
    generateJSCodeContent(path, method, operation) {
        const baseUrl = this.config.servers?.[0]?.url || 'https://api.example.com';
        let code = `fetch('${baseUrl}${path}', {\n    method: '${method.toUpperCase()}',\n    headers: {\n        'Content-Type': 'application/json',`;
        
        if (this.config.security?.[0]) {
            const accessToken = this.getValidAccessToken();
            if (accessToken) {
                code += `\n        'Authorization': 'Bearer ${accessToken}',`;
            } else {
                code += `\n        'Authorization': 'Bearer {access_token}',`;
            }
        }
        code += `\n    },`;
        
        if (['post', 'put', 'patch'].includes(method.toLowerCase()) && operation.requestBody) {
            code += `\n    body: JSON.stringify({ /* datos */ }),`;
        }
        code += `\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error(error));`;
        
        return this.formatCodeBlock(code, 'js');
    }

    /**
     * Genera el contenido HTML para Python
     */
    generatePythonCodeContent(path, method, operation) {
        const baseUrl = this.config.servers?.[0]?.url || 'https://api.example.com';
        let code = `import requests\n\nurl = '${baseUrl}${path}'\nheaders = {\n    'Content-Type': 'application/json',`;
        
        if (this.config.security?.[0]) {
            const accessToken = this.getValidAccessToken();
            if (accessToken) {
                code += `\n    'Authorization': 'Bearer ${accessToken}',`;
            } else {
                code += `\n    'Authorization': 'Bearer {access_token}',`;
            }
        }
        code += `\n}`;
        
        if (['post', 'put', 'patch'].includes(method.toLowerCase()) && operation.requestBody) {
            code += `\ndata = { # datos }\nresponse = requests.${method.toLowerCase()}(url, headers=headers, json=data)`;
        } else {
            code += `\nresponse = requests.${method.toLowerCase()}(url, headers=headers)`;
        }
        code += `\nprint(response.json())`;
        
        return this.formatCodeBlock(code, 'python');
    }

    /**
     * Obtiene información completa del token del localStorage
     */
    getTokenInfo() {
        const tokenData = localStorage.getItem('sso_token');
        if (!tokenData) {
            return null;
        }
        
        try {
            const token = JSON.parse(tokenData);
            const expiresAt = new Date(token.timestamp + (token.expires_in * 1000));
            const isExpired = Date.now() > expiresAt.getTime();
            
            if (isExpired) {
                console.warn('Token has expired');
                return null;
            }
            
            return {
                access_token: token.access_token,
                expires_at: expiresAt,
                expires_in: token.expires_in,
                token_type: token.token_type || 'Bearer',
                isManual: token.isManual || false,
                timestamp: token.timestamp
            };
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    }

    /**
     * Obtiene el access token válido del localStorage
     */
    getValidAccessToken() {
        const tokenInfo = this.getTokenInfo();
        return tokenInfo ? tokenInfo.access_token : null;
    }

    /**
     * Copia el token al portapapeles
     */
    async copyTokenToClipboard(token) {
        const copyBtn = document.getElementById('copy-token-btn');
        const originalText = copyBtn.innerHTML;
        
        try {
            // Usar la API moderna del portapapeles
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(token);
            } else {
                // Fallback para navegadores antiguos o contextos no seguros
                const textArea = document.createElement('textarea');
                textArea.value = token;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }
            
            // Feedback visual
            copyBtn.innerHTML = '✅';
            copyBtn.classList.add('copied');
            copyBtn.title = 'Token copiado!';
            
            // Mostrar notificación temporal
            this.showCopyNotification('Token copiado al portapapeles');
            
            // Restaurar después de 2 segundos
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('copied');
                copyBtn.title = 'Copiar token completo';
            }, 2000);
            
        } catch (error) {
            console.error('Error copying token:', error);
            copyBtn.innerHTML = '❌';
            copyBtn.title = 'Error al copiar';
            
            // Mostrar notificación de error
            this.showCopyNotification('Error al copiar token', 'error');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.title = 'Copiar token completo';
            }, 2000);
        }
    }

    /**
     * Muestra una notificación temporal
     */
    showCopyNotification(message, type = 'success') {
        // Crear o reutilizar el elemento de notificación
        let notification = document.getElementById('copy-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'copy-notification';
            notification.className = 'copy-notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.className = `copy-notification ${type} show`;
        
        // Auto-ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    /**
     * Muestra el input modal para token manual
     */
    showManualTokenInput(indicatorId) {
        const existingToken = this.getValidAccessToken();
        const tokenInfo = this.getTokenInfo();
        const isEditingExisting = !!existingToken;
        // Crear modal si no existe
        let modal = document.getElementById('manual-token-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'manual-token-modal';
            modal.className = 'manual-token-modal';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="manual-token-overlay" onclick="this.parentElement.style.display='none'"></div>
            <div class="manual-token-content">
                <div class="manual-token-header">
                    <h3>🔑 ${isEditingExisting ? 'Editar Token Manual' : 'Token Manual'}</h3>
                    <button class="close-btn" onclick="document.getElementById('manual-token-modal').style.display='none'">✕</button>
                </div>
                
                <div class="manual-token-body">
                    <p>${isEditingExisting ? 'Edite su access token JWT:' : 'Pegue su access token JWT aquí:'}</p>
                    ${isEditingExisting && tokenInfo ? `
                        <div class="current-token-info">
                            <small><strong>Token actual:</strong> ${tokenInfo.isManual ? 'Manual' : 'SSO automático'} 
                            (expira: ${tokenInfo.expires_at.toLocaleString()})</small>
                        </div>
                    ` : ''}
                    <textarea 
                        id="manual-token-input" 
                        class="manual-token-textarea"
                        placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
                        rows="4"
                    >${isEditingExisting ? existingToken : ''}</textarea>
                    
                    <div class="token-validation" id="token-validation"></div>
                </div>
                
                <div class="manual-token-actions">
                    <button class="btn-secondary" onclick="document.getElementById('manual-token-modal').style.display='none'">
                        Cancelar
                    </button>
                    <button class="btn-primary" onclick="generator.validateAndSaveManualToken()">
                        Validar y Guardar
                    </button>
                </div>
            </div>
        `;

        // Mostrar modal
        modal.style.display = 'flex';
        
        // Enfocar el textarea
        setTimeout(() => {
            document.getElementById('manual-token-input').focus();
        }, 100);

        // Validar en tiempo real mientras se escribe
        const textarea = document.getElementById('manual-token-input');
        textarea.addEventListener('input', () => {
            this.validateTokenFormat(textarea.value);
        });

        // Si ya hay un token, validarlo inmediatamente
        if (existingToken) {
            setTimeout(() => {
                this.validateTokenFormat(existingToken);
            }, 100);
        }
    }

    /**
     * Valida el formato del token en tiempo real
     */
    validateTokenFormat(token) {
        const validationDiv = document.getElementById('token-validation');
        
        if (!token.trim()) {
            validationDiv.innerHTML = '';
            return;
        }

        try {
            // Validar que sea un JWT válido
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Token JWT debe tener 3 partes separadas por puntos');
            }

            // Decodificar el payload
            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);
            
            let status = '';
            let className = '';

            // Verificar expiración
            if (payload.exp) {
                const expiresAt = new Date(payload.exp * 1000);
                const isExpired = now > payload.exp;
                
                if (isExpired) {
                    status = `❌ Token expirado el ${expiresAt.toLocaleString()}`;
                    className = 'validation-error';
                } else {
                    status = `✅ Token válido hasta ${expiresAt.toLocaleString()}`;
                    className = 'validation-success';
                }
            } else {
                status = '⚠️ Token sin fecha de expiración';
                className = 'validation-warning';
            }

            // Mostrar información adicional
            if (payload.iss) status += `<br>📋 Emisor: ${payload.iss}`;
            if (payload.sub) status += `<br>👤 Usuario: ${payload.sub}`;
            if (payload.aud) status += `<br>🎯 Audiencia: ${payload.aud}`;

            validationDiv.className = `token-validation ${className}`;
            validationDiv.innerHTML = status;

        } catch (error) {
            validationDiv.className = 'token-validation validation-error';
            validationDiv.innerHTML = `❌ Token inválido: ${error.message}`;
        }
    }

    /**
     * Valida y guarda el token manual
     */
    validateAndSaveManualToken() {
        const token = document.getElementById('manual-token-input').value.trim();
        const validationDiv = document.getElementById('token-validation');

        if (!token) {
            validationDiv.className = 'token-validation validation-error';
            validationDiv.innerHTML = '❌ Por favor ingrese un token';
            return;
        }

        try {
            // Validar JWT
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Formato de token JWT inválido');
            }

            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);

            // Verificar que no esté expirado
            if (payload.exp && now > payload.exp) {
                throw new Error('El token ha expirado');
            }

            // Calcular expires_in
            const expiresIn = payload.exp ? (payload.exp - now) : 3600; // Default 1 hora si no tiene exp

            // Guardar token como manual
            const tokenData = {
                access_token: token,
                expires_in: expiresIn,
                token_type: 'Bearer',
                timestamp: Date.now(),
                isManual: true // Marcar como token manual
            };

            localStorage.setItem('sso_token', JSON.stringify(tokenData));

            // Actualizar UI
            this.updateAllTokenIndicators();
            this.updateTokenInfo(); // Si estamos en la sección SSO

            // Cerrar modal
            document.getElementById('manual-token-modal').style.display = 'none';

            // Mostrar notificación
            this.showCopyNotification('Token manual guardado exitosamente', 'success');

            console.log('✅ Manual token saved successfully');

        } catch (error) {
            validationDiv.className = 'token-validation validation-error';
            validationDiv.innerHTML = `❌ Error: ${error.message}`;
        }
    }
}

// Uso del generador
const generator = new APIDocGenerator();
/*
// Ejemplo de JSON de configuración
const exampleConfig = {
    "info": {
        "title": "Orders API",
        "version": "v2.0",
        "description": "API de gestión de órdenes para múltiples canales de venta"
    },
    "servers": [
        {
            "url": "https://ordershub.dev.t1api.com"
        }
    ],
    "security": [
        {
            "bearerAuth": []
        }
    ],
    "paths": {
        "/admin/api/orders": {
            "post": {
                "summary": "Crear Orden",
                "description": "Crea una nueva orden con productos, información del cliente y configuración de envío.",
                "tags": ["Órdenes"],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "store_id": {
                                        "type": "string",
                                        "description": "Identificador único de la tienda"
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "201": {
                        "description": "Orden creada exitosamente"
                    }
                }
            }
        },
        "/order_management": {
            "get": {
                "summary": "Listar Órdenes",
                "description": "Lista pedidos con filtros avanzados, paginación y ordenamiento.",
                "tags": ["Órdenes"],
                "parameters": [
                    {
                        "name": "store_id",
                        "in": "query",
                        "required": true,
                        "schema": {
                            "type": "string"
                        },
                        "description": "ID de la tienda"
                    },
                    {
                        "name": "status",
                        "in": "query",
                        "required": false,
                        "schema": {
                            "type": "string"
                        },
                        "description": "Filtro por estado"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Lista de órdenes"
                    }
                }
            }
        }
    }
};

// Para usar el generador:
// generator.generateFromJSON(exampleConfig);
*/