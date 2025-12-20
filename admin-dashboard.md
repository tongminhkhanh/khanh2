<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Quản Lý Nội Dung</title>
    
    <!-- Tiptap CDN -->
    <script src="https://cdn.jsdelivr.net/npm/@tiptap/core@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tiptap/starter-kit@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tiptap/extension-text-align@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tiptap/extension-link@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tiptap/extension-image@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tiptap/extension-highlight@latest"></script>
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #f5f7fa;
            color: #333;
        }

        .dashboard {
            display: flex;
            min-height: 100vh;
        }

        /* Sidebar */
        .sidebar {
            width: 280px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            overflow-y: auto;
            position: fixed;
            height: 100vh;
            left: 0;
            z-index: 1000;
        }

        .logo {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 30px;
            padding: 10px;
            text-align: center;
        }

        .sidebar-menu {
            list-style: none;
        }

        .sidebar-menu li {
            margin-bottom: 12px;
        }

        .sidebar-menu a {
            display: block;
            padding: 12px 15px;
            color: rgba(255, 255, 255, 0.9);
            text-decoration: none;
            border-radius: 6px;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .sidebar-menu a:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .sidebar-menu a.active {
            background: rgba(255, 255, 255, 0.3);
            color: white;
            font-weight: 600;
        }

        /* Main Content */
        .main-content {
            margin-left: 280px;
            flex: 1;
            padding: 30px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 32px;
            color: #333;
        }

        .user-menu {
            display: flex;
            gap: 15px;
            align-items: center;
        }

        .user-menu button {
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }

        /* Tabs */
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 2px solid #ddd;
        }

        .tabs button {
            padding: 12px 20px;
            border: none;
            background: transparent;
            color: #666;
            font-weight: 600;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            margin-bottom: -2px;
            transition: all 0.2s ease;
        }

        .tabs button.active {
            color: #667eea;
            border-bottom-color: #667eea;
        }

        .tabs button:hover {
            color: #667eea;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        /* Form Container */
        .form-container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .form-section {
            margin-bottom: 30px;
        }

        .form-section h2 {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
            font-size: 14px;
        }

        .form-group input[type="text"],
        .form-group input[type="file"],
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            font-family: inherit;
            transition: all 0.2s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .form-row .form-group {
            margin-bottom: 0;
        }

        /* Editor Toolbar */
        .editor-toolbar {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            padding: 10px;
            background: #f8f9fa;
            border: 1px solid #ddd;
            border-bottom: none;
            border-radius: 6px 6px 0 0;
        }

        .toolbar-group {
            display: flex;
            gap: 4px;
            padding-right: 6px;
            border-right: 1px solid #ddd;
        }

        .toolbar-group:last-child {
            border-right: none;
        }

        .editor-toolbar button,
        .editor-toolbar select {
            padding: 6px 10px;
            border: 1px solid #ddd;
            background: white;
            color: #333;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .editor-toolbar button:hover {
            background: #e9ecef;
            border-color: #667eea;
            color: #667eea;
        }

        .editor-toolbar button.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }

        .editor-toolbar select {
            cursor: pointer;
        }

        /* Editor Container */
        .editor-container {
            border: 1px solid #ddd;
            border-radius: 0 0 6px 6px;
            background: white;
            min-height: 350px;
            padding: 15px;
            overflow-y: auto;
        }

        .editor-container:focus-within {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .ProseMirror {
            outline: none;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
        }

        .ProseMirror h1 { font-size: 28px; font-weight: 700; margin: 15px 0 10px 0; }
        .ProseMirror h2 { font-size: 22px; font-weight: 700; margin: 12px 0 8px 0; }
        .ProseMirror h3 { font-size: 18px; font-weight: 700; margin: 10px 0 6px 0; }
        .ProseMirror p { margin-bottom: 10px; }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror code { background: #f1f3f5; padding: 2px 6px; border-radius: 3px; color: #e83e8c; }
        .ProseMirror pre { background: #2d2d2d; color: #f8f8f2; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .ProseMirror ul, .ProseMirror ol { margin-left: 20px; margin-bottom: 10px; }
        .ProseMirror blockquote { border-left: 4px solid #667eea; padding-left: 10px; margin: 10px 0; color: #666; }
        .ProseMirror a { color: #0066cc; text-decoration: underline; }

        /* Buttons */
        .form-actions {
            display: flex;
            gap: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #f0f0f0;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-primary {
            background: #667eea;
            color: white;
        }

        .btn-primary:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btn-secondary {
            background: #e9ecef;
            color: #333;
            border: 1px solid #ddd;
        }

        .btn-danger {
            background: #dc3545;
            color: white;
        }

        /* Table */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        table th {
            background: #f8f9fa;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #ddd;
        }

        table td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
        }

        table tr:hover {
            background: #f8f9fa;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }

        .status-draft { background: #ffc107; color: #333; }
        .status-published { background: #28a745; color: white; }
        .status-scheduled { background: #17a2b8; color: white; }

        /* Toast */
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: #28a745;
            color: white;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease;
            z-index: 2000;
        }

        .toast.error {
            background: #dc3545;
        }

        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .sidebar {
                width: 100%;
                height: auto;
                position: relative;
            }

            .main-content {
                margin-left: 0;
            }

            .form-row {
                grid-template-columns: 1fr;
            }

            .tabs {
                flex-wrap: wrap;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="logo">📊 Admin</div>
            <ul class="sidebar-menu">
                <li><a href="javascript:switchTab('articles')" class="active">📝 Bài Viết</a></li>
                <li><a href="javascript:switchTab('events')">🎯 Sự Kiện</a></li>
                <li><a href="javascript:switchTab('media')">🖼️ Thư Viện</a></li>
                <li><a href="javascript:switchTab('pages')">📄 Trang Tĩnh</a></li>
                <li><a href="javascript:switchTab('settings')" style="margin-top: 20px;">⚙️ Cài Đặt</a></li>
            </ul>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <div class="header">
                <h1>Quản Lý Nội Dung</h1>
                <div class="user-menu">
                    <span>👤 Admin User</span>
                    <button onclick="logout()">Đăng Xuất</button>
                </div>
            </div>

            <!-- Tabs -->
            <div class="tabs">
                <button class="active" onclick="switchTab('articles')">📝 Bài Viết</button>
                <button onclick="switchTab('add-article')">➕ Thêm Bài Viết</button>
                <button onclick="switchTab('events')">🎯 Sự Kiện</button>
                <button onclick="switchTab('media')">🖼️ Thư Viện</button>
                <button onclick="switchTab('pages')">📄 Trang Tĩnh</button>
            </div>

            <!-- Tab: Articles List -->
            <div id="articles" class="tab-content active">
                <div class="form-container">
                    <h2>Danh Sách Bài Viết</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Hình</th>
                                <th>Tiêu Đề</th>
                                <th>Danh Mục</th>
                                <th>Trạng Thái</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody id="articles-tbody">
                            <tr>
                                <td>-</td>
                                <td>Không có bài viết</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Tab: Add Article -->
            <div id="add-article" class="tab-content">
                <div class="form-container">
                    <h2>Thêm Bài Viết Mới</h2>

                    <!-- Basic Info Section -->
                    <div class="form-section">
                        <h2>📋 Thông Tin Cơ Bản</h2>
                        
                        <div class="form-group">
                            <label>Tiêu Đề *</label>
                            <input type="text" id="title" placeholder="Nhập tiêu đề bài viết..." required>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Danh Mục *</label>
                                <select id="category" required>
                                    <option value="">-- Chọn danh mục --</option>
                                    <option value="tech">Công Nghệ</option>
                                    <option value="business">Kinh Doanh</option>
                                    <option value="lifestyle">Lối Sống</option>
                                    <option value="health">Sức Khỏe</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Trạng Thái *</label>
                                <select id="status" required>
                                    <option value="draft">Nháp</option>
                                    <option value="published">Đã Xuất Bản</option>
                                    <option value="scheduled">Lên Lịch</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Featured Image Section -->
                    <div class="form-section">
                        <h2>🖼️ Hình Đại Diện</h2>
                        <div class="form-group">
                            <label>Tải Lên Hình Ảnh</label>
                            <input type="file" id="featured-image" accept="image/*">
                        </div>
                    </div>

                    <!-- Content Section -->
                    <div class="form-section">
                        <h2>✍️ Nội Dung Bài Viết</h2>
                        
                        <!-- Editor Toolbar -->
                        <div class="editor-toolbar">
                            <div class="toolbar-group">
                                <button id="bold" title="Bold (Ctrl+B)"><strong>B</strong></button>
                                <button id="italic" title="Italic (Ctrl+I)"><em>I</em></button>
                                <button id="underline" title="Underline">U</button>
                                <button id="strike" title="Strikethrough">S</button>
                            </div>

                            <div class="toolbar-group">
                                <select id="heading" title="Heading Level">
                                    <option value="paragraph">Bình Thường</option>
                                    <option value="1">Heading 1</option>
                                    <option value="2">Heading 2</option>
                                    <option value="3">Heading 3</option>
                                </select>
                            </div>

                            <div class="toolbar-group">
                                <button id="bullet" title="Bullet List">• List</button>
                                <button id="ordered" title="Ordered List">1. List</button>
                                <button id="quote" title="Blockquote">❝ Quote</button>
                            </div>

                            <div class="toolbar-group">
                                <button id="code" title="Inline Code">Code</button>
                                <button id="codeBlock" title="Code Block">&lt;/&gt;</button>
                            </div>

                            <div class="toolbar-group">
                                <button id="link" title="Add Link">🔗</button>
                                <button id="highlight" title="Highlight">🖍</button>
                                <button id="clear" title="Clear Formatting">✕</button>
                            </div>

                            <div class="toolbar-group">
                                <button id="undo" title="Undo">↶</button>
                                <button id="redo" title="Redo">↷</button>
                            </div>
                        </div>

                        <!-- Editor -->
                        <div id="editor" class="editor-container">
                            <p>Bắt đầu viết nội dung bài viết của bạn tại đây...</p>
                        </div>
                    </div>

                    <!-- SEO Section -->
                    <div class="form-section">
                        <h2>🔍 SEO</h2>
                        <div class="form-group">
                            <label>Mô Tả Meta</label>
                            <textarea id="meta-desc" placeholder="Nhập mô tả SEO..." rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Thẻ (cách nhau bằng dấu phẩy)</label>
                            <input type="text" id="tags" placeholder="tag1, tag2, tag3">
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="form-actions">
                        <button class="btn btn-primary" id="publish">📤 Xuất Bản</button>
                        <button class="btn btn-primary" id="schedule">⏰ Lên Lịch</button>
                        <button class="btn btn-secondary" id="save-draft">💾 Lưu Nháp</button>
                        <button class="btn btn-danger" id="cancel">✕ Hủy</button>
                    </div>
                </div>
            </div>

            <!-- Tab: Events -->
            <div id="events" class="tab-content">
                <div class="form-container">
                    <h2>Quản Lý Sự Kiện</h2>
                    <p>Chức năng quản lý sự kiện sẽ được thêm vào sau</p>
                </div>
            </div>

            <!-- Tab: Media -->
            <div id="media" class="tab-content">
                <div class="form-container">
                    <h2>Thư Viện Ảnh</h2>
                    <p>Chức năng thư viện ảnh sẽ được thêm vào sau</p>
                </div>
            </div>

            <!-- Tab: Pages -->
            <div id="pages" class="tab-content">
                <div class="form-container">
                    <h2>Quản Lý Trang Tĩnh</h2>
                    <p>Chức năng quản lý trang tĩnh sẽ được thêm vào sau</p>
                </div>
            </div>

            <!-- Tab: Settings -->
            <div id="settings" class="tab-content">
                <div class="form-container">
                    <h2>Cài Đặt</h2>
                    <p>Chức năng cài đặt sẽ được thêm vào sau</p>
                </div>
            </div>
        </main>
    </div>

    <script>
        // API Configuration
        const API_BASE_URL = 'http://localhost:3000/api';
        const AUTH_TOKEN_KEY = 'authToken';

        // Editor instance
        let editor;

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', () => {
            initEditor();
            setupToolbarListeners();
            setupFormListeners();
            loadArticlesList();
        });

        // Initialize Tiptap Editor
        function initEditor() {
            editor = new Tiptap.Editor({
                element: document.getElementById('editor'),
                extensions: [
                    Tiptap.StarterKit,
                    Tiptap.TextAlign.configure({
                        types: ['heading', 'paragraph'],
                        alignments: ['left', 'center', 'right'],
                    }),
                    Tiptap.Link.configure({ openOnClick: false }),
                    Tiptap.Image,
                    Tiptap.Highlight.configure({ multicolor: true }),
                ],
                onUpdate: () => updateToolbarState(),
            });
        }

        // Tab switching
        function switchTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(tabName).classList.add('active');

            document.querySelectorAll('.tabs button').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
        }

        // API Helper Functions
        function getAuthToken() {
            return localStorage.getItem(AUTH_TOKEN_KEY);
        }

        function saveAuthToken(token) {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
        }

        async function apiRequest(endpoint, method = 'GET', data = null) {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return response.json();
        }

        async function apiRequestWithFile(endpoint, formData) {
            const options = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: formData
            };

            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return response.json();
        }

        // Toolbar Setup
        function setupToolbarListeners() {
            document.getElementById('bold').addEventListener('click', () => {
                editor.chain().focus().toggleBold().run();
                updateToolbarState();
            });

            document.getElementById('italic').addEventListener('click', () => {
                editor.chain().focus().toggleItalic().run();
                updateToolbarState();
            });

            document.getElementById('underline').addEventListener('click', () => {
                editor.chain().focus().toggleUnderline().run();
                updateToolbarState();
            });

            document.getElementById('strike').addEventListener('click', () => {
                editor.chain().focus().toggleStrike().run();
                updateToolbarState();
            });

            document.getElementById('heading').addEventListener('change', (e) => {
                const level = e.target.value;
                if (level === 'paragraph') {
                    editor.chain().focus().setParagraph().run();
                } else {
                    editor.chain().focus().setHeading({ level: parseInt(level) }).run();
                }
                e.target.value = 'paragraph';
                updateToolbarState();
            });

            document.getElementById('bullet').addEventListener('click', () => {
                editor.chain().focus().toggleBulletList().run();
                updateToolbarState();
            });

            document.getElementById('ordered').addEventListener('click', () => {
                editor.chain().focus().toggleOrderedList().run();
                updateToolbarState();
            });

            document.getElementById('quote').addEventListener('click', () => {
                editor.chain().focus().toggleBlockquote().run();
                updateToolbarState();
            });

            document.getElementById('code').addEventListener('click', () => {
                editor.chain().focus().toggleCode().run();
                updateToolbarState();
            });

            document.getElementById('codeBlock').addEventListener('click', () => {
                editor.chain().focus().toggleCodeBlock().run();
                updateToolbarState();
            });

            document.getElementById('link').addEventListener('click', () => {
                const url = prompt('Nhập URL:', 'https://');
                if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                }
            });

            document.getElementById('highlight').addEventListener('click', () => {
                editor.chain().focus().toggleHighlight({ color: '#ffeb3b' }).run();
            });

            document.getElementById('clear').addEventListener('click', () => {
                editor.chain().focus().clearNodes().run();
            });

            document.getElementById('undo').addEventListener('click', () => {
                editor.chain().focus().undo().run();
            });

            document.getElementById('redo').addEventListener('click', () => {
                editor.chain().focus().redo().run();
            });
        }

        // Form Listeners
        function setupFormListeners() {
            document.getElementById('publish').addEventListener('click', () => {
                saveArticle('published');
            });

            document.getElementById('schedule').addEventListener('click', () => {
                const date = prompt('Chọn ngày xuất bản:', new Date().toISOString().split('T')[0]);
                if (date) {
                    scheduleArticle(date);
                }
            });

            document.getElementById('save-draft').addEventListener('click', () => {
                saveArticle('draft');
            });

            document.getElementById('cancel').addEventListener('click', () => {
                if (confirm('Bạn chắc chắn muốn hủy? Tất cả thay đổi sẽ bị mất.')) {
                    document.getElementById('title').value = '';
                    editor.commands.setContent('<p></p>');
                    document.getElementById('category').value = '';
                    document.getElementById('status').value = 'draft';
                    document.getElementById('meta-desc').value = '';
                    document.getElementById('tags').value = '';
                    switchTab('articles');
                }
            });
        }

        // Save Article
        async function saveArticle(status = 'draft') {
            try {
                const title = document.getElementById('title').value;
                
                if (!title) {
                    showToast('Vui lòng nhập tiêu đề', 'error');
                    return;
                }

                const formData = new FormData();
                formData.append('title', title);
                formData.append('content', editor.getHTML());
                formData.append('category', document.getElementById('category').value);
                formData.append('status', status);
                formData.append('metaDesc', document.getElementById('meta-desc').value);
                formData.append('tags', document.getElementById('tags').value);
                
                const imageFile = document.getElementById('featured-image').files[0];
                if (imageFile) {
                    formData.append('featured_image', imageFile);
                }

                const result = await apiRequestWithFile('/articles', formData);

                if (result.success) {
                    showToast(`Bài viết ${status === 'published' ? 'đã xuất bản' : 'đã lưu'} thành công!`);
                    setTimeout(() => {
                        switchTab('articles');
                        loadArticlesList();
                    }, 1500);
                } else {
                    showToast('Lỗi: ' + result.error, 'error');
                }
            } catch (error) {
                showToast('Lỗi khi lưu bài viết: ' + error.message, 'error');
                console.error(error);
            }
        }

        // Schedule Article
        async function scheduleArticle(publishDate) {
            try {
                const title = document.getElementById('title').value;
                
                if (!title) {
                    showToast('Vui lòng nhập tiêu đề', 'error');
                    return;
                }

                const formData = new FormData();
                formData.append('title', title);
                formData.append('content', editor.getHTML());
                formData.append('category', document.getElementById('category').value);
                formData.append('status', 'scheduled');
                formData.append('metaDesc', document.getElementById('meta-desc').value);
                formData.append('tags', document.getElementById('tags').value);
                
                const imageFile = document.getElementById('featured-image').files[0];
                if (imageFile) {
                    formData.append('featured_image', imageFile);
                }

                const result = await apiRequestWithFile('/articles', formData);

                if (result.success) {
                    const updateResult = await apiRequest(
                        `/articles/${result.data._id}/schedule`,
                        'POST',
                        { publishDate: new Date(publishDate).toISOString() }
                    );

                    if (updateResult.success) {
                        showToast(`Bài viết sẽ xuất bản vào ${publishDate}`);
                        setTimeout(() => {
                            switchTab('articles');
                            loadArticlesList();
                        }, 1500);
                    }
                } else {
                    showToast('Lỗi: ' + result.error, 'error');
                }
            } catch (error) {
                showToast('Lỗi khi lên lịch bài viết: ' + error.message, 'error');
            }
        }

        // Load Articles List
        async function loadArticlesList() {
            try {
                const result = await apiRequest('/articles?limit=100');

                if (result.success) {
                    const tbody = document.getElementById('articles-tbody');
                    tbody.innerHTML = '';

                    if (result.data.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Không có bài viết nào</td></tr>';
                        return;
                    }

                    result.data.forEach(article => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td><img src="${article.featuredImage || 'placeholder.jpg'}" alt="${article.title}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
                            <td><strong>${article.title}</strong></td>
                            <td>${article.category}</td>
                            <td><span class="status-badge status-${article.status}">${article.status}</span></td>
                            <td>
                                <button class="btn" onclick="editArticle('${article._id}')" style="padding: 6px 12px; font-size: 12px;">Sửa</button>
                                <button class="btn btn-danger" onclick="deleteArticle('${article._id}')" style="padding: 6px 12px; font-size: 12px;">Xóa</button>
                            </td>
                        `;
                        tbody.appendChild(row);
                    });
                }
            } catch (error) {
                console.error('Error loading articles:', error);
            }
        }

        // Delete Article
        async function deleteArticle(articleId) {
            if (!confirm('Bạn chắc chắn muốn xóa bài viết này?')) return;

            try {
                const result = await apiRequest(`/articles/${articleId}`, 'DELETE');

                if (result.success) {
                    showToast('Bài viết đã bị xóa!');
                    loadArticlesList();
                } else {
                    showToast('Lỗi: ' + result.error, 'error');
                }
            } catch (error) {
                showToast('Lỗi khi xóa bài viết: ' + error.message, 'error');
            }
        }

        // Edit Article
        async function editArticle(articleId) {
            try {
                const result = await apiRequest(`/articles/${articleId}`);

                if (result.success) {
                    const article = result.data;
                    document.getElementById('title').value = article.title;
                    document.getElementById('category').value = article.category;
                    document.getElementById('status').value = article.status;
                    document.getElementById('meta-desc').value = article.metaDescription || '';
                    document.getElementById('tags').value = article.tags.join(', ') || '';
                    editor.commands.setContent(article.content);
                    switchTab('add-article');
                    showToast('Bài viết đã tải xong');
                }
            } catch (error) {
                showToast('Lỗi khi tải bài viết: ' + error.message, 'error');
            }
        }

        // Update Toolbar State
        function updateToolbarState() {
            document.getElementById('bold').classList.toggle('active', editor.isActive('bold'));
            document.getElementById('italic').classList.toggle('active', editor.isActive('italic'));
            document.getElementById('underline').classList.toggle('active', editor.isActive('underline'));
            document.getElementById('strike').classList.toggle('active', editor.isActive('strike'));
            document.getElementById('bullet').classList.toggle('active', editor.isActive('bulletList'));
            document.getElementById('ordered').classList.toggle('active', editor.isActive('orderedList'));
            document.getElementById('quote').classList.toggle('active', editor.isActive('blockquote'));
            document.getElementById('code').classList.toggle('active', editor.isActive('code'));
            document.getElementById('codeBlock').classList.toggle('active', editor.isActive('codeBlock'));
            document.getElementById('highlight').classList.toggle('active', editor.isActive('highlight'));
        }

        // Show Toast Notification
        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = 'toast' + (type === 'error' ? ' error' : '');
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // Logout
        function logout() {
            if (confirm('Bạn chắc chắn muốn đăng xuất?')) {
                localStorage.removeItem(AUTH_TOKEN_KEY);
                showToast('Đã đăng xuất!');
                setTimeout(() => {
                    location.href = 'admin-login.html';
                }, 1000);
            }
        }

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                editor.chain().focus().toggleBold().run();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                editor.chain().focus().toggleItalic().run();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                e.preventDefault();
                editor.chain().focus().toggleUnderline().run();
            }
        });
    </script>
</body>
</html>
