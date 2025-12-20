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
        sessionStorage.setItem('admin-token', token);
    },

    getToken: () => {
        return sessionStorage.getItem('admin-token');
    },

    removeToken: () => {
        sessionStorage.removeItem('admin-token');
    }
};

const SecureStorage = {
    setToken: Security.setToken,
    getToken: Security.getToken,
    removeToken: Security.removeToken
};

window.Security = Security;
window.SecureStorage = SecureStorage;
