// Main Application Initializer
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    Articles.init();
    Events.init();
    Media.init();
    Pages.init();
    Settings.init();

    // Initialize auth (this will show dashboard or login)
    Auth.init();

    // Setup login form
    const loginForm = Utils.$('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = Utils.$('login-username')?.value;
            const password = Utils.$('login-password')?.value;
            await Auth.login(username, password);
        });
    }

    // Setup logout button
    window.logout = () => Auth.logout();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            Utils.$('save-draft-btn')?.click();
        }
    });

    Utils.log('Admin panel initialized');
});
