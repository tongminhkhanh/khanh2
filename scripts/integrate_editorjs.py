import re

# Read the file
with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace TinyMCE CDN with Editor.js CDN
old_tinymce = '<script src="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js" defer></script>'
new_editorjs = '''<!-- Editor.js Core and Plugins -->
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/header@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/list@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/image@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/embed@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/quote@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/code@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/table@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/delimiter@latest"></script>'''

content = content.replace(old_tinymce, new_editorjs)

# 2. Replace TinyMCE styles with Editor.js styles
old_style = '''<style>
        body {
            font-family: 'Lexend', sans-serif;
        }

        .tox-tinymce {
            border-radius: 0.375rem;
        }
    </style>'''

new_style = '''<style>
        body { font-family: 'Lexend', sans-serif; }
        #editorjs {
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            min-height: 300px;
            background: white;
        }
        .ce-block__content, .ce-toolbar__content { max-width: 100%; }
        .codex-editor__redactor { padding-bottom: 100px !important; }
    </style>'''

content = content.replace(old_style, new_style)

# 3. Replace content textarea with editorjs div
old_textarea = '''<div>
                                <label class="block text-sm font-medium text-gray-700">Noi dung</label>
                                <textarea id="content" rows="10"
                                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                            </div>'''

new_editorjs_div = '''<div>
                                <label class="block text-sm font-medium text-gray-700">Noi dung</label>
                                <div id="editorjs" class="mt-1"></div>
                            </div>'''

content = content.replace(old_textarea, new_editorjs_div)

# 4. Add editor variable after API_URL declaration
old_vars = "const API_URL = '/api';"
new_vars = """const API_URL = '/api';
        let editor = null;"""

content = content.replace(old_vars, new_vars)

# 5. Replace TinyMCE init with Editor.js init
old_tinymce_init = '''// TinyMCE Init
        document.addEventListener('DOMContentLoaded', function () {
            if (typeof tinymce !== 'undefined') {
                tinymce.init({
                    selector: '#content, #page-content-editor',
                    height: 400,
                    menubar: false,
                    plugins: 'lists link image code',
                    toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | code',
                    file_picker_callback: function (cb) { openMediaSelector(null, cb); }
                });
            }
        });'''

new_editorjs_init = '''// Editor.js Init
        document.addEventListener('DOMContentLoaded', function () {
            initEditor();
        });

        function initEditor(data = null) {
            if (editor) {
                editor.destroy();
                editor = null;
            }
            editor = new EditorJS({
                holder: 'editorjs',
                placeholder: 'Nhap noi dung bai viet...',
                data: data,
                tools: {
                    header: { class: Header, config: { levels: [2, 3, 4], defaultLevel: 2 } },
                    list: { class: List, inlineToolbar: true },
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                uploadByFile(file) {
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    return fetch(API_URL + '/upload', {
                                        method: 'POST',
                                        headers: { 'Authorization': 'Bearer ' + token },
                                        body: formData
                                    }).then(res => res.json()).then(data => ({
                                        success: 1,
                                        file: { url: data.url }
                                    }));
                                }
                            }
                        }
                    },
                    embed: Embed,
                    quote: Quote,
                    code: CodeTool,
                    table: Table,
                    delimiter: Delimiter
                }
            });
        }

        function convertEditorJsToHtml(data) {
            let html = '';
            if (!data || !data.blocks) return html;
            data.blocks.forEach(block => {
                switch (block.type) {
                    case 'header':
                        html += '<h' + block.data.level + '>' + block.data.text + '</h' + block.data.level + '>';
                        break;
                    case 'paragraph':
                        html += '<p>' + block.data.text + '</p>';
                        break;
                    case 'list':
                        const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
                        html += '<' + tag + '>' + block.data.items.map(i => '<li>' + i + '</li>').join('') + '</' + tag + '>';
                        break;
                    case 'image':
                        html += '<img src="' + block.data.file.url + '" alt="' + (block.data.caption || '') + '">';
                        break;
                    case 'quote':
                        html += '<blockquote>' + block.data.text + '</blockquote>';
                        break;
                    case 'code':
                        html += '<pre><code>' + block.data.code + '</code></pre>';
                        break;
                    case 'delimiter':
                        html += '<hr>';
                        break;
                }
            });
            return html;
        }

        function htmlToEditorBlocks(html) {
            if (!html) return { blocks: [] };
            // Simple conversion - treat as paragraph
            const text = html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim();
            if (!text) return { blocks: [] };
            return {
                blocks: [{ type: 'paragraph', data: { text: text } }]
            };
        }'''

content = content.replace(old_tinymce_init, new_editorjs_init)

# 6. Update article form submit handler
old_submit = '''const contentEditor = tinymce.get('content');
            const article = {
                title: document.getElementById('title').value,
                content: contentEditor ? contentEditor.getContent() : document.getElementById('content').value,'''

new_submit = '''const savedData = await editor.save();
            const htmlContent = convertEditorJsToHtml(savedData);
            const article = {
                title: document.getElementById('title').value,
                content: htmlContent,'''

content = content.replace(old_submit, new_submit)

# 7. Update editArticle function
old_edit = '''const contentEditor = tinymce.get('content');
                if (contentEditor) contentEditor.setContent(a.content || '');
                else document.getElementById('content').value = a.content || '';'''

new_edit = '''initEditor(htmlToEditorBlocks(a.content || ''));'''

content = content.replace(old_edit, new_edit)

# 8. Update resetArticleForm
old_reset = '''const contentEditor = tinymce.get('content');
            if (contentEditor) contentEditor.setContent('');'''

new_reset = '''initEditor();'''

content = content.replace(old_reset, new_reset)

# Write the modified content back
with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done! Editor.js has been integrated into admin.html")
