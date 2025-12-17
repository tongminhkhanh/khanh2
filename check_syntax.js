const API_URL = '/api';
let token = localStorage.getItem('admin-token');
let currentUser = null;

// Media Upload
const mediaUpload = document.getElementById('media-upload');
if (mediaUpload) {
    mediaUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                fetchMedia();
            } else {
                alert('Lỗi tải ảnh: ' + data.message);
            }
        } catch (err) {
            console.error(err);
        }
    });

    async function fetchMedia(forModal = false) {
        const res = await fetch(`${API_URL}/media`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const media = await res.json();

        const container = forModal ? document.getElementById('modal-media-grid') :

                    if (forModal) {
            div.onclick = () => selectMedia(item.path);
        } else {
            div.innerHTML += `
                    <div
                        class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                        ${item.filename}
                    </div>
                    `;
        }
        container.appendChild(div);
    });
}

// Media Selector Modal
let tinymceCallback = null;

window.openMediaSelector = (inputId, callback = null) => {
    mediaTargetInput = inputId;
    tinymceCallback = callback;
    document.getElementById('media-modal').classList.remove('hidden');
    fetchMedia(true);
};

window.closeMediaModal = () => {
    document.getElementById('media-modal').classList.add('hidden');
    mediaTargetInput = null;
    tinymceCallback = null;
};

function selectMedia(url) {
    if (tinymceCallback) {
        tinymceCallback(url, { alt: 'Image' });
    } else if (mediaTargetInput) {
        document.getElementById(mediaTargetInput).value = url;
    }
    closeMediaModal();
}

// Toggle Login/Register
document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('auth-title').innerText = 'Đăng ký Admin';
    clearMessages();
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('auth-title').innerText = 'Đăng nhập Admin';
    clearMessages();
});

function clearMessages() {
    document.getElementById('auth-error').classList.add('hidden');
    document.getElementById('auth-success').classList.add('hidden');
}

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    localStorage.setItem('admin-token', token);

    // Decode token to get user info
    const payload = JSON.parse(atob(token.split('.')[1]));
    currentUser = payload;

    showDashboard();
} else {
    showError(data.message);
        }
                    } catch (err) {
    showError('Lỗi kết nối server');
}
                    });

// Register
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const fullName = document.getElementById('reg-fullname').value;
    const password = document.getElementById('reg-password').value;

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        } catch (err) {
            showError('Lỗi kết nối server');
        }
    });

function showError(msg) {
    const errEl = document.getElementById('auth-error');
    errEl.innerText = msg;
    errEl.classList.remove('hidden');
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('admin-token');
    location.reload();
});

function showAuth() {
    document.getElementById('auth-modal').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');

    // Update User Info
    if (currentUser) {
        document.getElementById('user-name').innerText = currentUser.username;
        document.getElementById('user-role').innerText = currentUser.role.toUpperCase();
        document.getElementById('user-avatar').innerText =
            currentUser.username.charAt(0).toUpperCase();

        // Show Admin Menu if role is admin
        if (currentUser.role === 'admin') {
            document.getElementById('admin-menu').classList.remove('hidden');
        }
    }

    fetchArticles();
}

// Fetch Articles
async function fetchArticles() {
    const res = await fetch(`${API_URL}/articles`);
    const articles = await res.json();
    const tbody = document.getElementById('articles-list');
    tbody.innerHTML = '';

    articles.forEach(article => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${article.image ? `<img src="${article.image}" class="h-10 w-10 rounded object-cover">` : '<div
                            class="h-10 w-10 rounded bg-gray-200" ></div > '}
                    </td >
                    <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${article.title}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-500">${article.category}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${article.status === 'published' ? 'bg-green-100 text-green-800' :
                        article.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'}">
                            ${article.status === 'published' ? 'Đã xuất bản' :
                            article.status === 'pending' ? 'Chờ duyệt' : 'Nháp'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${new Date(article.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="editArticle('${article._id}')"
                            class="text-indigo-600 hover:text-indigo-900 mr-4">Sửa</button>
                        <button onclick="deleteArticle('${article._id}')"
                            class="text-red-600 hover:text-red-900">Xóa</button>
                    </td>
        `;
                    tbody.appendChild(tr);
                    });
                    }

                    // Add/Edit Article
                    document.getElementById('article-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const id = document.getElementById('article-id').value;
                    const content = tinymce.get('content').getContent();

                    const article = {
                    title: document.getElementById('title').value,
                    category: document.getElementById('category').value,
                    image: document.getElementById('image').value,
                    content: content,
                    status: document.getElementById('status').value,
                    tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t)
                    };

                    const method = id ? 'PUT' : 'POST';
                    const url = id ? `${ API_URL } /articles/${ id } ` : `${ API_URL }/articles`;

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(article)
            });

            if (res.ok) {
                resetForm();
                fetchArticles();
            } else {
                const data = await res.json();
                alert('Lỗi: ' + data.message);
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Edit Article Setup
    window.editArticle = async (id) => {
        const res = await fetch(`${API_URL}/articles`);
        const articles = await res.json();
        const article = articles.find(a => a._id === id);

        if (article) {
            document.getElementById('article-id').value = article._id;
            document.getElementById('title').value = article.title;
            document.getElementById('category').value = article.category;
            document.getElementById('image').value = article.image || '';
            document.getElementById('status').value = article.status || 'draft';
            document.getElementById('tags').value = article.tags ? article.tags.join(', ') : '';
            tinymce.get('content').setContent(article.content);

            document.getElementById('cancel-edit').classList.remove('hidden');
            window.scrollTo(0, 0);
        }
    };

    // Delete Article
    window.deleteArticle = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            await fetch(`${API_URL}/articles/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchArticles();
        }
    };

    document.getElementById('cancel-edit').addEventListener('click', resetForm);

    function resetForm() {
        document.getElementById('article-form').reset();
        document.getElementById('article-id').value = '';
        tinymce.get('content').setContent('');
        document.getElementById('cancel-edit').classList.add('hidden');
    }

    // --- Static Pages Logic ---

    // Slug Generator
    window.generateSlug = () => {
        const title = document.getElementById('page-title-input').value;
        const slug = title.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
            .trim()
            .replace(/\s+/g, '-'); // Replace spaces with dashes
        document.getElementById('page-slug').value = slug;
    };

    // Fetch Pages
    async function fetchPages() {
        const res = await fetch(`${API_URL}/admin/static-pages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const pages = await res.json();
        const tbody = document.getElementById('pages-list');
        tbody.innerHTML = '';

        pages.forEach(page => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${page.title}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-500">/${page.slug}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span
                            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${page.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                            ${page.isPublished ? 'Đã xuất bản' : 'Nháp'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${new Date(page.updatedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="editPage('${page._id}')"
                            class="text-indigo-600 hover:text-indigo-900 mr-4">Sửa</button>
                        <button onclick="deletePage('${page._id}')" class="text-red-600 hover:text-red-900">Xóa</button>
                    </td>
                `;
            tbody.appendChild(tr);
        });
    }

    // Add/Edit Page
    document.getElementById('page-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('page-id').value;
        const content = tinymce.get('page-content-editor').getContent();

        const page = {
            title: document.getElementById('page-title-input').value,
            slug: document.getElementById('page-slug').value,
            content: content,
            isPublished: document.getElementById('page-published').checked
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/admin/static-pages/${id}` :
            `${API_URL}/admin/static-pages`;

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(page)
            });

            if (res.ok) {
                resetPageForm();
                fetchPages();
            } else {
                const data = await res.json();
                alert('Lỗi: ' + data.message);
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Edit Page Setup
    window.editPage = async (id) => {
        const res = await fetch(`${API_URL}/admin/static-pages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const pages = await res.json();
        const page = pages.find(p => p._id === id);

        if (page) {
            document.getElementById('page-id').value = page._id;
            document.getElementById('page-title-input').value = page.title;
            document.getElementById('page-slug').value = page.slug;
            document.getElementById('page-published').checked = page.isPublished;
            tinymce.get('page-content-editor').setContent(page.content);

            document.getElementById('cancel-page-edit').classList.remove('hidden');
            window.scrollTo(0, 0);
        }
    };

    // Delete Page
    window.deletePage = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa trang này?')) {
            await fetch(`${API_URL}/admin/static-pages/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchPages();
        }
    };

    document.getElementById('cancel-page-edit').addEventListener('click', resetPageForm);

    function resetPageForm() {
        document.getElementById('page-form').reset();
        document.getElementById('page-id').value = '';
        tinymce.get('page-content-editor').setContent('');
        document.getElementById('cancel-page-edit').classList.add('hidden');
    }

    // --- Navigation Logic ---
    const navLinks = {
        'nav-dashboard': 'section-dashboard',
        'nav-articles': 'section-articles',
        'nav-media': 'section-media',
        'nav-pages': 'section-pages',
        'nav-settings': 'section-settings'
    };

    Object.keys(navLinks).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', (e) => {
                e.preventDefault();

                // Update active state
                document.querySelectorAll('aside nav a').forEach(link => {
                    link.classList.remove('bg-blue-50', 'text-primary');
                    link.classList.add('text-gray-600');
                });
                e.currentTarget.classList.remove('text-gray-600');
                e.currentTarget.classList.add('bg-blue-50', 'text-primary');

                // Show section
                document.querySelectorAll('main > section').forEach(section => {
                    section.classList.add('hidden');
                });
                document.getElementById(navLinks[id]).classList.remove('hidden');

                // Update title
                const titles = {
                    'nav-dashboard': 'Tổng quan',
                    'nav-articles': 'Quản lý bài viết',
                    'nav-media': 'Thư viện ảnh',
                    'nav-pages': 'Trang tĩnh',
                    'nav-settings': 'Cài đặt chung'
                };
                document.getElementById('page-title').textContent = titles[id];

                // Load data if needed
                if (id === 'nav-articles') fetchArticles();
                if (id === 'nav-media') fetchMedia();
                if (id === 'nav-pages') fetchPages();
                if (id === 'nav-settings') fetchSettings();
            });
