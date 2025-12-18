import re

# ==========================================
# 1. Revert server.js
# ==========================================
print("Migrating server.js...")
with open('server.js', 'r', encoding='utf-8') as f:
    server_content = f.read()

# Revert the admin route to simple sendFile
old_admin_route = r"app\.get\('/admin', \(req, res\) => \{[\s\S]*?res\.send\(html\);\s*\n\}\);"
new_admin_route = "app.get('/admin', (req, res) => {\n    res.sendFile(path.join(__dirname, 'admin.html'));\n});"

# Use regex to find and replace because the content might vary slightly
server_content = re.sub(old_admin_route, new_admin_route, server_content)

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(server_content)
print("server.js updated.")

# ==========================================
# 2. Update admin.html
# ==========================================
print("Migrating admin.html...")
with open('admin.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# A. Remove TinyMCE CDN and Add Tiptap Styles
old_head_script = '<script src="https://cdn.tiny.cloud/1/TINYMCE_API_KEY/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>'
# Fallback if previous revert didn't work perfectly
old_head_script_fallback = '<script src="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js" defer></script>'

tiptap_styles = """<style>
        body { font-family: 'Lexend', sans-serif; }
        
        /* Tiptap Editor Styles */
        .tiptap {
            min-height: 300px;
            border: 1px solid #d1d5db;
            border-radius: 0 0 0.375rem 0.375rem;
            padding: 1rem;
            outline: none;
            background: white;
        }
        .tiptap:focus {
            border-color: #2563eb;
            ring: 2px solid #bfdbfe;
        }
        .tiptap p { margin-bottom: 0.5rem; }
        .tiptap h1 { font-size: 1.5rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
        .tiptap h2 { font-size: 1.25rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
        .tiptap h3 { font-size: 1.125rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
        .tiptap ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.5rem; }
        .tiptap ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.5rem; }
        .tiptap blockquote { border-left: 3px solid #d1d5db; padding-left: 1rem; color: #4b5563; font-style: italic; }
        .tiptap img { max-width: 100%; height: auto; border-radius: 0.375rem; }
        .tiptap hr { margin: 1rem 0; border-top: 1px solid #e5e7eb; }
        
        /* Toolbar Styles */
        .editor-toolbar {
            border: 1px solid #d1d5db;
            border-bottom: none;
            border-radius: 0.375rem 0.375rem 0 0;
            background: #f9fafb;
            padding: 0.5rem;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        .editor-btn {
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            color: #374151;
            background: white;
            border: 1px solid #d1d5db;
            cursor: pointer;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 2rem;
        }
        .editor-btn:hover { background: #f3f4f6; }
        .editor-btn.is-active { background: #e5e7eb; color: #000; font-weight: bold; }
    </style>"""

if old_head_script in html_content:
    html_content = html_content.replace(old_head_script, "")
elif old_head_script_fallback in html_content:
    html_content = html_content.replace(old_head_script_fallback, "")

# Replace styles (removing old TinyMCE styles)
old_style_block = r"<style>[\s\S]*?</style>"
html_content = re.sub(old_style_block, tiptap_styles, html_content)


# B. Replace Textarea with Tiptap Container
# We need to replace both #content and #page-content-editor textareas
# 1. Article Content
old_article_textarea = r'<textarea id="content" rows="10"\s*class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>'
new_article_editor = """<div class="editor-container">
                                    <div id="toolbar-content" class="editor-toolbar"></div>
                                    <div id="editor-content" class="tiptap"></div>
                                </div>"""
html_content = re.sub(old_article_textarea, new_article_editor, html_content)

# 2. Page Content
old_page_textarea = r'<textarea id="page-content-editor" rows="10"\s*class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>'
new_page_editor = """<div class="editor-container">
                                    <div id="toolbar-page" class="editor-toolbar"></div>
                                    <div id="editor-page" class="tiptap"></div>
                                </div>"""
html_content = re.sub(old_page_textarea, new_page_editor, html_content)


# C. Add Tiptap Logic (ESM)
# We need to remove the old TinyMCE init and add new Tiptap logic
old_tinymce_init = r"// TinyMCE Init[\s\S]*?\}\);"
new_tiptap_logic = """
        // Tiptap Imports
        import { Editor } from 'https://esm.sh/@tiptap/core';
        import StarterKit from 'https://esm.sh/@tiptap/starter-kit';
        import Image from 'https://esm.sh/@tiptap/extension-image';
        import Link from 'https://esm.sh/@tiptap/extension-link';
        import Placeholder from 'https://esm.sh/@tiptap/extension-placeholder';

        let articleEditor = null;
        let pageEditor = null;

        // Initialize Editors
        function initEditors() {
            // Article Editor
            if (!articleEditor) {
                articleEditor = new Editor({
                    element: document.querySelector('#editor-content'),
                    extensions: [
                        StarterKit,
                        Image,
                        Link.configure({ openOnClick: false }),
                        Placeholder.configure({ placeholder: 'Nhap noi dung bai viet...' })
                    ],
                    content: '',
                    onUpdate: ({ editor }) => {
                        updateToolbar('toolbar-content', editor);
                    },
                    onSelectionUpdate: ({ editor }) => {
                        updateToolbar('toolbar-content', editor);
                    }
                });
                createToolbar('toolbar-content', articleEditor);
            }

            // Page Editor
            if (!pageEditor) {
                pageEditor = new Editor({
                    element: document.querySelector('#editor-page'),
                    extensions: [
                        StarterKit,
                        Image,
                        Link.configure({ openOnClick: false }),
                        Placeholder.configure({ placeholder: 'Nhap noi dung trang...' })
                    ],
                    content: '',
                    onUpdate: ({ editor }) => {
                        updateToolbar('toolbar-page', editor);
                    },
                    onSelectionUpdate: ({ editor }) => {
                        updateToolbar('toolbar-page', editor);
                    }
                });
                createToolbar('toolbar-page', pageEditor);
            }
        }

        // Create Toolbar UI
        function createToolbar(toolbarId, editor) {
            const toolbar = document.getElementById(toolbarId);
            if (!toolbar) return;
            
            const buttons = [
                { label: 'B', action: () => editor.chain().focus().toggleBold().run(), isActive: () => editor.isActive('bold') },
                { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), isActive: () => editor.isActive('italic') },
                { label: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.isActive('heading', { level: 1 }) },
                { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.isActive('heading', { level: 2 }) },
                { label: 'List', action: () => editor.chain().focus().toggleBulletList().run(), isActive: () => editor.isActive('bulletList') },
                { label: 'Num', action: () => editor.chain().focus().toggleOrderedList().run(), isActive: () => editor.isActive('orderedList') },
                { label: 'Quote', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => editor.isActive('blockquote') },
                { label: 'Img', action: () => openMediaSelectorForEditor(editor), isActive: () => false },
                { label: 'Undo', action: () => editor.chain().focus().undo().run(), isActive: () => false },
                { label: 'Redo', action: () => editor.chain().focus().redo().run(), isActive: () => false },
            ];

            toolbar.innerHTML = '';
            buttons.forEach(btn => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'editor-btn';
                button.innerText = btn.label;
                button.onclick = btn.action;
                button.dataset.label = btn.label;
                toolbar.appendChild(button);
            });
        }

        function updateToolbar(toolbarId, editor) {
            const toolbar = document.getElementById(toolbarId);
            if (!toolbar) return;
            
            Array.from(toolbar.children).forEach(btn => {
                const label = btn.dataset.label;
                // Simple check based on label text matching our config
                // In a real app, we'd map this better
                if (label === 'B' && editor.isActive('bold')) btn.classList.add('is-active');
                else if (label === 'I' && editor.isActive('italic')) btn.classList.add('is-active');
                else if (label === 'H1' && editor.isActive('heading', { level: 1 })) btn.classList.add('is-active');
                else if (label === 'H2' && editor.isActive('heading', { level: 2 })) btn.classList.add('is-active');
                else if (label === 'List' && editor.isActive('bulletList')) btn.classList.add('is-active');
                else if (label === 'Num' && editor.isActive('orderedList')) btn.classList.add('is-active');
                else if (label === 'Quote' && editor.isActive('blockquote')) btn.classList.add('is-active');
                else btn.classList.remove('is-active');
            });
        }

        // Media Selector for Editor
        window.openMediaSelectorForEditor = function(editor) {
             // Reuse existing media selector but with a custom callback
             openMediaSelector(null, (url) => {
                 if (url) {
                     editor.chain().focus().setImage({ src: url }).run();
                 }
             });
        }

        // Expose editors to window for legacy functions
        window.getArticleContent = () => articleEditor ? articleEditor.getHTML() : '';
        window.setArticleContent = (html) => articleEditor && articleEditor.commands.setContent(html);
        window.getPageContent = () => pageEditor ? pageEditor.getHTML() : '';
        window.setPageContent = (html) => pageEditor && pageEditor.commands.setContent(html);
        
        // Init on load
        initEditors();
"""

# Replace TinyMCE Init with Tiptap Logic
html_content = re.sub(old_tinymce_init, new_tiptap_logic, html_content)

# Update Script Tag to be Module
html_content = html_content.replace('<script>', '<script type="module">')


# D. Update Form Submission Logic
# 1. Article Form
old_article_submit = r"const contentEditor = tinymce\.get\('content'\);\s*const article = \{\s*title: document\.getElementById\('title'\)\.value,\s*content: contentEditor \? contentEditor\.getContent\(\) : document\.getElementById\('content'\)\.value,"
new_article_submit = """const article = {
                title: document.getElementById('title').value,
                content: window.getArticleContent(),"""
html_content = re.sub(old_article_submit, new_article_submit, html_content)

# 2. Article Edit
old_article_edit = r"const contentEditor = tinymce\.get\('content'\);\s*if \(contentEditor\) contentEditor\.setContent\(a\.content \|\| ''\);\s*else document\.getElementById\('content'\)\.value = a\.content \|\| '';"
new_article_edit = "window.setArticleContent(a.content || '');"
html_content = re.sub(old_article_edit, new_article_edit, html_content)

# 3. Article Reset
old_article_reset = r"const contentEditor = tinymce\.get\('content'\);\s*if \(contentEditor\) contentEditor\.setContent\(''\);"
new_article_reset = "window.setArticleContent('');"
html_content = re.sub(old_article_reset, new_article_reset, html_content)


with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(html_content)
print("admin.html updated.")
