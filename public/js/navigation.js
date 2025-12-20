const Navigation = {
    // Switch tab
    switchTab(tabId) {
        // Update tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            const onClick = btn.getAttribute('onclick');
            if (onClick && onClick.includes(`'${tabId}'`)) {
                btn.classList.add('active');
            }
        });

        // Update sidebar
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
            const onClick = link.getAttribute('onclick');
            const href = link.getAttribute('href');
            if ((onClick && onClick.includes(`'${tabId}'`)) || (href && href.includes(`'${tabId}'`))) {
                link.classList.add('active');
            }
        });

        // Hide all main sections
        const sections = ['articles', 'events', 'media', 'settings', 'pages'];
        sections.forEach(s => {
            const el = Utils.$(`section-${s}`);
            if (el) el.classList.add('hidden');
        });

        // Handle Article Sub-views
        if (tabId === 'articles') {
            Utils.$('section-articles')?.classList.remove('hidden');
            Utils.$('articles-list-container')?.classList.remove('hidden');
            Utils.$('article-editor-container')?.classList.add('hidden');
            Utils.$('page-title').textContent = 'Article Management';
            Articles.fetch();
        } else if (tabId === 'add-article') {
            Utils.$('section-articles')?.classList.remove('hidden');
            Utils.$('articles-list-container')?.classList.add('hidden');
            Utils.$('article-editor-container')?.classList.remove('hidden');
            Utils.$('page-title').textContent = 'Add New Article';
            Articles.resetForm();
        } else {
            const el = Utils.$(`section-${tabId}`);
            if (el) el.classList.remove('hidden');

            const titles = {
                'events': 'Event Management',
                'media': 'Media Library',
                'settings': 'System Settings',
                'pages': 'Static Page Management'
            };
            Utils.$('page-title').textContent = titles[tabId] || 'Admin Panel';

            if (tabId === 'events') Events.fetch();
            if (tabId === 'media') Media.fetch();
            if (tabId === 'pages') Pages.fetch();
            if (tabId === 'settings') Settings.fetch();
        }
    }
};

// Expose to window
window.Navigation = Navigation;
window.switchTab = (tabId) => Navigation.switchTab(tabId);
