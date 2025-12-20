const Articles = {
    editor: null,

    // Initialize
    init() {
        this.setupForm();
        this.setupEditor();
    },

    // Setup form listeners
    setupForm() {
        const form = Utils.$('article-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.save('published');
            });
        }

        const saveDraftBtn = Utils.$('save-draft-btn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.save('draft'));
        }

        const scheduleBtn = Utils.$('schedule-btn');
        if (scheduleBtn) {
            scheduleBtn.addEventListener('click', () => this.save('pending'));
        }

        const cancelBtn = Utils.$('cancel-edit');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.resetForm();
                Navigation.switchTab('articles');
            });
        }

        // Image preview
        const imageInput = Utils.$('image');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                const url = e.target.value;
                const preview = Utils.$('image-preview');
                if (preview) {
                    preview.innerHTML = url
                        ? `<img src="${url}" class="w-full h-full object-cover">`
                        : '<span class="text-gray-400 text-sm">No image</span>';
                }
            });
        }
    },

    // Setup Tiptap editor
    setupEditor() {
        const editorElement = Utils.$('article-editor');
        if (!editorElement || typeof Tiptap === 'undefined') return;

        this.editor = new Tiptap.Editor({
            element: editorElement,
            extensions: [
                Tiptap.StarterKit,
                Tiptap.TextAlign.configure({
                    types: ['heading', 'paragraph'],
                    alignments: ['left', 'center', 'right'],
                }),
                Tiptap.Link.configure({ openOnClick: false }),
                Tiptap.Image.configure({ inline: true, allowBase64: true }),
                Tiptap.Highlight.configure({ multicolor: true }),
                Tiptap.Underline,
                Tiptap.TextStyle,
                Tiptap.Color,
            ],
            content: '',
            onUpdate: () => this.updateToolbarState(),
        });

        window.articleEditor = this.editor;
        this.setupToolbar();
    },

    // Setup toolbar listeners
    setupToolbar() {
        if (!this.editor) return;

        const toolbarButtons = {
            'bold': () => this.editor.chain().focus().toggleBold().run(),
            'italic': () => this.editor.chain().focus().toggleItalic().run(),
            'underline': () => this.editor.chain().focus().toggleUnderline().run(),
            'strike': () => this.editor.chain().focus().toggleStrike().run(),
            'bullet': () => this.editor.chain().focus().toggleBulletList().run(),
            'ordered': () => this.editor.chain().focus().toggleOrderedList().run(),
            'quote': () => this.editor.chain().focus().toggleBlockquote().run(),
            'code': () => this.editor.chain().focus().toggleCode().run(),
            'codeBlock': () => this.editor.chain().focus().toggleCodeBlock().run(),
            'highlight': () => this.editor.chain().focus().toggleHighlight().run(),
            'clear': () => this.editor.chain().focus().unsetAllMarks().clearNodes().run(),
            'undo': () => this.editor.chain().focus().undo().run(),
            'redo': () => this.editor.chain().focus().redo().run(),
            'alignLeft': () => this.editor.chain().focus().setTextAlign('left').run(),
            'alignCenter': () => this.editor.chain().focus().setTextAlign('center').run(),
            'alignRight': () => this.editor.chain().focus().setTextAlign('right').run(),
        };

        Object.keys(toolbarButtons).forEach(id => {
            const btn = Utils.$(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    toolbarButtons[id]();
                });
            }
        });

        // Heading select
        const headingSelect = Utils.$('heading');
        if (headingSelect) {
            headingSelect.addEventListener('change', (e) => {
                const value = e.target.value;
                if (value === 'paragraph') {
                    this.editor.chain().focus().setParagraph().run();
                } else {
                    this.editor.chain().focus().toggleHeading({ level: parseInt(value) }).run();
                }
            });
        }

        // Text color
        const textColorInput = Utils.$('textColor');
        if (textColorInput) {
            textColorInput.addEventListener('input', (e) => {
                this.editor.chain().focus().setColor(e.target.value).run();
            });
        }

        // Link button
        const linkBtn = Utils.$('link');
        if (linkBtn) {
            linkBtn.addEventListener('click', () => {
                const url = prompt('Enter URL:');
                if (url) {
                    this.editor.chain().focus().setLink({ href: url }).run();
                }
            });
        }

        // Image button
        const imageBtn = Utils.$('insertImage');
        if (imageBtn) {
            imageBtn.addEventListener('click', () => {
                if (typeof window.openMediaSelector === 'function') {
                    window.openMediaSelector(null, (url) => {
                        this.editor.chain().focus().setImage({ src: url }).run();
                    });
                }
            });
        }
    },

    // Update toolbar state
    updateToolbarState() {
        if (!this.editor) return;

        const states = {
            'bold': this.editor.isActive('bold'),
            'italic': this.editor.isActive('italic'),
            'underline': this.editor.isActive('underline'),
            'strike': this.editor.isActive('strike'),
            'bullet': this.editor.isActive('bulletList'),
            'ordered': this.editor.isActive('orderedList'),
            'quote': this.editor.isActive('blockquote'),
            'code': this.editor.isActive('code'),
        };

        Object.keys(states).forEach(id => {
            const btn = Utils.$(id);
            if (btn) {
                btn.classList.toggle('active', states[id]);
            }
        });
    },

    // Fetch articles list
    async fetch() {
        const tbody = Utils.$('articles-list');
        if (!tbody) return;

        tbody.innerHTML = Array(5).fill(0).map(() => `
            <tr class="skeleton-row">
                <td class="px-6 py-4"><div class="skeleton h-10 w-10 rounded"></div></td>
                <td class="px-6 py-4"><div class="skeleton h-4 w-3/4 rounded"></div></td>
                <td class="px-6 py-4"><div class="skeleton h-4 w-1/2 rounded"></div></td>
                <td class="px-6 py-4"><div class="skeleton h-4 w-1/4 rounded"></div></td>
                <td class="px-6 py-4 text-right"><div class="skeleton h-8 w-16 rounded ml-auto"></div></td>
            </tr>
        `).join('');

        try {
            const articles = await API.get('/articles');

            if (!articles || articles.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-12 text-center text-gray-500">No articles found</td></tr>`;
                return;
            }

            tbody.innerHTML = articles.map(a => `
                <tr>
                    <td class="px-6 py-4">${a.image ? `<img src="${a.image}" class="h-10 w-10 rounded object-cover">` : '<div class="h-10 w-10 rounded bg-gray-200"></div>'}</td>
                    <td class="px-6 py-4 font-medium">${Utils.escapeHtml(a.title)}</td>
                    <td class="px-6 py-4 text-gray-500">${a.category}</td>
                    <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-full ${a.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">${a.status}</span></td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="Articles.edit('${a._id}')" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                        <button onclick="Articles.delete('${a._id}')" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            Utils.error(err);
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error loading data</td></tr>`;
        }
    },

    // Save article
    async save(statusOverride) {
        const id = Utils.$('article-id')?.value;
        const content = this.editor ? this.editor.getHTML() : '';

        const article = {
            title: Utils.$('title')?.value,
            content: content,
            category: Utils.$('category')?.value,
            image: Utils.$('image')?.value,
            status: statusOverride || Utils.$('status')?.value,
            tags: (Utils.$('tags')?.value || '').split(',').map(t => t.trim()).filter(t => t),
            metaDescription: Utils.$('meta-desc')?.value
        };

        const method = id ? 'PUT' : 'POST';
        const endpoint = id ? `/articles/${id}` : '/articles';

        try {
            if (method === 'PUT') {
                await API.put(endpoint, article);
            } else {
                await API.post(endpoint, article);
            }
            this.resetForm();
            Navigation.switchTab('articles');
            Utils.showSuccess('Article saved!');
        } catch (err) {
            Utils.showError('Error: ' + err.message);
        }
    },

    // Edit article
    async edit(id) {
        try {
            const article = await API.get(`/articles/${id}`);
            if (article) {
                Navigation.switchTab('add-article');

                Utils.$('article-id').value = article._id;
                Utils.$('title').value = article.title;
                if (this.editor) this.editor.commands.setContent(article.content || '');
                Utils.$('category').value = article.category;
                Utils.$('image').value = article.image || '';
                Utils.$('status').value = article.status;
                Utils.$('tags').value = (article.tags || []).join(', ');
                Utils.$('meta-desc').value = article.metaDescription || '';

                const preview = Utils.$('image-preview');
                if (preview) {
                    preview.innerHTML = article.image
                        ? `<img src="${article.image}" class="w-full h-full object-cover">`
                        : '<span class="text-gray-400 text-sm">No image</span>';
                }

                Utils.$('page-title').textContent = 'Edit Article';
            }
        } catch (err) {
            Utils.showError('Error loading article');
        }
    },

    // Delete article
    async delete(id) {
        if (confirm('Delete this article?')) {
            try {
                await API.delete(`/articles/${id}`);
                this.fetch();
                Utils.showSuccess('Article deleted!');
            } catch (err) {
                Utils.showError('Error deleting article');
            }
        }
    },

    // Reset form
    resetForm() {
        const form = Utils.$('article-form');
        if (form) form.reset();

        Utils.$('article-id').value = '';
        if (this.editor) this.editor.commands.setContent('');

        const preview = Utils.$('image-preview');
        if (preview) {
            preview.innerHTML = '<span class="text-gray-400 text-sm">No image</span>';
        }

        Utils.$('page-title').textContent = 'Add New Article';
    }
};

// Expose to window for onclick handlers
window.Articles = Articles;
