/**
 * Admin UI Enhancements
 * Toast Notifications, Confirmation Dialogs, Loading States, Mobile Menu
 */

(function () {
    'use strict';

    // =====================================================
    // TOAST NOTIFICATION SYSTEM
    // =====================================================

    // =====================================================
    // TOAST NOTIFICATION SYSTEM
    // =====================================================

    // Create toast container
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);

    // Toast icons
    const toastIcons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    /**
     * Show toast notification
     * @param {string} type - 'success' | 'error' | 'warning' | 'info'
     * @param {string} message - Message to display
     * @param {number} duration - Duration in ms (default: 3000)
     */
    window.showToast = function (type, message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${toastIcons[type] || toastIcons.info}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        toastContainer.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        return toast;
    };

    // =====================================================
    // CONFIRMATION DIALOG
    // =====================================================

    /**
     * Show confirmation dialog
     * @param {Object} options - Configuration options
     * @param {string} options.title - Dialog title
     * @param {string} options.message - Dialog message
     * @param {string} options.confirmText - Confirm button text (default: 'Xóa')
     * @param {string} options.cancelText - Cancel button text (default: 'Hủy')
     * @param {Function} options.onConfirm - Callback when confirmed
     * @param {Function} options.onCancel - Callback when cancelled
     */
    window.showConfirmDialog = function (options) {
        const {
            title = 'Xác nhận xóa?',
            message = 'Hành động này không thể hoàn tác.',
            confirmText = 'Xóa',
            cancelText = 'Hủy',
            onConfirm = () => { },
            onCancel = () => { }
        } = options;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'confirm-modal-overlay';
        overlay.innerHTML = `
            <div class="confirm-modal">
                <div class="confirm-modal-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                </div>
                <h3 class="confirm-modal-title">${title}</h3>
                <p class="confirm-modal-message">${message}</p>
                <div class="confirm-modal-buttons">
                    <button class="confirm-modal-btn confirm-modal-btn-cancel">${cancelText}</button>
                    <button class="confirm-modal-btn confirm-modal-btn-danger">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Event handlers
        const cancelBtn = overlay.querySelector('.confirm-modal-btn-cancel');
        const confirmBtn = overlay.querySelector('.confirm-modal-btn-danger');

        const close = () => overlay.remove();

        cancelBtn.addEventListener('click', () => {
            close();
            onCancel();
        });

        confirmBtn.addEventListener('click', () => {
            close();
            onConfirm();
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                close();
                onCancel();
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                close();
                onCancel();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        return { close };
    };

    // =====================================================
    // LOADING STATES
    // =====================================================

    /**
     * Set button loading state
     * @param {HTMLElement} button - Button element
     * @param {boolean} loading - Loading state
     */
    window.setButtonLoading = function (button, loading) {
        if (loading) {
            button.classList.add('btn-loading');
            button.disabled = true;
            // Wrap text in span if not already
            if (!button.querySelector('.btn-text')) {
                button.innerHTML = `<span class="btn-text">${button.innerHTML}</span>`;
            }
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
        }
    };

    // =====================================================
    // MOBILE MENU
    // =====================================================

    // Create mobile menu button
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
    `;

    // Create mobile overlay
    const mobileOverlay = document.createElement('div');
    mobileOverlay.className = 'mobile-overlay';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboard.appendChild(mobileMenuBtn);
            dashboard.appendChild(mobileOverlay);

            const sidebar = dashboard.querySelector('aside');

            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                mobileOverlay.classList.toggle('open');
            });

            mobileOverlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                mobileOverlay.classList.remove('open');
            });

            // Close on nav link click (mobile)
            sidebar.querySelectorAll('nav a').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove('open');
                        mobileOverlay.classList.remove('open');
                    }
                });
            });
        }
    });

    // =====================================================
    // OVERRIDE NATIVE ALERT/CONFIRM (Optional)
    // =====================================================

    // Store original functions
    const originalAlert = window.alert;

    // Override alert to use toast
    window.alert = function (message) {
        // Determine type based on message content
        let type = 'info';
        const msgLower = message.toLowerCase();
        if (msgLower.includes('loi') || msgLower.includes('error') || msgLower.includes('thất bại')) {
            type = 'error';
        } else if (msgLower.includes('da luu') || msgLower.includes('thanh cong') || msgLower.includes('success') || msgLower.includes('đã')) {
            type = 'success';
        } else if (msgLower.includes('canh bao') || msgLower.includes('warning')) {
            type = 'warning';
        }
        showToast(type, message);
    };

    // =====================================================
    // SEARCH/FILTER FUNCTIONALITY
    // =====================================================

    // Store all articles for filtering
    let allArticlesCache = [];

    // Inject search bar into articles section
    function injectSearchBar() {
        const articlesSection = document.getElementById('section-articles');
        if (!articlesSection) return;

        // Find the table container
        const tableContainer = articlesSection.querySelector('.bg-white.shadow.sm\\:rounded-lg.overflow-hidden');
        if (!tableContainer || document.getElementById('search-filter-bar')) return;

        // Create search bar HTML
        const searchBar = document.createElement('div');
        searchBar.id = 'search-filter-bar';
        searchBar.className = 'search-filter-bar';
        searchBar.innerHTML = `
            <input type="text" id="article-search" class="search-input" placeholder="🔍 Tìm kiếm bài viết...">
            <select id="article-filter-category" class="filter-select">
                <option value="">Tất cả danh mục</option>
                <option value="Tin tuc">Tin tức</option>
                <option value="Su kien">Sự kiện</option>
                <option value="Hoat dong">Hoạt động</option>
                <option value="Thong bao">Thông báo</option>
                <option value="Thanh tich">Thành tích</option>
            </select>
            <select id="article-filter-status" class="filter-select">
                <option value="">Tất cả trạng thái</option>
                <option value="published">Đã xuất bản</option>
                <option value="draft">Nháp</option>
                <option value="pending">Chờ duyệt</option>
            </select>
            <button type="button" id="clear-filters">
                Xóa bộ lọc
            </button>
        `;

        // Insert before table
        tableContainer.parentNode.insertBefore(searchBar, tableContainer);

        // Add event listeners
        const searchInput = document.getElementById('article-search');
        const categoryFilter = document.getElementById('article-filter-category');
        const statusFilter = document.getElementById('article-filter-status');
        const clearBtn = document.getElementById('clear-filters');

        const debounce = (fn, delay) => {
            let timer;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => fn(...args), delay);
            };
        };

        const applyFilters = debounce(() => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const category = categoryFilter.value;
            const status = statusFilter.value;

            const tbody = document.getElementById('articles-list');
            if (!tbody) return;

            const rows = tbody.querySelectorAll('tr');
            let visibleCount = 0;

            rows.forEach(row => {
                const title = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
                const rowCategory = row.querySelector('td:nth-child(3)')?.textContent || '';
                const rowStatus = row.querySelector('td:nth-child(4) span')?.textContent.toLowerCase() || '';

                // Map displayed status to value
                let statusValue = '';
                if (rowStatus.includes('xuat ban') || rowStatus.includes('published')) statusValue = 'published';
                else if (rowStatus.includes('nhap') || rowStatus.includes('draft')) statusValue = 'draft';
                else if (rowStatus.includes('cho duyet') || rowStatus.includes('pending')) statusValue = 'pending';

                const matchesSearch = !searchTerm || title.includes(searchTerm);
                const matchesCategory = !category || rowCategory.includes(category);
                const matchesStatus = !status || statusValue === status;

                if (matchesSearch && matchesCategory && matchesStatus) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });

            // Show filter results count
            showToast('info', `Tìm thấy ${visibleCount} bài viết`, 1500);
        }, 300);

        searchInput.addEventListener('input', applyFilters);
        categoryFilter.addEventListener('change', applyFilters);
        statusFilter.addEventListener('change', applyFilters);

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            categoryFilter.value = '';
            statusFilter.value = '';
            applyFilters();
        });
    }

    // Wait for DOM and inject search bar
    document.addEventListener('DOMContentLoaded', function () {
        // Delay to ensure articles section is loaded
        setTimeout(injectSearchBar, 500);

        // Also observe for section changes
        const observer = new MutationObserver(() => {
            if (document.getElementById('section-articles') && !document.getElementById('search-filter-bar')) {
                injectSearchBar();
            }
        });

        const main = document.querySelector('main');
        if (main) {
            observer.observe(main, { childList: true, subtree: true });
        }
    });
    // =====================================================
    // PAGINATION SYSTEM
    // =====================================================

    const ITEMS_PER_PAGE = 10;
    let currentPage = 1;
    let totalPages = 1;
    let allRows = [];

    function injectPagination() {
        const articlesSection = document.getElementById('section-articles');
        if (!articlesSection || document.getElementById('pagination-controls')) return;

        const tableContainer = articlesSection.querySelector('table')?.parentElement;
        if (!tableContainer) return;

        // Create pagination controls
        const paginationDiv = document.createElement('div');
        paginationDiv.id = 'pagination-controls';
        paginationDiv.className = 'pagination-controls';
        paginationDiv.innerHTML = `
            <button id="pagination-prev" class="pagination-btn">← Trước</button>
            <span id="pagination-info" class="pagination-info">Trang 1 / 1</span>
            <button id="pagination-next" class="pagination-btn">Tiếp →</button>
        `;

        tableContainer.parentNode.insertBefore(paginationDiv, tableContainer.nextSibling);

        // Add event listeners
        document.getElementById('pagination-prev').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderPage();
            }
        });

        document.getElementById('pagination-next').addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderPage();
            }
        });
    }

    function updatePagination() {
        const tbody = document.getElementById('articles-list');
        if (!tbody) return;

        // Get visible rows (after filtering)
        allRows = Array.from(tbody.querySelectorAll('tr')).filter(row => row.style.display !== 'none');
        totalPages = Math.max(1, Math.ceil(allRows.length / ITEMS_PER_PAGE));
        currentPage = Math.min(currentPage, totalPages);

        renderPage();
    }

    function renderPage() {
        const tbody = document.getElementById('articles-list');
        if (!tbody) return;

        const rows = Array.from(tbody.querySelectorAll('tr'));
        const visibleRows = rows.filter(row => !row.dataset.filtered);

        // Update all rows visibility based on filter first
        rows.forEach(row => {
            if (row.dataset.filtered === 'true') {
                row.style.display = 'none';
            }
        });

        // Then apply pagination to non-filtered rows
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;

        visibleRows.forEach((row, index) => {
            if (index >= start && index < end) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });

        // Update pagination info
        const pageInfo = document.getElementById('pagination-info');
        const prevBtn = document.getElementById('pagination-prev');
        const nextBtn = document.getElementById('pagination-next');

        if (pageInfo) {
            pageInfo.textContent = `Trang ${currentPage} / ${totalPages} (${visibleRows.length} bài viết)`;
        }
        if (prevBtn) prevBtn.disabled = currentPage <= 1;
        if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    }

    // Enhanced applyFilters with pagination
    function applyFiltersWithPagination() {
        const searchInput = document.getElementById('article-search');
        const categoryFilter = document.getElementById('article-filter-category');
        const statusFilter = document.getElementById('article-filter-status');

        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase().trim();
        const category = categoryFilter?.value || '';
        const status = statusFilter?.value || '';

        const tbody = document.getElementById('articles-list');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;

        rows.forEach(row => {
            const title = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
            const rowCategory = row.querySelector('td:nth-child(3)')?.textContent || '';
            const rowStatus = row.querySelector('td:nth-child(4) span')?.textContent.toLowerCase() || '';

            let statusValue = '';
            if (rowStatus.includes('xuat ban') || rowStatus.includes('published')) statusValue = 'published';
            else if (rowStatus.includes('nhap') || rowStatus.includes('draft')) statusValue = 'draft';
            else if (rowStatus.includes('cho duyet') || rowStatus.includes('pending')) statusValue = 'pending';

            const matchesSearch = !searchTerm || title.includes(searchTerm);
            const matchesCategory = !category || rowCategory.includes(category);
            const matchesStatus = !status || statusValue === status;

            if (matchesSearch && matchesCategory && matchesStatus) {
                row.dataset.filtered = 'false';
                visibleCount++;
            } else {
                row.dataset.filtered = 'true';
                row.style.display = 'none';
            }
        });

        // Reset to page 1 and recalculate
        currentPage = 1;
        const visibleRows = Array.from(rows).filter(r => r.dataset.filtered !== 'true');
        totalPages = Math.max(1, Math.ceil(visibleRows.length / ITEMS_PER_PAGE));
        renderPage();
    }

    // Observer to inject pagination when articles load
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(() => {
            injectPagination();

            // Override filter events to use pagination
            const searchInput = document.getElementById('article-search');
            const categoryFilter = document.getElementById('article-filter-category');
            const statusFilter = document.getElementById('article-filter-status');

            if (searchInput) {
                searchInput.removeEventListener('input', applyFiltersWithPagination);
                searchInput.addEventListener('input', debounce(applyFiltersWithPagination, 300));
            }
            if (categoryFilter) {
                categoryFilter.addEventListener('change', applyFiltersWithPagination);
            }
            if (statusFilter) {
                statusFilter.addEventListener('change', applyFiltersWithPagination);
            }

            // Initial pagination setup
            setTimeout(updatePagination, 1000);
        }, 600);

        // Observe for new articles being loaded
        const observer = new MutationObserver(() => {
            if (document.getElementById('articles-list') && !document.getElementById('pagination-controls')) {
                injectPagination();
                setTimeout(updatePagination, 500);
            }
        });

        const main = document.querySelector('main');
        if (main) {
            observer.observe(main, { childList: true, subtree: true });
        }
    });

    // Helper debounce function
    function debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    // =====================================================
    // DARK MODE TOGGLE
    // =====================================================

    function injectDarkModeToggle() {
        if (document.querySelector('.dark-mode-toggle')) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'dark-mode-toggle';
        toggleBtn.title = 'Toggle Dark Mode';
        toggleBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        `;

        document.body.appendChild(toggleBtn);

        // Check saved preference
        const savedTheme = localStorage.getItem('admin-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }

        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('admin-theme', isDark ? 'dark' : 'light');

            // Show toast
            showToast('info', isDark ? 'Đã bật chế độ tối 🌙' : 'Đã bật chế độ sáng ☀️', 1500);
        });
    }

    // Initialize Dark Mode
    document.addEventListener('DOMContentLoaded', () => {
        injectDarkModeToggle();
    });

    console.log('Admin UI Enhancements loaded successfully!');
})();
