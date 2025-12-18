/* ============================================
   ADVANCED UI/UX ENHANCEMENTS - JavaScript
   ============================================ */

(function () {
    'use strict';

    // ===== 1. DARK MODE TOGGLE =====
    function initDarkMode() {
        const saved = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (saved === 'true' || (saved === null && prefersDark)) {
            document.documentElement.classList.add('dark');
        }

        // Create toggle button if not exists
        if (!document.getElementById('dark-mode-toggle')) {
            const btn = document.createElement('button');
            btn.id = 'dark-mode-toggle';
            btn.className = 'dark-mode-toggle';
            btn.setAttribute('aria-label', 'Chuyển chế độ sáng/tối');
            btn.setAttribute('title', 'Chuyển chế độ sáng/tối');
            btn.innerHTML = '<span class="material-symbols-outlined">dark_mode</span>';
            document.body.appendChild(btn);

            btn.addEventListener('click', toggleDarkMode);
        }

        updateDarkModeIcon();
    }

    function toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
        updateDarkModeIcon();
        showToast(isDark ? 'Đã bật chế độ tối' : 'Đã bật chế độ sáng', 'info');
    }

    function updateDarkModeIcon() {
        const btn = document.getElementById('dark-mode-toggle');
        if (btn) {
            const isDark = document.documentElement.classList.contains('dark');
            btn.innerHTML = `<span class="material-symbols-outlined">${isDark ? 'light_mode' : 'dark_mode'}</span>`;
        }
    }

    // ===== 2. LAZY LOADING IMAGES =====
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('lazy-image');

                    img.onload = () => {
                        img.classList.add('loaded');
                        img.removeAttribute('data-src');
                    };

                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // ===== 3. MOBILE NAVIGATION MENU =====
    function initMobileMenu() {
        // Create overlay if not exists
        if (!document.querySelector('.mobile-menu-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'mobile-menu-overlay';
            overlay.onclick = closeMobileMenu;
            document.body.appendChild(overlay);
        }

        // Create mobile menu if not exists
        if (!document.querySelector('.mobile-menu')) {
            const menu = document.createElement('div');
            menu.className = 'mobile-menu';
            menu.innerHTML = `
                <div class="mobile-menu-header">
                    <span class="text-lg font-bold text-text-main dark:text-white">Menu</span>
                    <button class="mobile-menu-close" onclick="closeMobileMenu()">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <nav class="mobile-menu-nav">
                    <a href="/"><span class="material-symbols-outlined">home</span> Trang chủ</a>
                    <a href="/gioi-thieu"><span class="material-symbols-outlined">info</span> Giới thiệu</a>
                    <a href="/thong-bao"><span class="material-symbols-outlined">campaign</span> Thông báo</a>
                    <a href="/hoat-dong"><span class="material-symbols-outlined">celebration</span> Hoạt động</a>
                    <a href="/thanh-tich"><span class="material-symbols-outlined">emoji_events</span> Thành tích</a>
                    <a href="/su-kien"><span class="material-symbols-outlined">event</span> Sự kiện</a>
                    <a href="http://thitong.site" target="_blank"><span class="material-symbols-outlined">smart_toy</span> Trợ lý AI</a>
                    <a href="/admin"><span class="material-symbols-outlined">admin_panel_settings</span> Đăng nhập</a>
                </nav>
            `;
            document.body.appendChild(menu);
        }

        // Add click handler to hamburger button
        const hamburger = document.querySelector('button.lg\\:hidden');
        if (hamburger) {
            hamburger.onclick = openMobileMenu;
        }
    }

    window.openMobileMenu = function () {
        document.querySelector('.mobile-menu-overlay')?.classList.add('active');
        document.querySelector('.mobile-menu')?.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeMobileMenu = function () {
        document.querySelector('.mobile-menu-overlay')?.classList.remove('active');
        document.querySelector('.mobile-menu')?.classList.remove('active');
        document.body.style.overflow = '';
    };

    // ===== 4. TOAST NOTIFICATIONS =====
    function initToast() {
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    window.showToast = function (message, type = 'info', duration = 3000) {
        const container = document.querySelector('.toast-container');
        if (!container) return;

        const icons = {
            success: 'check',
            error: 'close',
            warning: 'warning',
            info: 'info'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <span class="material-symbols-outlined" style="font-size: 16px;">${icons[type]}</span>
            </div>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
            </button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    // ===== 5. SCROLL ANIMATIONS =====
    function initScrollAnimations() {
        const elements = document.querySelectorAll('.scroll-animate');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(el => observer.observe(el));
    }

    // Auto-add scroll-animate to articles
    function addScrollAnimationToCards() {
        const cards = document.querySelectorAll('#news-grid article:not(.skeleton-card)');
        cards.forEach((card, index) => {
            if (!card.classList.contains('scroll-animate')) {
                card.classList.add('scroll-animate');
                card.setAttribute('data-delay', (index % 4) + 1);
            }
        });
        initScrollAnimations();
    }

    // ===== 6. READING PROGRESS BAR =====
    function initReadingProgress() {
        // Only on article pages
        if (!window.location.pathname.includes('bai-viet')) return;

        if (!document.querySelector('.reading-progress')) {
            const bar = document.createElement('div');
            bar.className = 'reading-progress';
            document.body.appendChild(bar);
        }

        const progressBar = document.querySelector('.reading-progress');

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        });
    }

    // ===== 7. SOCIAL SHARE POPUP =====
    function initSharePopup() {
        if (!document.querySelector('.share-popup-overlay')) {
            const popup = document.createElement('div');
            popup.className = 'share-popup-overlay';
            popup.innerHTML = `
                <div class="share-popup">
                    <div class="share-popup-header">
                        <h3 class="share-popup-title">Chia sẻ bài viết</h3>
                        <button class="share-popup-close" onclick="closeSharePopup()">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="share-buttons">
                        <a href="#" class="share-btn share-btn-facebook" onclick="shareToFacebook()">
                            <div class="share-btn-icon">f</div>
                            <span class="share-btn-label">Facebook</span>
                        </a>
                        <a href="#" class="share-btn share-btn-twitter" onclick="shareToTwitter()">
                            <div class="share-btn-icon">𝕏</div>
                            <span class="share-btn-label">Twitter</span>
                        </a>
                        <a href="#" class="share-btn share-btn-linkedin" onclick="shareToLinkedIn()">
                            <div class="share-btn-icon">in</div>
                            <span class="share-btn-label">LinkedIn</span>
                        </a>
                        <button class="share-btn share-btn-copy" onclick="copyShareUrl()">
                            <div class="share-btn-icon">
                                <span class="material-symbols-outlined" style="font-size: 20px;">link</span>
                            </div>
                            <span class="share-btn-label">Sao chép</span>
                        </button>
                    </div>
                    <div class="share-url-box">
                        <input type="text" class="share-url-input" id="share-url-input" readonly>
                        <button class="share-url-copy" onclick="copyShareUrl()">Sao chép</button>
                    </div>
                </div>
            `;
            popup.onclick = (e) => {
                if (e.target === popup) closeSharePopup();
            };
            document.body.appendChild(popup);
        }
    }

    window.openSharePopup = function () {
        document.getElementById('share-url-input').value = window.location.href;
        document.querySelector('.share-popup-overlay')?.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeSharePopup = function () {
        document.querySelector('.share-popup-overlay')?.classList.remove('active');
        document.body.style.overflow = '';
    };

    window.shareToFacebook = function () {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
        closeSharePopup();
    };

    window.shareToTwitter = function () {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank', 'width=600,height=400');
        closeSharePopup();
    };

    window.shareToLinkedIn = function () {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
        closeSharePopup();
    };

    window.copyShareUrl = function () {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showToast('Đã sao chép đường dẫn!', 'success');
            closeSharePopup();
        }).catch(() => {
            showToast('Không thể sao chép đường dẫn', 'error');
        });
    };

    // ===== INITIALIZE ALL FEATURES =====
    function initAllFeatures() {
        initDarkMode();
        initMobileMenu();
        initToast();
        initLazyLoading();
        initScrollAnimations();
        initReadingProgress();
        initSharePopup();

        // Re-run scroll animations when new content loaded
        const observer = new MutationObserver(() => {
            addScrollAnimationToCards();
        });

        const newsGrid = document.getElementById('news-grid');
        if (newsGrid) {
            observer.observe(newsGrid, { childList: true });
        }

        // Initial call for existing cards
        setTimeout(addScrollAnimationToCards, 500);
    }

    // Run when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllFeatures);
    } else {
        initAllFeatures();
    }

})();
