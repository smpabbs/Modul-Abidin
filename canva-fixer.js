// canva-fixer.js - Fixed version with cleanup
(function() {
    console.log('✅ Canva Fixer Loaded');
    
    let currentCanvaContainer = null;
    let lastCanvaURL = '';
    
    // Fungsi untuk memperbaiki URL Canva
    function fixCanvaURL(url) {
        if (!url.includes('canva.com')) return url;
        
        console.log('🔄 Processing Canva URL:', url);
        
        // Pattern 1: /view URL → convert ke /embed
        if (url.includes('/design/') && url.includes('/view')) {
            // Jika sudah ada ?embed, biarkan
            if (url.includes('?embed')) return url;
            
            // Tambahkan ?embed di akhir
            return url + (url.includes('?') ? '&' : '?') + 'embed';
        }
        
        // Pattern 2: Present mode → convert ke embed
        if (url.includes('/present')) {
            return url.replace('/present', '/view?embed');
        }
        
        // Pattern 3: Edit mode → convert ke embed
        if (url.includes('/edit')) {
            return url.replace('/edit', '/view?embed');
        }
        
        return url;
    }
    
    // Fungsi untuk membersihkan Canva container lama
    function cleanupOldCanva() {
        if (currentCanvaContainer) {
            console.log('🧹 Cleaning up old Canva container');
            
            // Hapus event listeners dulu
            const iframe = currentCanvaContainer.querySelector('iframe');
            if (iframe) {
                iframe.src = 'about:blank'; // Stop loading
                try {
                    iframe.contentWindow.location.href = 'about:blank';
                } catch (e) {}
            }
            
            // Hapus dari DOM
            currentCanvaContainer.remove();
            currentCanvaContainer = null;
        }
        
        // Juga hapus container lama jika ada
        const oldContainers = document.querySelectorAll('.canva-container, #canvaContainer');
        oldContainers.forEach(container => {
            if (container.parentNode) {
                container.remove();
            }
        });
    }
    
    // Fungsi untuk membuat Canva container baru
    function createCanvaContainer(url) {
        cleanupOldCanva(); // Bersihkan yang lama
        
        const fixedURL = fixCanvaURL(url);
        console.log('🔧 Creating new Canva container for:', fixedURL);
        
        // Buat container utama
        const container = document.createElement('div');
        container.id = 'canvaContainer-' + Date.now();
        container.className = 'canva-container';
        container.style.cssText = `
            width: 100%;
            height: 75vh;
            min-height: 500px;
            position: relative;
            margin: 20px 0;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        `;
        
        // Buat iframe untuk Canva
        const iframe = document.createElement('iframe');
        iframe.id = 'canvaIframe-' + Date.now();
        iframe.src = fixedURL;
        iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            display: block;
        `;
        iframe.allow = 'fullscreen';
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        
        // Buat loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'canvaLoading';
        loadingDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 10;
        `;
        loadingDiv.innerHTML = `
            <div style="
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            "></div>
            <p style="color: #666; margin: 0;">Loading Canva...</p>
        `;
        
        // Buat fallback button (sembunyikan dulu)
        const fallbackButton = document.createElement('a');
        fallbackButton.href = url;
        fallbackButton.target = '_blank';
        fallbackButton.rel = 'noopener noreferrer';
        fallbackButton.style.cssText = `
            display: none;
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #e74c3c;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            z-index: 20;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        `;
        fallbackButton.innerHTML = '<i class="fas fa-external-link-alt"></i> Buka di Tab Baru';
        
        // Buat refresh button
        const refreshButton = document.createElement('button');
        refreshButton.id = 'canvaRefresh';
        refreshButton.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            z-index: 20;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        refreshButton.innerHTML = '<i class="fas fa-redo"></i> Refresh';
        refreshButton.onclick = function() {
            const timestamp = new Date().getTime();
            const newURL = fixedURL + (fixedURL.includes('?') ? '&' : '?') + '_t=' + timestamp;
            iframe.src = newURL;
            loadingDiv.style.display = 'block';
            fallbackButton.style.display = 'none';
        };
        
        // Tambahkan CSS animation untuk loading
        if (!document.querySelector('#canva-spin-style')) {
            const style = document.createElement('style');
            style.id = 'canva-spin-style';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Tambahkan semua ke container
        container.appendChild(loadingDiv);
        container.appendChild(iframe);
        container.appendChild(fallbackButton);
        container.appendChild(refreshButton);
        
        // Event listener untuk iframe load
        iframe.onload = function() {
            console.log('✅ Canva iframe loaded');
            loadingDiv.style.display = 'none';
            
            // Cek setelah 2 detik apakah benar-benar loaded
            setTimeout(() => {
                try {
                    // Coba akses iframe content
                    if (iframe.contentDocument && iframe.contentDocument.body) {
                        const bodyHTML = iframe.contentDocument.body.innerHTML;
                        if (bodyHTML.includes('canva') || bodyHTML.length > 100) {
                            console.log('✅ Canva content verified');
                        } else {
                            console.log('⚠️ Canva might be blocked');
                            fallbackButton.style.display = 'block';
                        }
                    }
                } catch (e) {
                    // CORS error, mungkin Canva blocked
                    console.log('⚠️ CORS error, showing fallback');
                    fallbackButton.style.display = 'block';
                }
            }, 2000);
        };
        
        iframe.onerror = function() {
            console.log('❌ Canva iframe failed to load');
            loadingDiv.style.display = 'none';
            fallbackButton.style.display = 'block';
        };
        
        currentCanvaContainer = container;
        lastCanvaURL = url;
        
        return container;
    }
    
    // Fungsi utama untuk meng-handle Canva
    function handleCanvaContent() {
        const iframe = document.getElementById('moduleFrame');
        if (!iframe) return;
        
        const src = iframe.src;
        if (!src.includes('canva.com')) {
            // Jika bukan Canva, bersihkan container Canva jika ada
            cleanupOldCanva();
            
            // Pastikan iframe regular terlihat
            iframe.style.display = 'block';
            return;
        }
        
        console.log('🎯 Handling Canva content...');
        
        // Sembunyikan iframe regular
        iframe.style.display = 'none';
        
        // Cek jika ini Canva yang sama dengan sebelumnya
        if (lastCanvaURL === src && currentCanvaContainer) {
            console.log('📌 Same Canva URL, keeping existing container');
            return;
        }
        
        // Buat container baru untuk Canva
        const canvaContainer = createCanvaContainer(src);
        
        // Cari module container
        const moduleContainer = iframe.closest('.module-container') || iframe.parentElement;
        if (moduleContainer) {
            // Temukan posisi iframe di moduleContainer
            const iframeIndex = Array.from(moduleContainer.children).indexOf(iframe);
            
            // Sisipkan Canva container setelah iframe
            if (iframeIndex !== -1) {
                moduleContainer.insertBefore(canvaContainer, iframe.nextSibling);
            } else {
                moduleContainer.appendChild(canvaContainer);
            }
        }
    }
    
    // Hook ke sistem navigation yang ada
    function hookIntoNavigation() {
        // Cari fungsi loadChapter yang sudah ada
        const originalLoadChapter = window.loadChapter;
        
        if (originalLoadChapter) {
            console.log('🔗 Hooking into existing loadChapter function');
            
            // Override fungsi loadChapter
            window.loadChapter = function(index) {
                // Panggil fungsi original
                const result = originalLoadChapter.apply(this, arguments);
                
                // Setelah load chapter, handle Canva content
                setTimeout(handleCanvaContent, 100);
                
                return result;
            };
        }
        
        // Juga hook ke event chapter link click
        const chapterList = document.getElementById('chapterList');
        if (chapterList) {
            chapterList.addEventListener('click', function(e) {
                setTimeout(handleCanvaContent, 300);
            });
        }
        
        // Hook ke navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                setTimeout(handleCanvaContent, 300);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                setTimeout(handleCanvaContent, 300);
            });
        }
    }
    
    // Setup MutationObserver untuk monitor perubahan iframe src
    function setupIframeMonitor() {
        const iframe = document.getElementById('moduleFrame');
        if (!iframe) return;
        
        let lastSrc = iframe.src;
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                    const newSrc = iframe.src;
                    if (newSrc !== lastSrc) {
                        lastSrc = newSrc;
                        console.log('🔄 Iframe src changed:', newSrc);
                        
                        // Tunggu sebentar lalu handle Canva
                        setTimeout(handleCanvaContent, 200);
                    }
                }
            });
        });
        
        observer.observe(iframe, { attributes: true });
    }
    
    // Setup periodic check
    function setupPeriodicCheck() {
        setInterval(() => {
            const iframe = document.getElementById('moduleFrame');
            if (iframe && iframe.src.includes('canva.com')) {
                // Refresh fallback button jika perlu
                const fallbackBtn = document.querySelector('[href*="canva.com"]');
                if (fallbackBtn && fallbackBtn.href !== iframe.src) {
                    fallbackBtn.href = iframe.src;
                }
            }
        }, 3000);
    }
    
    // Initialize
    function init() {
        console.log('🚀 Initializing Canva Fixer...');
        
        // Tunggu DOM siap
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    hookIntoNavigation();
                    setupIframeMonitor();
                    setupPeriodicCheck();
                    handleCanvaContent(); // Handle initial load
                }, 500);
            });
        } else {
            setTimeout(function() {
                hookIntoNavigation();
                setupIframeMonitor();
                setupPeriodicCheck();
                handleCanvaContent(); // Handle initial load
            }, 500);
        }
    }
    
    // Start
    init();
    
    // Export fungsi untuk debugging
    window.CanvaFixer = {
        handleCanvaContent: handleCanvaContent,
        cleanupOldCanva: cleanupOldCanva,
        fixCanvaURL: fixCanvaURL
    };
    
    console.log('✨ Canva Fixer ready!');
})();