const Utils = {
    // Safe DOM selector
    $(id) {
        return document.getElementById(id);
    },

    // Show toast notification
    showToast(type, message) {
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'error' : ''}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), CONFIG.UI.TOAST_DURATION);
    },

    // Show error message
    showError(msg) {
        this.showToast('error', msg);
    },

    // Show success message
    showSuccess(msg) {
        this.showToast('success', msg);
    },

    // Format date
    formatDate(date, locale = 'vi-VN') {
        return new Date(date).toLocaleDateString(locale);
    },

    // Format datetime
    formatDateTime(date) {
        return new Date(date).toISOString().slice(0, 16);
    },

    // Debounce function
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    // Check if authenticated
    isAuthenticated() {
        return !!localStorage.getItem(CONFIG.STORAGE.TOKEN_KEY);
    },

    // Get token
    getToken() {
        return localStorage.getItem(CONFIG.STORAGE.TOKEN_KEY);
    },

    // Set token
    setToken(token) {
        localStorage.setItem(CONFIG.STORAGE.TOKEN_KEY, token);
    },

    // Remove token
    removeToken() {
        localStorage.removeItem(CONFIG.STORAGE.TOKEN_KEY);
    },

    // Escape HTML for security
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Validate string length
    validateString(str, minLength = 1, maxLength = 500) {
        return str && str.length >= minLength && str.length <= maxLength;
    },

    // Generate slug from title
    generateSlug(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    },

    // Logging helpers
    log(...args) {
        if (console && console.log) console.log('[Admin]', ...args);
    },

    warn(...args) {
        if (console && console.warn) console.warn('[Admin]', ...args);
    },

    error(...args) {
        if (console && console.error) console.error('[Admin]', ...args);
    }
};

// Freeze to prevent modifications
Object.freeze(Utils);
