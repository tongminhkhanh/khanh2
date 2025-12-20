const Auth = {
    currentUser: null,

    // Initialize auth state
    init() {
        const token = Utils.getToken();
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.currentUser = payload;
                this.showDashboard();
            } catch (e) {
                this.showAuth();
            }
        } else {
            this.showAuth();
        }
    },

    // Login
    async login(username, password) {
        try {
            const data = await API.post('/login', { username, password });
            if (data.token) {
                Utils.setToken(data.token);
                this.currentUser = JSON.parse(atob(data.token.split('.')[1]));
                this.showDashboard();
                return true;
            }
            return false;
        } catch (error) {
            Utils.showError(error.message || 'Login failed');
            return false;
        }
    },

    // Logout
    logout() {
        Utils.removeToken();
        this.currentUser = null;
        window.location.href = '/admin-login.html';
    },

    // Check if authenticated
    checkAuth() {
        return !!this.currentUser;
    },

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    },

    // Show auth modal
    showAuth() {
        Utils.$('auth-modal').classList.remove('hidden');
        Utils.$('dashboard').classList.add('hidden');
    },

    // Show dashboard
    showDashboard() {
        Utils.$('auth-modal').classList.add('hidden');
        Utils.$('dashboard').classList.remove('hidden');

        if (this.currentUser) {
            const userNameEl = Utils.$('user-name');
            const userRoleEl = Utils.$('user-role');
            const userAvatarEl = Utils.$('user-avatar');
            const adminNameEl = Utils.$('admin-name');

            if (userNameEl) userNameEl.innerText = this.currentUser.username;
            if (userRoleEl) userRoleEl.innerText = this.currentUser.role ? this.currentUser.role.toUpperCase() : 'USER';
            if (userAvatarEl) userAvatarEl.innerText = this.currentUser.username ? this.currentUser.username.charAt(0).toUpperCase() : 'A';
            if (adminNameEl) adminNameEl.innerText = `👤 ${this.currentUser.username}`;
        }

        // Load default tab
        if (typeof Navigation !== 'undefined') {
            Navigation.switchTab('articles');
        }
    },

    // Show error message
    showError(msg) {
        const el = Utils.$('auth-error');
        if (el) {
            el.textContent = msg;
            el.classList.remove('hidden');
        }
    }
};

// Expose to window for backward compatibility
window.Auth = Auth;
window.showAuth = () => Auth.showAuth();
window.showDashboard = () => Auth.showDashboard();
window.showError = (msg) => Auth.showError(msg);
