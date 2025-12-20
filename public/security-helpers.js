const Security = {
    sanitize: (str) => {
        if (!str) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return str.replace(/[&<>"']/g, (m) => map[m]);
    },

    setToken: (token) => {
        localStorage.setItem('admin-token', token);
    },

    getToken: () => {
        return localStorage.getItem('admin-token');
    },

    removeToken: () => {
        localStorage.removeItem('admin-token');
    }
};

const SecureStorage = {
    setToken: Security.setToken,
    getToken: Security.getToken,
    removeToken: Security.removeToken
};

window.Security = Security;
window.SecureStorage = SecureStorage;
