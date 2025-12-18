import re

# Read the file
with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Don't init on DOMContentLoaded when dashboard is hidden
old_init = '''// Editor.js Init
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
        }'''

new_init = '''// Editor.js Init - Only init when dashboard is visible
        let editorReady = false;

        function initEditor(data = null) {
            const holder = document.getElementById('editorjs');
            if (!holder) {
                console.log('Editor holder not found');
                return;
            }
            
            // Clear the holder first
            holder.innerHTML = '';
            
            if (editor) {
                try {
                    editor.destroy();
                } catch(e) {
                    console.log('Editor destroy error:', e);
                }
                editor = null;
            }
            
            editorReady = false;
            
            editor = new EditorJS({
                holder: 'editorjs',
                placeholder: 'Nhap noi dung bai viet...',
                data: data || { blocks: [] },
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
                },
                onReady: () => {
                    editorReady = true;
                    console.log('Editor.js is ready');
                }
            });
        }'''

content = content.replace(old_init, new_init)

# Fix 2: Update showDashboard to init editor after dashboard is visible
old_dashboard = '''function showDashboard() {
            document.getElementById('auth-modal').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            if (currentUser) {
                document.getElementById('user-name').innerText = currentUser.username;
                document.getElementById('user-role').innerText = currentUser.role ? currentUser.role.toUpperCase() : 'USER';
                document.getElementById('user-avatar').innerText = currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'A';
            }
            fetchArticles();
        }'''

new_dashboard = '''function showDashboard() {
            document.getElementById('auth-modal').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            if (currentUser) {
                document.getElementById('user-name').innerText = currentUser.username;
                document.getElementById('user-role').innerText = currentUser.role ? currentUser.role.toUpperCase() : 'USER';
                document.getElementById('user-avatar').innerText = currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'A';
            }
            // Init Editor.js after dashboard is visible
            setTimeout(() => {
                initEditor();
            }, 100);
            fetchArticles();
        }'''

content = content.replace(old_dashboard, new_dashboard)

# Fix 3: Improve htmlToEditorBlocks to handle HTML better
old_html_convert = '''function htmlToEditorBlocks(html) {
            if (!html) return { blocks: [] };
            // Simple conversion - treat as paragraph
            const text = html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim();
            if (!text) return { blocks: [] };
            return {
                blocks: [{ type: 'paragraph', data: { text: text } }]
            };
        }'''

new_html_convert = '''function htmlToEditorBlocks(html) {
            if (!html) return { blocks: [] };
            
            const blocks = [];
            
            // Create a temporary div to parse HTML
            const div = document.createElement('div');
            div.innerHTML = html;
            
            // Get all paragraphs, headings, etc.
            div.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent.trim();
                    if (text) {
                        blocks.push({ type: 'paragraph', data: { text: text } });
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const tagName = node.tagName.toLowerCase();
                    const textContent = node.innerHTML || node.textContent;
                    
                    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
                        blocks.push({
                            type: 'header',
                            data: { text: textContent, level: parseInt(tagName[1]) }
                        });
                    } else if (tagName === 'ul' || tagName === 'ol') {
                        const items = Array.from(node.querySelectorAll('li')).map(li => li.textContent);
                        blocks.push({
                            type: 'list',
                            data: { style: tagName === 'ol' ? 'ordered' : 'unordered', items: items }
                        });
                    } else if (tagName === 'img') {
                        blocks.push({
                            type: 'image',
                            data: { file: { url: node.src }, caption: node.alt || '' }
                        });
                    } else if (tagName === 'blockquote') {
                        blocks.push({
                            type: 'quote',
                            data: { text: textContent, caption: '' }
                        });
                    } else if (tagName === 'pre') {
                        blocks.push({
                            type: 'code',
                            data: { code: node.textContent }
                        });
                    } else if (tagName === 'hr') {
                        blocks.push({ type: 'delimiter', data: {} });
                    } else if (textContent.trim()) {
                        // Default to paragraph for other elements
                        blocks.push({ type: 'paragraph', data: { text: textContent } });
                    }
                }
            });
            
            // If no blocks were created, add the raw HTML as paragraph
            if (blocks.length === 0 && html.trim()) {
                blocks.push({ type: 'paragraph', data: { text: html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim() } });
            }
            
            return { blocks: blocks };
        }'''

content = content.replace(old_html_convert, new_html_convert)

# Write the modified content back
with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done! Editor.js initialization issues have been fixed.")
