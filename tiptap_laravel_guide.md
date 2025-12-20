# Hướng dẫn Tích hợp Tiptap vào CMS Laravel + Vanilla JS

## Mục tiêu
Tạo editor Tiptap trong Laravel Blade template với Vanilla JS, đầy đủ tính năng: font chữ, cỡ chữ, màu sắc, chèn Youtube, bảng, v.v. sử dụng các extension **free**.

---

## Cấu trúc thư mục Laravel

```
laravel-cms/
├── app/
│   ├── Http/Controllers/
│   │   └── PostController.php
│   └── Models/
│       └── Post.php
├── resources/
│   ├── views/
│   │   ├── layouts/
│   │   │   └── app.blade.php
│   │   └── posts/
│   │       ├── create.blade.php
│   │       └── edit.blade.php
│   └── js/
│       ├── app.js
│       └── editor.js
├── routes/
│   └── web.php
├── public/
│   ├── js/
│   │   └── app.js (build output)
│   └── css/
│       └── app.css (build output)
├── package.json
├── vite.config.js
└── composer.json
```

---

## Bước 1: Cài đặt dependencies

### 1.1 Cài đặt npm packages
```bash
npm install
npm install @tiptap/core @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-youtube @tiptap/extension-text-align @tiptap/extension-text-style @tiptap/extension-font-family @tiptap/extension-font-size @tiptap/extension-color @tiptap/extension-highlight @tiptap/extension-underline @tiptap/extension-typography @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell @tiptap/extension-bubble-menu @tiptap/extension-floating-menu
```

### 1.2 Kiểm tra package.json
Đảm bảo `package.json` có script sau:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "devDependencies": {
    "vite": "^latest",
    "laravel-vite-plugin": "^latest"
  }
}
```

---

## Bước 2: Cấu hình Vite cho Laravel

### 2.1 Cập nhật `vite.config.js`
```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.js'],
      refresh: true,
    }),
  ],
});
```

---

## Bước 3: Tạo Model và Migration

### 3.1 Tạo Post model + migration
```bash
php artisan make:model Post -m
```

### 3.2 Cập nhật migration `database/migrations/****_create_posts_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category');
            $table->longText('content');
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
```

### 3.3 Cập nhật `app/Models/Post.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'slug', 'category', 'content', 'status'];
}
```

### 3.4 Chạy migration
```bash
php artisan migrate
```

---

## Bước 4: Tạo Controller

### 4.1 Tạo `app/Http/Controllers/PostController.php`
```php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    public function create()
    {
        return view('posts.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'status' => 'required|in:draft,published',
            'content' => 'required|string',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        try {
            $post = Post::create($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Bài viết đã được lưu thành công!',
                'post' => $post,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function edit($id)
    {
        $post = Post::findOrFail($id);
        return view('posts.edit', compact('post'));
    }

    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'status' => 'required|in:draft,published',
            'content' => 'required|string',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        try {
            $post->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Bài viết đã được cập nhật!',
                'post' => $post,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }
}
```

---

## Bước 5: Cấu hình Routes

### 5.1 Cập nhật `routes/web.php`
```php
<?php

use App\Http\Controllers\PostController;

Route::post('/admin/posts', [PostController::class, 'store'])->name('posts.store');
Route::post('/admin/posts/{id}', [PostController::class, 'update'])->name('posts.update');
Route::get('/admin/posts/create', [PostController::class, 'create'])->name('posts.create');
Route::get('/admin/posts/{id}/edit', [PostController::class, 'edit'])->name('posts.edit');
```

---

## Bước 6: Tạo Blade Template

### 6.1 Tạo `resources/views/layouts/app.blade.php`
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>@yield('title', 'CMS')</title>
  @vite(['resources/css/app.css', 'resources/js/app.js'])
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
    @yield('content')
  </div>
</body>
</html>
```

### 6.2 Tạo `resources/views/posts/create.blade.php`
```blade
@extends('layouts.app')

@section('title', 'Thêm bài viết mới')

@section('content')
  <h1>Thêm bài viết mới</h1>
  
  <div id="message" class="message"></div>

  <form id="post-form">
    @csrf
    
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
    window.postRoute = '{{ route("posts.store") }}';
  </script>
@endsection
```

### 6.3 Tạo `resources/views/posts/edit.blade.php`
```blade
@extends('layouts.app')

@section('title', 'Chỉnh sửa bài viết')

@section('content')
  <h1>Chỉnh sửa bài viết</h1>
  
  <div id="message" class="message"></div>

  <form id="post-form">
    @csrf
    
    <div class="form-group">
      <label for="title">Tiêu đề bài viết *</label>
      <input type="text" id="title" name="title" required placeholder="Nhập tiêu đề bài viết" value="{{ $post->title }}">
    </div>

    <div class="form-group">
      <label for="category">Danh mục *</label>
      <select id="category" name="category" required>
        <option value="">Chọn danh mục</option>
        <option value="tin-tuc" @if($post->category === 'tin-tuc') selected @endif>Tin tức</option>
        <option value="huong-dan" @if($post->category === 'huong-dan') selected @endif>Hướng dẫn</option>
        <option value="san-pham" @if($post->category === 'san-pham') selected @endif>Sản phẩm</option>
        <option value="tu-van" @if($post->category === 'tu-van') selected @endif>Tư vấn</option>
      </select>
    </div>

    <div class="form-group">
      <label for="status">Trạng thái *</label>
      <select id="status" name="status" required>
        <option value="draft" @if($post->status === 'draft') selected @endif>Nháp</option>
        <option value="published" @if($post->status === 'published') selected @endif>Xuất bản</option>
      </select>
    </div>

    <div class="form-group">
      <label for="editor">Nội dung bài viết *</label>
      <div id="editor">{!! $post->content !!}</div>
    </div>

    <input type="hidden" id="content-input" name="content" required value="{{ $post->content }}">

    <div class="form-actions">
      <button type="submit" class="btn-save">Cập nhật bài viết</button>
      <button type="reset" class="btn-cancel">Hủy</button>
    </div>
  </form>

  <script>
    window.formAction = 'update';
    window.postRoute = '{{ route("posts.update", $post->id) }}';
    window.postId = {{ $post->id }};
  </script>
@endsection
```

---

## Bước 7: Tạo JavaScript files

### 7.1 Tạo `resources/js/editor.js`
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

### 7.2 Tạo `resources/js/app.js`
```javascript
import { initEditor } from './editor.js';

document.addEventListener('DOMContentLoaded', () => {
  // Lấy nội dung hiện tại (nếu edit)
  const currentContent = document.querySelector('#content-input').value || '<p>Nhập nội dung bài viết…</p>';
  
  // Khởi tạo editor
  const editor = initEditor('editor', 'content-input', currentContent);
  window.editor = editor;

  // Xử lý submit form
  const form = document.querySelector('#post-form');
  const messageDiv = document.querySelector('#message');
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

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
        method: window.formAction === 'update' ? 'POST' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
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

### 7.3 Tạo `resources/css/app.css`
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

## Bước 8: Chạy development server

```bash
npm run dev
php artisan serve
```

Truy cập `http://localhost:8000/admin/posts/create` để tạo bài viết.

---

## Bước 9: Build cho production

```bash
npm run build
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

1. **CSRF Token**: Laravel yêu cầu CSRF token trong form. Đã thêm sẵn trong Blade template.

2. **API Response**: Controller trả về JSON với `success` và `message` để handle trên JS.

3. **Database**: Đảm bảo chạy `php artisan migrate` trước khi test.

4. **Routes**: Thêm routes vào `routes/web.php` để POST/GET hoạt động.

5. **CSS/JS**: Được load từ Vite, nên chạy `npm run dev` trong development.

6. **Base64 Image**: Để chèn hình từ clipboard hoặc upload, cần thêm handler JS riêng (tùy chỉnh).

---

## Tài liệu tham khảo

- [Tiptap Docs](https://tiptap.dev/docs)
- [Laravel Docs](https://laravel.com/docs)
- [Vite + Laravel](https://vitejs.dev/guide/ssr.html)

---

**Hoàn tất!** Bây giờ bạn có CMS đầy đủ với Tiptap + Laravel + Vanilla JS.

