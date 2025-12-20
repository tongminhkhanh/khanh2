/**
 * Admin UI Enhancements
 * Toast Notifications, Confirmation Dialogs, Loading States, Mobile Menu
 */

(function () {
    'use strict';

    // =====================================================
    // TOAST NOTIFICATION SYSTEM
    // =====================================================

    // Create toast container
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        pointer-events: none;
    `;
    document.body.appendChild(toastContainer);

    // Add toast styles
    const toastStyles = document.createElement('style');
    toastStyles.textContent = `
        .toast {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 1.25rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            animation: toast-slide-in 0.3s ease-out;
            min-width: 300px;
            max-width: 400px;
            pointer-events: auto;
            font-family: 'Lexend', sans-serif;
        }
        .toast.toast-exit {
            animation: toast-slide-out 0.3s ease-in forwards;
        }
        .toast-success {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
        }
        .toast-error {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
        }
        .toast-warning {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
        }
        .toast-info {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
        }
        .toast-icon {
            width: 1.5rem;
            height: 1.5rem;
            flex-shrink: 0;
        }
        .toast-message {
            flex: 1;
            font-size: 0.875rem;
            font-weight: 500;
        }
        .toast-close {
            background: none;
            border: none;
            color: white;
            opacity: 0.7;
            cursor: pointer;
            padding: 0.25rem;
            transition: opacity 0.2s;
            font-size: 1.25rem;
            line-height: 1;
        }
        .toast-close:hover {
            opacity: 1;
        }
        @keyframes toast-slide-in {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toast-slide-out {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }

        /* Confirmation Modal */
        .confirm-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fade-in 0.2s ease-out;
        }
        .confirm-modal {
            background: white;
            border-radius: 1rem;
            padding: 1.5rem;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            animation: modal-pop-in 0.3s ease-out;
            font-family: 'Lexend', sans-serif;
        }
        .confirm-modal-icon {
            width: 4rem;
            height: 4rem;
            margin: 0 auto 1rem;
            background: #fef2f2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .confirm-modal-icon svg {
            width: 2rem;
            height: 2rem;
            color: #ef4444;
        }
        .confirm-modal-title {
            font-size: 1.25rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 0.5rem;
            color: #1f2937;
        }
        .confirm-modal-message {
            text-align: center;
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
        }
        .confirm-modal-buttons {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
        }
        .confirm-modal-btn {
            padding: 0.625rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s;
            font-family: 'Lexend', sans-serif;
        }
        .confirm-modal-btn-cancel {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #e5e7eb;
        }
        .confirm-modal-btn-cancel:hover {
            background: #e5e7eb;
        }
        .confirm-modal-btn-danger {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border: none;
        }
        .confirm-modal-btn-danger:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes modal-pop-in {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        /* Loading Button States */
        .btn-loading {
            position: relative;
            pointer-events: none;
            opacity: 0.7;
        }
        .btn-loading .btn-text {
            visibility: hidden;
        }
        .btn-loading::after {
            content: '';
            position: absolute;
            width: 1.25rem;
            height: 1.25rem;
            top: 50%;
            left: 50%;
            margin-left: -0.625rem;
            margin-top: -0.625rem;
            border: 2px solid transparent;
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Mobile Menu */
        .mobile-menu-btn {
            display: none;
            position: fixed;
            top: 1rem;
            left: 1rem;
            z-index: 60;
            padding: 0.5rem;
            background: #1f2937;
            border-radius: 0.5rem;
            border: none;
            cursor: pointer;
            color: white;
            align-items: center;
            justify-content: center;
        }
        .mobile-menu-btn svg {
            width: 1.5rem;
            height: 1.5rem;
        }
        .mobile-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 40;
        }
        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: flex;
            }
            #dashboard > aside {
                position: fixed;
                transform: translateX(-100%);
                transition: transform 0.3s ease;
                z-index: 50;
                height: 100vh;
            }
            #dashboard > aside.open {
                transform: translateX(0);
            }
            .mobile-overlay.open {
                display: block;
            }
            #dashboard > .flex-1 > header {
                padding-left: 4rem;
            }
        }

        /* Search/Filter Bar */
        .search-filter-bar {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 1rem;
            padding: 1rem;
            background: #f9fafb;
            border-radius: 0.5rem;
        }
        .search-input {
            flex: 1;
            min-width: 200px;
            padding: 0.5rem 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            background: white;
            font-family: 'Lexend', sans-serif;
        }
        .search-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .filter-select {
            padding: 0.5rem 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            background: white;
            min-width: 150px;
            font-family: 'Lexend', sans-serif;
        }

        /* Pagination */
        .pagination-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            margin-top: 1.5rem;
            padding: 1rem;
        }
        .pagination-btn {
            padding: 0.5rem 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
            font-family: 'Lexend', sans-serif;
        }
        .pagination-btn:hover:not(:disabled) {
            background: #f3f4f6;
        }
        .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .pagination-info {
            padding: 0.5rem 1rem;
            color: #6b7280;
            font-size: 0.875rem;
        }
    `;
    document.head.appendChild(toastStyles);

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
            <button type="button" id="clear-filters" style="color:#3b82f6;font-size:0.875rem;background:none;border:none;cursor:pointer;">
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

    console.log('Admin UI Enhancements loaded successfully!');
})();
