const Pages = {
    editor: null,

    // Initialize
    init() {
        this.setupForm();
        this.setupEditor();
    },

    // Setup form listeners
    setupForm() {
        const form = Utils.$('page-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.save();
            });
        }

        const cancelBtn = Utils.$('cancel-page-edit');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.resetForm());
        }

        const titleInput = Utils.$('page-title-input');
        if (titleInput) {
            titleInput.addEventListener('input', () => this.generateSlug());
        }
    },

    // Setup page editor
    setupEditor() {
        const editorElement = Utils.$('page-editor');
        if (!editorElement || typeof Tiptap === 'undefined') return;

        this.editor = new Tiptap.Editor({
            element: editorElement,
            extensions: [
                Tiptap.StarterKit,
                Tiptap.Link.configure({ openOnClick: false }),
                Tiptap.Image,
            ],
            content: '',
        });

        window.pageEditor = this.editor;
    },

    // Generate slug from title
    generateSlug() {
        const title = Utils.$('page-title-input')?.value || '';
        const slug = Utils.generateSlug(title);
        Utils.$('page-slug').value = slug;
    },

    // Fetch pages list
    async fetch() {
        const tbody = Utils.$('pages-list');
        if (!tbody) return;

        tbody.innerHTML = Array(3).fill(0).map(() => `
            <tr class="skeleton-row">
                <td class="px-6 py-4"><div class="skeleton h-4 w-3/4 rounded"></div></td>
                <td class="px-6 py-4"><div class="skeleton h-4 w-1/2 rounded"></div></td>
                <td class="px-6 py-4"><div class="skeleton h-4 w-1/4 rounded"></div></td>
                <td class="px-6 py-4 text-right"><div class="skeleton h-8 w-16 rounded ml-auto"></div></td>
            </tr>
        `).join('');

        try {
            const pages = await API.get('/admin/static-pages');

            if (!pages || pages.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-12 text-center text-gray-500">No pages found</td></tr>`;
                return;
            }

            tbody.innerHTML = pages.map(p => `
                <tr>
                    <td class="px-6 py-4 font-medium">${Utils.escapeHtml(p.title)}</td>
                    <td class="px-6 py-4 text-gray-500">${p.slug}</td>
                    <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-full ${p.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">${p.isPublished ? 'Published' : 'Draft'}</span></td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="Pages.edit('${p._id}')" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                        <button onclick="Pages.delete('${p._id}')" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            Utils.error(err);
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Error loading data</td></tr>`;
        }
    },

    // Save page
    async save() {
        const id = Utils.$('page-id')?.value;
        const content = this.editor ? this.editor.getHTML() : '';

        const page = {
            title: Utils.$('page-title-input')?.value,
            slug: Utils.$('page-slug')?.value,
            content: content,
            isPublished: Utils.$('page-published')?.checked
        };

        const endpoint = id ? `/admin/static-pages/${id}` : '/admin/static-pages';

        try {
            if (id) {
                await API.put(endpoint, page);
            } else {
                await API.post(endpoint, page);
            }
            this.resetForm();
            this.fetch();
            Utils.showSuccess('Page saved!');
        } catch (err) {
            Utils.showError('Error: ' + err.message);
        }
    },

    // Edit page
    async edit(id) {
        try {
            const pages = await API.get('/admin/static-pages');
            const page = pages.find(x => x._id === id);

            if (page) {
                Utils.$('page-id').value = page._id;
                Utils.$('page-title-input').value = page.title;
                Utils.$('page-slug').value = page.slug;
                if (this.editor) this.editor.commands.setContent(page.content || '');
                Utils.$('page-published').checked = page.isPublished;
                Utils.$('cancel-page-edit').classList.remove('hidden');
                window.scrollTo(0, 0);
            }
        } catch (err) {
            Utils.showError('Error loading page');
        }
    },

    // Delete page
    async delete(id) {
        if (typeof showConfirmDialog === 'function') {
            showConfirmDialog({
                title: 'Delete Page?',
                message: 'This page will be permanently deleted and cannot be undone.',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                onConfirm: async () => {
                    await API.delete(`/admin/static-pages/${id}`);
                    this.fetch();
                    Utils.showSuccess('Page deleted!');
                }
            });
        } else if (confirm('Delete this page?')) {
            try {
                await API.delete(`/admin/static-pages/${id}`);
                this.fetch();
                Utils.showSuccess('Page deleted!');
            } catch (err) {
                Utils.showError('Error deleting page');
            }
        }
    },

    // Reset form
    resetForm() {
        const form = Utils.$('page-form');
        if (form) form.reset();

        Utils.$('page-id').value = '';
        if (this.editor) this.editor.commands.setContent('');
        Utils.$('cancel-page-edit').classList.add('hidden');
    }
};

// Expose to window
window.Pages = Pages;
window.generateSlug = () => Pages.generateSlug();
