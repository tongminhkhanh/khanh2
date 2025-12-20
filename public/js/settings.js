const Settings = {
    // Initialize
    init() {
        this.setupForms();
    },

    // Setup form listeners
    setupForms() {
        // Ticker settings
        const tickerForm = Utils.$('ticker-settings-form');
        if (tickerForm) {
            tickerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveTicker();
            });
        }

        // Urgent notice
        const urgentForm = Utils.$('urgent-notice-form');
        if (urgentForm) {
            urgentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveUrgentNotice();
            });
        }

        // Principal message
        const principalForm = Utils.$('principal-message-form');
        if (principalForm) {
            principalForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.savePrincipalMessage();
            });
        }
    },

    // Fetch all settings
    async fetch() {
        try {
            // Ticker Settings
            const tickerData = await API.get('/settings/ticker_settings');
            if (tickerData.value) {
                Utils.$('ticker-enabled').checked = tickerData.value.isEnabled || false;
                Utils.$('ticker-content-input').value = tickerData.value.content || '';
            }

            // Urgent Notice
            const urgentData = await API.get('/settings/urgent_notice');
            if (urgentData.value) {
                Utils.$('urgent-enabled').checked = urgentData.value.isEnabled || false;
                Utils.$('urgent-content').value = urgentData.value.content || '';
                Utils.$('urgent-link').value = urgentData.value.link || '';
            }

            // Principal Message
            const principalData = await API.get('/settings/principal_message');
            if (principalData.value) {
                Utils.$('principal-title').value = principalData.value.title || '';
                Utils.$('principal-content').value = principalData.value.content || '';
            }
        } catch (err) {
            Utils.error(err);
        }
    },

    // Save ticker settings
    async saveTicker() {
        const data = {
            isEnabled: Utils.$('ticker-enabled')?.checked,
            content: Utils.$('ticker-content-input')?.value
        };

        try {
            await API.put('/admin/settings/ticker_settings', {
                value: data,
                description: 'Ticker Bar Settings'
            });
            Utils.showSuccess('Ticker settings saved!');
        } catch (err) {
            Utils.showError('Error: ' + err.message);
        }
    },

    // Save urgent notice
    async saveUrgentNotice() {
        const data = {
            isEnabled: Utils.$('urgent-enabled')?.checked,
            content: Utils.$('urgent-content')?.value,
            link: Utils.$('urgent-link')?.value
        };

        try {
            await API.put('/admin/settings/urgent_notice', {
                value: data,
                description: 'Urgent Notice'
            });
            Utils.showSuccess('Settings saved!');
        } catch (err) {
            Utils.showError('Error: ' + err.message);
        }
    },

    // Save principal message
    async savePrincipalMessage() {
        const data = {
            title: Utils.$('principal-title')?.value,
            content: Utils.$('principal-content')?.value
        };

        try {
            await API.put('/admin/settings/principal_message', {
                value: data,
                description: 'Principal Message'
            });
            Utils.showSuccess('Message saved!');
        } catch (err) {
            Utils.showError('Error: ' + err.message);
        }
    }
};

// Expose to window
window.Settings = Settings;
