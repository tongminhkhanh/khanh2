# Hướng dẫn Tích hợp Tiptap vào CMS Node.js/Express + Vanilla JS

## Mục tiêu
Tạo editor Tiptap trong ứng dụng Node.js/Express với EJS/HTML template và Vanilla JS, đầy đủ tính năng: font chữ, cỡ chữ, màu sắc, chèn Youtube, bảng, v.v. sử dụng các extension **free**.

---

## Cấu trúc thư mục Node.js/Express

```
cms-express/
├── src/
│   ├── controllers/
│   │   └── postController.js
│   ├── models/
│   │   └── Post.js
│   ├── routes/
│   │   └── posts.js
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.ejs
│   │   └── posts/
│   │       ├── create.ejs
│   │       └── edit.ejs
│   ├── public/
│   │   ├── js/
│   │   │   ├── editor.js
│   │   │   └── app.js (build output)
│   │   └── css/
│   │       └── app.css
│   └── app.js
├── config/
│   └── database.js
├── package.json
├── vite.config.js
└── .env
```

---

## Bước 1: Khởi tạo Node.js project

### 1.1 Tạo thư mục và khởi tạo package.json
```bash
mkdir cms-express
cd cms-express
npm init -y
```

### 1.2 Cài đặt dependencies
```bash
npm install express ejs body-parser cors dotenv mongoose
npm install nodemon --save-dev
npm install --save-dev vite
npm install @tiptap/core @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-youtube @tiptap/extension-text-align @tiptap/extension-text-style @tiptap/extension-font-family @tiptap/extension-font-size @tiptap/extension-color @tiptap/extension-highlight @tiptap/extension-underline @tiptap/extension-typography @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell @tiptap/extension-bubble-menu @tiptap/extension-floating-menu
```

### 1.3 Cập nhật `package.json`
```json
{
  "name": "cms-express",
  "version": "1.0.0",
  "description": "CMS with Tiptap Editor",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "dev:vite": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "express": "^4.18.0",
    "ejs": "^3.1.0",
    "body-parser": "^1.20.0",
    "cors": "^2.8.0",
    "dotenv": "^16.0.0",
    "mongoose": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0",
    "vite": "^latest"
  }
}
```

---

## Bước 2: Cấu hình Vite

### 2.1 Tạo `vite.config.js`
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'src/public/dist',
    emptyOutDir: true,
  },
  server: {
    middlewareMode: true,
  },
});
```

---

## Bước 3: Cấu hình Database (MongoDB)

### 3.1 Tạo `config/database.js`
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 3.2 Tạo `.env`
```
MONGODB_URI=mongodb://localhost:27017/cms
PORT=3000
NODE_ENV=development
```

---

## Bước 4: Tạo Model

### 4.1 Tạo `src/models/Post.js`
```javascript
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['tin-tuc', 'huong-dan', 'san-pham', 'tu-van'],
  },
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Tự động tạo slug từ title
postSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Post', postSchema);
```

---

## Bước 5: Tạo Controller

### 5.1 Tạo `src/controllers/postController.js`
```javascript
const Post = require('../models/Post');

// Hiển thị form tạo bài viết
exports.showCreateForm = (req, res) => {
  res.render('posts/create', { title: 'Thêm bài viết mới' });
};

// Lưu bài viết mới
exports.store = async (req, res) => {
  try {
    const { title, category, status, content } = req.body;

    // Validation
    if (!title || !category || !status || !content) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin',
      });
    }

    // Tạo bài viết mới
    const post = new Post({
      title,
      category,
      status,
      content,
    });

    // Lưu vào database
    await post.save();

    return res.json({
      success: true,
      message: 'Bài viết đã được lưu thành công!',
      post,
    });
  } catch (error) {
    console.error('Error saving post:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi: ${error.message}`,
    });
  }
};

// Hiển thị form chỉnh sửa bài viết
exports.showEditForm = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Bài viết không tồn tại');
    }
    res.render('posts/edit', { title: 'Chỉnh sửa bài viết', post });
  } catch (error) {
    return res.status(500).send(`Lỗi: ${error.message}`);
  }
};

// Cập nhật bài viết
exports.update = async (req, res) => {
  try {
    const { title, category, status, content } = req.body;

    // Validation
    if (!title || !category || !status || !content) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin',
      });
    }

    // Tìm và cập nhật
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, category, status, content },
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại',
      });
    }

    return res.json({
      success: true,
      message: 'Bài viết đã được cập nhật!',
      post,
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi: ${error.message}`,
    });
  }
};

// Lấy danh sách bài viết (optional)
exports.list = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.render('posts/list', { title: 'Danh sách bài viết', posts });
  } catch (error) {
    return res.status(500).send(`Lỗi: ${error.message}`);
  }
};
```

---

## Bước 6: Cấu hình Routes

### 6.1 Tạo `src/routes/posts.js`
```javascript
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Routes
router.get('/create', postController.showCreateForm);
router.post('/', postController.store);
router.get('/:id/edit', postController.showEditForm);
router.post('/:id', postController.update);
router.get('/', postController.list);

module.exports = router;
```

---

## Bước 7: Tạo Express App

### 7.1 Tạo `src/app.js`
```javascript
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('../config/database');
const postRoutes = require('./routes/posts');
const path = require('path');

const app = express();

// Kết nối database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/admin/posts', postRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('CMS Server is running');
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`Error: ${err.message}`);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## Bước 8: Tạo EJS Templates

### 8.1 Tạo `src/views/layouts/main.ejs`
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %> - CMS</title>
  <link rel="stylesheet" href="/css/app.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      margin-bottom: 30px;
      color: #333;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }
    input[type="text"],
    input[type="email"],
    select,
    textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
    }
    input[type="text"]:focus,
    input[type="email"]:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
    #editor {
      border: 1px solid #ddd;
      border-radius: 4px;
      min-height: 400px;
      padding: 15px;
      background: white;
    }
    .form-actions {
      margin-top: 30px;
      display: flex;
      gap: 10px;
    }
    .btn-save {
      background: #28a745;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-save:hover {
      background: #218838;
    }
    .btn-cancel {
      background: #6c757d;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-cancel:hover {
      background: #5a6268;
    }
    .message {
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
      display: none;
    }
    .message.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
      display: block;
    }
    .message.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      display: block;
    }

    /* Editor ProseMirror styles */
    .ProseMirror {
      outline: none;
      font-size: 16px;
      line-height: 1.8;
      word-wrap: break-word;
    }
    .ProseMirror p { margin-bottom: 1em; }
    .ProseMirror h1 { font-size: 2em; margin: 0.5em 0; font-weight: 600; }
    .ProseMirror h2 { font-size: 1.5em; margin: 0.5em 0; font-weight: 600; }
    .ProseMirror h3 { font-size: 1.25em; margin: 0.5em 0; font-weight: 600; }
    .ProseMirror blockquote {
      border-left: 4px solid #007bff;
      padding-left: 16px;
      color: #666;
      font-style: italic;
    }
    .ProseMirror code {
      background: #f9f9f9;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
    }
    .ProseMirror img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      margin: 1em 0;
    }
    .ProseMirror table {
      border-collapse: collapse;
      margin: 1em 0;
      width: 100%;
    }
    .ProseMirror table td,
    .ProseMirror table th {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    .ProseMirror table th {
      background: #f9f9f9;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <%- body %>
  </div>
  <script src="/js/app.js" type="module"></script>
</body>
</html>
```

### 8.2 Tạo `src/views/posts/create.ejs`
```html
<h1><%= title %></h1>

<div id="message" class="message"></div>

<form id="post-form">
  <div class="form-group">
    <label for="title">Tiêu đề bài viết *</label>
    <input type="text" id="title" name="title" required placeholder="Nhập tiêu đề bài viết">
  </div>

  <div class="form-group">
    <label for="category">Danh mục *</label>
    <select id="category" name="category" required>
      <option value="">Chọn danh mục</option>
      <option value="tin-tuc">Tin tức</option>
      <option value="huong-dan">Hướng dẫn</option>
      <option value="san-pham">Sản phẩm</option>
      <option value="tu-van">Tư vấn</option>
    </select>
  </div>

  <div class="form-group">
    <label for="status">Trạng thái *</label>
    <select id="status" name="status" required>
      <option value="draft">Nháp</option>
      <option value="published">Xuất bản</option>
    </select>
  </div>

  <div class="form-group">
    <label for="editor">Nội dung bài viết *</label>
    <div id="editor"></div>
  </div>

  <input type="hidden" id="content-input" name="content" required>

  <div class="form-actions">
    <button type="submit" class="btn-save">Lưu bài viết</button>
    <button type="reset" class="btn-cancel">Hủy</button>
  </div>
</form>

<script>
  window.formAction = 'create';
  window.postRoute = '/admin/posts';
</script>
```

### 8.3 Tạo `src/views/posts/edit.ejs`
```html
<h1><%= title %></h1>

<div id="message" class="message"></div>

<form id="post-form">
  <div class="form-group">
    <label for="title">Tiêu đề bài viết *</label>
    <input type="text" id="title" name="title" required placeholder="Nhập tiêu đề bài viết" value="<%= post.title %>">
  </div>

  <div class="form-group">
    <label for="category">Danh mục *</label>
    <select id="category" name="category" required>
      <option value="">Chọn danh mục</option>
      <option value="tin-tuc" <% if(post.category === 'tin-tuc') { %>selected<% } %>>Tin tức</option>
      <option value="huong-dan" <% if(post.category === 'huong-dan') { %>selected<% } %>>Hướng dẫn</option>
      <option value="san-pham" <% if(post.category === 'san-pham') { %>selected<% } %>>Sản phẩm</option>
      <option value="tu-van" <% if(post.category === 'tu-van') { %>selected<% } %>>Tư vấn</option>
    </select>
  </div>

  <div class="form-group">
    <label for="status">Trạng thái *</label>
    <select id="status" name="status" required>
      <option value="draft" <% if(post.status === 'draft') { %>selected<% } %>>Nháp</option>
      <option value="published" <% if(post.status === 'published') { %>selected<% } %>>Xuất bản</option>
    </select>
  </div>

  <div class="form-group">
    <label for="editor">Nội dung bài viết *</label>
    <div id="editor"><%- post.content %></div>
  </div>

  <input type="hidden" id="content-input" name="content" required value="<%- post.content %>">

  <div class="form-actions">
    <button type="submit" class="btn-save">Cập nhật bài viết</button>
    <button type="reset" class="btn-cancel">Hủy</button>
  </div>
</form>

<script>
  window.formAction = 'update';
  window.postRoute = '/admin/posts/<%= post._id %>';
  window.postId = '<%= post._id %>';
</script>
```

### 8.4 Tạo `src/views/posts/list.ejs` (optional)
```html
<h1><%= title %></h1>

<a href="/admin/posts/create" class="btn-save" style="display: inline-block; text-decoration: none; margin-bottom: 20px;">
  Thêm bài viết mới
</a>

<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
  <thead>
    <tr style="background: #f9f9f9; border-bottom: 2px solid #ddd;">
      <th style="padding: 10px; text-align: left;">Tiêu đề</th>
      <th style="padding: 10px; text-align: left;">Danh mục</th>
      <th style="padding: 10px; text-align: left;">Trạng thái</th>
      <th style="padding: 10px; text-align: left;">Hành động</th>
    </tr>
  </thead>
  <tbody>
    <% posts.forEach(post => { %>
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px;"><%= post.title %></td>
        <td style="padding: 10px;"><%= post.category %></td>
        <td style="padding: 10px;">
          <span style="padding: 5px 10px; border-radius: 4px; font-size: 12px; 
            <% if(post.status === 'published') { %>background: #d4edda; color: #155724;<% } else { %>background: #fff3cd; color: #856404;<% } %>">
            <%= post.status === 'published' ? 'Xuất bản' : 'Nháp' %>
          </span>
        </td>
        <td style="padding: 10px;">
          <a href="/admin/posts/<%= post._id %>/edit" style="color: #007bff; text-decoration: none; margin-right: 10px;">
            Sửa
          </a>
        </td>
      </tr>
    <% }); %>
  </tbody>
</table>
```

---

## Bước 9: Tạo JavaScript files

### 9.1 Tạo `src/public/js/editor.js`
```javascript
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import FontSize from '@tiptap/extension-font-size';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Typography from '@tiptap/extension-typography';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import FloatingMenu from '@tiptap/extension-floating-menu';

export function initEditor(containerId, contentInputId, initialContent = '<p>Nhập nội dung bài viết…</p>') {
  const editor = new Editor({
    element: document.querySelector(`#${containerId}`),
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: true,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      FontSize.configure({
        types: ['textStyle'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      Typography,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      BubbleMenu.configure({
        element: createBubbleMenuElement(),
      }),
      FloatingMenu.configure({
        element: createFloatingMenuElement(),
      }),
    ],
    content: initialContent,
    onUpdate({ editor }) {
      document.querySelector(`#${contentInputId}`).value = editor.getHTML();
    },
  });

  return editor;
}

function createBubbleMenuElement() {
  const menu = document.createElement('div');
  menu.className = 'bubble-menu';
  menu.innerHTML = `
    <button data-action="bold" title="Bold (Ctrl+B)">B</button>
    <button data-action="italic" title="Italic (Ctrl+I)">I</button>
    <button data-action="underline" title="Underline (Ctrl+U)">U</button>
    <button data-action="strike" title="Strikethrough">S</button>
  `;
  menu.style.cssText = `
    display: none;
    position: fixed;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 1000;
  `;

  return menu;
}

function createFloatingMenuElement() {
  const menu = document.createElement('div');
  menu.className = 'floating-menu';
  menu.innerHTML = `
    <button data-action="h1" title="Heading 1">H1</button>
    <button data-action="h2" title="Heading 2">H2</button>
    <button data-action="h3" title="Heading 3">H3</button>
    <button data-action="bullet" title="Bullet List">•</button>
    <button data-action="ordered" title="Ordered List">1.</button>
    <button data-action="quote" title="Blockquote">"</button>
    <button data-action="code" title="Code Block">&lt;&gt;</button>
  `;
  menu.style.cssText = `
    display: none;
    position: fixed;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 1000;
  `;

  return menu;
}
```

### 9.2 Tạo `src/public/js/app.js`
```javascript
import { initEditor } from './editor.js';

document.addEventListener('DOMContentLoaded', () => {
  // Lấy nội dung hiện tại (nếu edit)
  const contentInput = document.querySelector('#content-input');
  const currentContent = contentInput.value || '<p>Nhập nội dung bài viết…</p>';
  
  // Khởi tạo editor
  const editor = initEditor('editor', 'content-input', currentContent);
  window.editor = editor;

  // Xử lý submit form
  const form = document.querySelector('#post-form');
  const messageDiv = document.querySelector('#message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.querySelector('#title').value;
    const category = document.querySelector('#category').value;
    const status = document.querySelector('#status').value;
    const content = document.querySelector('#content-input').value;

    if (!title || !category || !status || !content) {
      showMessage('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    const postData = {
      title,
      category,
      status,
      content,
    };

    try {
      const response = await fetch(window.postRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();

      if (result.success) {
        showMessage(result.message, 'success');
        setTimeout(() => {
          window.location.href = '/admin/posts'; // Chuyển hướng sau khi lưu
        }, 1500);
      } else {
        showMessage(result.message, 'error');
      }
    } catch (error) {
      showMessage(`Lỗi: ${error.message}`, 'error');
    }
  });

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    setTimeout(() => {
      messageDiv.className = 'message';
    }, 5000);
  }
});
```

### 9.3 Tạo `src/public/css/app.css`
```css
:root {
  --primary: #007bff;
  --primary-hover: #0056b3;
  --success: #28a745;
  --border: #ddd;
  --bg-light: #f9f9f9;
  --text-primary: #333;
  --text-secondary: #666;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  color: var(--text-primary);
  line-height: 1.6;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h1 {
  margin-bottom: 30px;
  color: var(--text-primary);
  font-size: 28px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

input[type="text"],
input[type="email"],
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

input[type="text"]:focus,
input[type="email"]:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

#editor {
  border: 1px solid var(--border);
  border-radius: 4px;
  min-height: 400px;
  padding: 15px;
  background: white;
}

/* ProseMirror editor styles */
.ProseMirror {
  outline: none;
  font-size: 16px;
  line-height: 1.8;
  word-wrap: break-word;
}

.ProseMirror p {
  margin-bottom: 1em;
}

.ProseMirror h1,
.ProseMirror h2,
.ProseMirror h3,
.ProseMirror h4,
.ProseMirror h5,
.ProseMirror h6 {
  margin: 0.5em 0;
  font-weight: 600;
  line-height: 1.3;
}

.ProseMirror h1 { font-size: 2em; }
.ProseMirror h2 { font-size: 1.5em; }
.ProseMirror h3 { font-size: 1.25em; }

.ProseMirror blockquote {
  border-left: 4px solid var(--primary);
  padding-left: 16px;
  color: var(--text-secondary);
  font-style: italic;
  margin-left: 0;
}

.ProseMirror code {
  background: var(--bg-light);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.ProseMirror pre {
  background: var(--bg-light);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px;
  margin: 1em 0;
  overflow-x: auto;
}

.ProseMirror pre code {
  background: none;
  padding: 0;
}

.ProseMirror ul,
.ProseMirror ol {
  margin-left: 1.5em;
  margin-bottom: 1em;
}

.ProseMirror li {
  margin-bottom: 0.25em;
}

.ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 1em 0;
}

.ProseMirror table {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
}

.ProseMirror table td,
.ProseMirror table th {
  border: 1px solid var(--border);
  padding: 8px;
  text-align: left;
}

.ProseMirror table th {
  background: var(--bg-light);
  font-weight: 600;
}

/* Form buttons */
.form-actions {
  margin-top: 30px;
  display: flex;
  gap: 10px;
}

.btn-save,
.btn-cancel {
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
  font-weight: 500;
}

.btn-save {
  background: var(--success);
  color: white;
}

.btn-save:hover {
  background: #218838;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #5a6268;
}

/* Messages */
.message {
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: none;
  animation: slideDown 0.3s ease-out;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  display: block;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  display: block;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 20px;
  }

  #editor {
    min-height: 300px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-save,
  .btn-cancel {
    width: 100%;
  }
}
```

---

## Bước 10: Chạy ứng dụng

### 10.1 Cài đặt MongoDB (nếu chưa có)
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install -y mongodb

# Hoặc dùng MongoDB Atlas cloud
```

### 10.2 Chạy development
```bash
npm run dev
```

Truy cập `http://localhost:3000/admin/posts/create` để tạo bài viết.

### 10.3 Chạy production
```bash
npm run build
npm start
```

---

## Danh sách Extensions Free được dùng

| Extension | Mục đích |
|-----------|---------|
| StarterKit | Cơ bản (heading, paragraph, bold, italic, list, v.v.) |
| Link | Thêm/sửa liên kết |
| Image | Chèn hình ảnh |
| Youtube | Nhúng video Youtube |
| TextAlign | Căn trái/giữa/phải |
| TextStyle, FontFamily, FontSize | Font, size chữ |
| Color | Màu chữ |
| Highlight | Tô màu nền chữ |
| Underline | Gạch chân |
| Typography | Tự fix dấu nháy, gạch ngang |
| Table & variants | Tạo bảng |
| BubbleMenu, FloatingMenu | Menu tương tác |

---

## Lưu ý quan trọng

1. **MongoDB**: Đảm bảo MongoDB đang chạy trước khi start app. Hoặc cấu hình `MONGODB_URI` trong `.env`.

2. **EJS Template**: Sử dụng `<%- content %>` (với dấu gạch) để render HTML không bị escape.

3. **Body Parser**: Cấu hình `limit: '50mb'` để support HTML content lớn.

4. **CORS**: Được bật sẵn nếu frontend + backend cùng server không cần.

5. **Base64 Image**: Config `allowBase64: true` trong Image extension cho phép paste hình.

6. **Vite Build**: Tùy chọn, nếu muốn dùng Vite để bundle JS thêm vào.

---

## Cấu trúc API

| Method | URL | Mục đích |
|--------|-----|---------|
| GET | `/admin/posts/create` | Hiển thị form tạo |
| POST | `/admin/posts` | Lưu bài viết mới |
| GET | `/admin/posts/:id/edit` | Hiển thị form chỉnh sửa |
| POST | `/admin/posts/:id` | Cập nhật bài viết |
| GET | `/admin/posts` | Danh sách bài viết |

---

## Tài liệu tham khảo

- [Express Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [EJS Docs](https://ejs.co/)
- [Tiptap Docs](https://tiptap.dev/docs)

---

**Hoàn tất!** Bây giờ bạn có CMS đầy đủ với Tiptap + Node.js/Express + Vanilla JS.

