// fullscreen-manager.js
(function() {
    console.log('✅ Fullscreen Manager Loaded');
    
    // State
    let isFullscreen = false;
    let originalStyles = {};
    let fullscreenContainer = null;
    let fullscreenButton = null;
    
    // Fungsi untuk membuat tombol fullscreen
    function createFullscreenButton() {
        if (fullscreenButton) return fullscreenButton;
        
        fullscreenButton = document.createElement('button');
        fullscreenButton.id = 'fullscreenToggle';
        fullscreenButton.title = 'Toggle Fullscreen (F11)';
        fullscreenButton.innerHTML = `
            <i class="fas fa-expand"></i>
            <span class="fullscreen-text">Fullscreen</span>
        `;
        
        fullscreenButton.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: rgba(52, 152, 219, 0.9);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        
        fullscreenButton.onmouseenter = function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        };
        
        fullscreenButton.onmouseleave = function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        };
        
        fullscreenButton.onclick = toggleFullscreen;
        
        document.body.appendChild(fullscreenButton);
        return fullscreenButton;
    }
    
    // Fungsi untuk membuat container fullscreen
    function createFullscreenContainer() {
        if (fullscreenContainer) return fullscreenContainer;
        
        fullscreenContainer = document.createElement('div');
        fullscreenContainer.id = 'fullscreenContainer';
        fullscreenContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #1a1a1a;
            z-index: 10000;
            display: none;
            flex-direction: column;
            overflow: hidden;
        `;
        
        // Header untuk fullscreen mode
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 15px 30px;
            background: #2c3e50;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        `;
        
        const title = document.createElement('div');
        title.id = 'fullscreenTitle';
        title.style.cssText = `
            font-size: 18px;
            font-weight: 600;
        `;
        
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '<i class="fas fa-times"></i> Keluar Fullscreen (ESC)';
        closeButton.style.cssText = `
            background: #e74c3c;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        closeButton.onclick = exitFullscreen;
        
        header.appendChild(title);
        header.appendChild(closeButton);
        
        // Content area
        const content = document.createElement('div');
        content.id = 'fullscreenContent';
        content.style.cssText = `
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            overflow: hidden;
        `;
        
        fullscreenContainer.appendChild(header);
        fullscreenContainer.appendChild(content);
        document.body.appendChild(fullscreenContainer);
        
        return fullscreenContainer;
    }
    
    // Fungsi untuk masuk fullscreen mode
    function enterFullscreen() {
        if (isFullscreen) return;
        
        console.log('🚀 Entering fullscreen mode');
        
        // Get current content
        const moduleContainer = document.querySelector('.module-container');
        const moduleFrame = document.getElementById('moduleFrame');
        const canvaContainer = document.querySelector('[id^="canvaContainer"]');
        const chapterTitle = document.getElementById('chapterTitle').textContent;
        
        if (!moduleContainer) {
            console.warn('No module container found');
            return;
        }
        
        // Create containers if not exist
        createFullscreenContainer();
        createFullscreenButton();
        
        // Save original styles
        originalStyles = {
            bodyOverflow: document.body.style.overflow,
            moduleDisplay: moduleContainer.style.display
        };
        
        // Update title
        document.getElementById('fullscreenTitle').textContent = chapterTitle;
        
        // Clone content untuk fullscreen
        const content = document.getElementById('fullscreenContent');
        content.innerHTML = '';
        
        // Clone the appropriate content
        let contentToClone;
        
        if (canvaContainer && canvaContainer.style.display !== 'none') {
            // Clone Canva content
            contentToClone = canvaContainer.cloneNode(true);
            const canvaIframe = contentToClone.querySelector('iframe');
            if (canvaIframe) {
                // Force reload Canva in fullscreen
                const timestamp = new Date().getTime();
                canvaIframe.src = canvaIframe.src.replace(/[?&]_t=\d+/, '') + 
                                 (canvaIframe.src.includes('?') ? '&' : '?') + '_t=' + timestamp;
            }
        } else if (moduleFrame && moduleFrame.style.display !== 'none') {
            // Clone iframe content
            contentToClone = moduleFrame.cloneNode(true);
            contentToClone.style.cssText = `
                width: 100%;
                height: 100%;
                border: none;
                border-radius: 10px;
            `;
        } else {
            // Clone module container
            contentToClone = moduleContainer.cloneNode(true);
            contentToClone.style.cssText = `
                width: 100%;
                height: 100%;
                overflow: auto;
                background: white;
                border-radius: 10px;
                padding: 20px;
            `;
        }
        
        content.appendChild(contentToClone);
        
        // Setup iframe dalam fullscreen
        const iframe = content.querySelector('iframe');
        if (iframe) {
            iframe.style.cssText = `
                width: 100%;
                height: 100%;
                border: none;
                border-radius: 10px;
            `;
            
            // Tambahkan fitur fullscreen untuk iframe
            iframe.allowFullscreen = true;
            iframe.allow = 'fullscreen';
            
            // Jika iframe punya tombol fullscreen sendiri, trigger
            setTimeout(() => {
                try {
                    if (iframe.contentWindow && iframe.contentDocument) {
                        const fullscreenBtn = iframe.contentDocument.querySelector('[fullscreen],[data-fullscreen]');
                        if (fullscreenBtn) {
                            fullscreenBtn.click();
                        }
                    }
                } catch (e) {
                    // CORS error, skip
                }
            }, 1000);
        }
        
        // Show fullscreen container
        fullscreenContainer.style.display = 'flex';
        
        // Hide original content
        moduleContainer.style.opacity = '0.3';
        
        // Hide fullscreen button
        fullscreenButton.style.display = 'none';
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        isFullscreen = true;
        
        // Update button
        updateFullscreenButton();
        
        console.log('✅ Fullscreen mode activated');
    }
    
    // Fungsi untuk keluar fullscreen
    function exitFullscreen() {
        if (!isFullscreen) return;
        
        console.log('🚪 Exiting fullscreen mode');
        
        // Restore original styles
        document.body.style.overflow = originalStyles.bodyOverflow || '';
        
        const moduleContainer = document.querySelector('.module-container');
        if (moduleContainer) {
            moduleContainer.style.opacity = '1';
        }
        
        // Hide fullscreen container
        if (fullscreenContainer) {
            fullscreenContainer.style.display = 'none';
        }
        
        // Show fullscreen button
        if (fullscreenButton) {
            fullscreenButton.style.display = 'flex';
        }
        
        isFullscreen = false;
        updateFullscreenButton();
        
        console.log('✅ Fullscreen mode exited');
    }
    
    // Toggle fullscreen
    function toggleFullscreen() {
        if (isFullscreen) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    }
    
    // Update button appearance
    function updateFullscreenButton() {
        if (!fullscreenButton) return;
        
        if (isFullscreen) {
            fullscreenButton.innerHTML = '<i class="fas fa-compress"></i><span class="fullscreen-text">Exit Fullscreen</span>';
            fullscreenButton.style.background = 'rgba(231, 76, 60, 0.9)';
        } else {
            fullscreenButton.innerHTML = '<i class="fas fa-expand"></i><span class="fullscreen-text">Fullscreen</span>';
            fullscreenButton.style.background = 'rgba(52, 152, 219, 0.9)';
        }
    }
    
    // Keyboard shortcuts
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // F11 untuk toggle fullscreen
            if (e.key === 'F11') {
                e.preventDefault();
                toggleFullscreen();
            }
            
            // ESC untuk keluar fullscreen
            if (e.key === 'Escape' && isFullscreen) {
                e.preventDefault();
                exitFullscreen();
            }
            
            // Space untuk play/pause jika di iframe
            if (e.key === ' ' && isFullscreen) {
                const iframe = document.querySelector('#fullscreenContent iframe');
                if (iframe) {
                    e.preventDefault();
                    try {
                        iframe.contentWindow.postMessage({action: 'togglePlay'}, '*');
                    } catch (err) {
                        console.log('Cannot send message to iframe');
                    }
                }
            }
        });
    }
    
    // Detect content changes
    function setupContentObserver() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // Jika content berubah, pastikan button visible
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    setTimeout(() => {
                        const hasContent = document.querySelector('.module-container iframe, [id^="canvaContainer"]');
                        if (fullscreenButton) {
                            fullscreenButton.style.display = hasContent ? 'flex' : 'none';
                        } else if (hasContent) {
                            createFullscreenButton();
                        }
                    }, 500);
                }
            });
        });
        
        const moduleContainer = document.querySelector('.module-container');
        if (moduleContainer) {
            observer.observe(moduleContainer, {
                childList: true,
                subtree: true,
                attributes: true
            });
        }
    }
    
    // Setup for iframe fullscreen API
    function setupIframeFullscreenAPI() {
        // Listen for messages from iframe
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'REQUEST_FULLSCREEN') {
                enterFullscreen();
            }
            
            if (event.data && event.data.type === 'EXIT_FULLSCREEN') {
                exitFullscreen();
            }
        });
        
        // Inject API into iframes
        function injectFullscreenAPI(iframe) {
            if (!iframe.contentWindow) return;
            
            try {
                const script = `
                    window.fullscreenAPI = {
                        requestFullscreen: function() {
                            window.parent.postMessage({type: 'REQUEST_FULLSCREEN'}, '*');
                        },
                        exitFullscreen: function() {
                            window.parent.postMessage({type: 'EXIT_FULLSCREEN'}, '*');
                        }
                    };
                    
                    // Auto-detect fullscreen buttons
                    document.addEventListener('click', function(e) {
                        const btn = e.target.closest('[fullscreen],[data-fullscreen]');
                        if (btn) {
                            window.fullscreenAPI.requestFullscreen();
                        }
                    });
                `;
                
                const scriptEl = iframe.contentDocument.createElement('script');
                scriptEl.textContent = script;
                iframe.contentDocument.head.appendChild(scriptEl);
            } catch (e) {
                // CORS error
            }
        }
        
        // Monitor iframe creation
        const iframeObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.tagName === 'IFRAME') {
                        node.onload = function() {
                            setTimeout(() => injectFullscreenAPI(node), 1000);
                        };
                    }
                });
            });
        });
        
        iframeObserver.observe(document.body, { childList: true, subtree: true });
    }
    
    // Initialize
    function init() {
        console.log('🚀 Initializing Fullscreen Manager...');
        
        // Tunggu DOM siap
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initializeManager, 500);
            });
        } else {
            setTimeout(initializeManager, 500);
        }
        
        function initializeManager() {
            createFullscreenButton();
            createFullscreenContainer();
            setupKeyboardShortcuts();
            setupContentObserver();
            setupIframeFullscreenAPI();
            
            // Initially hide button jika tidak ada content
            setTimeout(() => {
                const hasContent = document.querySelector('.module-container iframe, [id^="canvaContainer"]');
                if (fullscreenButton) {
                    fullscreenButton.style.display = hasContent ? 'flex' : 'none';
                }
            }, 1000);
            
            console.log('✨ Fullscreen Manager ready!');
        }
    }
    
    // Start
    init();
    
    // Export untuk debugging
    window.FullscreenManager = {
        enterFullscreen: enterFullscreen,
        exitFullscreen: exitFullscreen,
        toggleFullscreen: toggleFullscreen
    };
    
})();