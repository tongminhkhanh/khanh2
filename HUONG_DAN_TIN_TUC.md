# 📖 Hướng Dẫn Tích Hợp Section "Tiêu Điểm & Tin Tức Chạy Dọc"

**Tài liệu này cung cấp hướng dẫn chi tiết từng bước để thêm module tin tức nổi bật vào website trường tiểu học của bạn.**

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Cài Đặt CSS Animation](#cài-đặt-css-animation)
3. [Cấu Trúc HTML](#cấu-trúc-html)
4. [Lưu Ý Kỹ Thuật](#lưu-ý-kỹ-thuật)
5. [Tùy Chỉnh & Nâng Cao](#tùy-chỉnh--nâng-cao)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Tổng Quan

Section tin tức này được thiết kế theo mô hình **2 cột**:

| Phần | Nội Dung | Chiều Rộng |
|------|---------|-----------|
| **Cột Trái** | Tin tiêu điểm lớn với hình ảnh chất lượng cao | 2/3 |
| **Cột Phải** | Thông điệp nhà trường + Danh sách tin chạy dọc | 1/3 |

### Tính Năng Chính:
- ✅ **Animation Cuộn Dọc**: Danh sách tin tự động cuộn từ dưới lên
- ✅ **Pause on Hover**: Dừng cuộn khi rê chuột vào để người dùng đọc/click
- ✅ **Responsive**: Thích ứng tự động với màn hình nhỏ (mobile)
- ✅ **Loop Không Bị Giật**: Sử dụng kỹ thuật duplicate danh sách để tạo hiệu ứng vòng lặp mượt mà

---

## 🛠️ Cài Đặt CSS Animation

### Bước 1: Tìm thẻ `<style>` trong file HTML

Mở file `code.html` hoặc file CSS chính của bạn, tìm thẻ `<style>...</style>`.

### Bước 2: Thêm đoạn CSS sau

Chèn đoạn mã dưới đây vào **cuối cùng** của thẻ `<style>` (trước `</style>`):

```css
/* ========== ANIMATION TIN TỨC CHẠY DỌC ========== */

/* Keyframe định nghĩa animation cuộn dọc */
@keyframes vertical-scroll {
    0% { 
        transform: translateY(0); 
    }
    100% { 
        transform: translateY(-50%); 
        /* Dịch chuyển -50% vì danh sách tin sẽ được nhân đôi */
    }
}

/* Class áp dụng animation cho container tin tức */
.news-scroller {
    animation: vertical-scroll 25s linear infinite;
    /* Tốc độ: 25s (thay đổi con số để điều chỉnh tốc độ) */
    /* - 15s = chạy nhanh */
    /* - 25s = tốc độ vừa (khuyến nghị) */
    /* - 40s = chạy chậm */
}

/* Tạm dừng animation khi người dùng rê chuột vào */
.news-scroller:hover {
    animation-play-state: paused;
    cursor: pointer;
}

/* ========== HẾT ANIMATION ========== */
```

---

## 💻 Cấu Trúc HTML

### Bước 1: Xác Định Vị Trí Chèn

Mở file `code.html` tìm vị trí muốn chèn section tin tức. Thường là:
- **Sau phần Hero Section** (khuyến nghị): Giữa Hero và Features
- **Trước CTA Banner**: Cuối trang trước phần "Sẵn Sàng..."

### Bước 2: Copy & Paste HTML

Chèn đoạn HTML **đầy đủ** dưới đây vào vị trí bạn muốn:

```html
<!-- ========== BẮT ĐẦU KHỐI TIN TỨC ========== -->
<section class="container mx-auto px-4 py-8">
    <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-4">
        
        <!-- Grid Layout: Chia 3 cột (Mobile: 1 cột / Desktop: 3 cột) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- === CỘT TRÁI (2/3): TIN TIÊU ĐIỂM LỚN === -->
            <div class="lg:col-span-2 relative group overflow-hidden rounded-xl h-[450px]">
                <a href="#link-bai-viet" class="block h-full w-full">
                    <!-- Ảnh đại diện tin lớn -->
                    <img src="https://picsum.photos/800/600" 
                         alt="Ảnh tin nổi bật" 
                         class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                    
                    <!-- Lớp phủ Gradient & Nội dung -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                        <span class="bg-[#2b8cee] text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3 uppercase tracking-wider shadow-sm">
                            Sự Kiện Nổi Bật
                        </span>
                        <h2 class="text-white text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-2 group-hover:text-[#2b8cee] transition-colors">
                            Mường La: Sôi nổi Hội thi An toàn giao thông trường học năm 2025
                        </h2>
                        <div class="flex items-center text-gray-300 text-xs md:text-sm gap-4 mt-2">
                            <span class="flex items-center gap-1">📅 20/12/2025</span>
                            <span class="flex items-center gap-1">👁️ 1,234 lượt xem</span>
                        </div>
                    </div>
                </a>
            </div>

            <!-- === CỘL PHẢI (1/3): THÔNG ĐIỆP & TIN CHẠY === -->
            <div class="lg:col-span-1 flex flex-col h-[450px]">
                
                <!-- A. Thông Điệp Nhà Trường (Phần Tĩnh) -->
                <div class="mb-4 pb-4 border-b border-gray-200">
                    <h3 class="text-xl font-bold text-[#0d141b] mb-3 flex items-center gap-2">
                        <span class="w-1.5 h-6 bg-[#2b8cee] rounded-sm"></span>
                        Thông điệp nhà trường
                    </h3>
                    <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-[#2b8cee]">
                        <p class="text-[#4c739a] italic text-sm leading-relaxed font-medium">
                            "Học để biết, học để làm, học để chung sống, học để tự khẳng định mình."
                        </p>
                        <div class="mt-2 text-right">
                            <span class="text-xs text-[#2b8cee] font-bold uppercase tracking-wide">-- Ban Giám Hiệu --</span>
                        </div>
                    </div>
                </div>

                <!-- B. Tin Tức Chạy Dọc (Phần Động) -->
                <div class="flex-1 overflow-hidden relative rounded-lg border border-gray-100 bg-gray-50/50">
                    <!-- Wrapper chứa animation -->
                    <div class="news-scroller p-2 space-y-3">
                        
                        <!-- === NHÓM TIN GỐC (Nhập danh sách tin lần 1) === -->
                        
                        <!-- Tin 1 -->
                        <article class="flex gap-3 items-start bg-white p-2.5 rounded-lg shadow-sm hover:shadow-md transition group cursor-pointer border border-transparent hover:border-blue-100">
                            <div class="w-20 h-14 shrink-0 overflow-hidden rounded-md">
                                <img src="https://picsum.photos/100/100?random=1" 
                                     class="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                                     alt="Thumbnail">
                            </div>
                            <div>
                                <h4 class="text-sm font-semibold text-[#0d141b] line-clamp-2 leading-snug group-hover:text-[#2b8cee] transition">
                                    <a href="#">Hành trình về nguồn: Tiếp lửa truyền thống - Vững bước tương lai</a>
                                </h4>
                                <span class="text-[10px] text-gray-400 mt-1 block">Tin tức • 2 giờ trước</span>
                            </div>
                        </article>

                        <!-- Tin 2 -->
                        <article class="flex gap-3 items-start bg-white p-2.5 rounded-lg shadow-sm hover:shadow-md transition group cursor-pointer border border-transparent hover:border-blue-100">
                            <div class="w-20 h-14 shrink-0 overflow-hidden rounded-md">
                                <img src="https://picsum.photos/100/100?random=2" 
                                     class="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                                     alt="Thumbnail">
                            </div>
                            <div>
                                <h4 class="text-sm font-semibold text-[#0d141b] line-clamp-2 leading-snug group-hover:text-[#2b8cee] transition">
                                    <a href="#">Khai mạc Hội thi Giáo viên dạy giỏi cấp xã năm học 2025</a>
                                </h4>
                                <span class="text-[10px] text-gray-400 mt-1 block">Sự kiện • 1 ngày trước</span>
                            </div>
                        </article>

                        <!-- Tin 3 -->
                        <article class="flex gap-3 items-start bg-white p-2.5 rounded-lg shadow-sm hover:shadow-md transition group cursor-pointer border border-transparent hover:border-blue-100">
                            <div class="w-20 h-14 shrink-0 overflow-hidden rounded-md">
                                <img src="https://picsum.photos/100/100?random=3" 
                                     class="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                                     alt="Thumbnail">
                            </div>
                            <div>
                                <h4 class="text-sm font-semibold text-[#0d141b] line-clamp-2 leading-snug group-hover:text-[#2b8cee] transition">
                                    <a href="#">Lễ kết nạp Đội viên mới đợt 1 năm học 2025-2026</a>
                                </h4>
                                <span class="text-[10px] text-gray-400 mt-1 block">Hoạt động • 2 ngày trước</span>
                            </div>
                        </article>

                        <!-- === NHÓM TIN DUPLICATE (Copy y hệt 3 tin trên để loop không bị giật) === -->
                        <!-- ⚠️ QUAN TRỌNG: Phần này phải GIỐNG HỆT phần trên ⚠️ -->
                        
                        <!-- Copy Tin 1 -->
                        <article class="flex gap-3 items-start bg-white p-2.5 rounded-lg shadow-sm hover:shadow-md transition group cursor-pointer border border-transparent hover:border-blue-100">
                            <div class="w-20 h-14 shrink-0 overflow-hidden rounded-md">
                                <img src="https://picsum.photos/100/100?random=1" 
                                     class="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                                     alt="Thumbnail">
                            </div>
                            <div>
                                <h4 class="text-sm font-semibold text-[#0d141b] line-clamp-2 leading-snug group-hover:text-[#2b8cee] transition">
                                    <a href="#">Hành trình về nguồn: Tiếp lửa truyền thống - Vững bước tương lai</a>
                                </h4>
                                <span class="text-[10px] text-gray-400 mt-1 block">Tin tức • 2 giờ trước</span>
                            </div>
                        </article>

                        <!-- Copy Tin 2 -->
                        <article class="flex gap-3 items-start bg-white p-2.5 rounded-lg shadow-sm hover:shadow-md transition group cursor-pointer border border-transparent hover:border-blue-100">
                            <div class="w-20 h-14 shrink-0 overflow-hidden rounded-md">
                                <img src="https://picsum.photos/100/100?random=2" 
                                     class="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                                     alt="Thumbnail">
                            </div>
                            <div>
                                <h4 class="text-sm font-semibold text-[#0d141b] line-clamp-2 leading-snug group-hover:text-[#2b8cee] transition">
                                    <a href="#">Khai mạc Hội thi Giáo viên dạy giỏi cấp xã năm học 2025</a>
                                </h4>
                                <span class="text-[10px] text-gray-400 mt-1 block">Sự kiện • 1 ngày trước</span>
                            </div>
                        </article>

                        <!-- Copy Tin 3 -->
                        <article class="flex gap-3 items-start bg-white p-2.5 rounded-lg shadow-sm hover:shadow-md transition group cursor-pointer border border-transparent hover:border-blue-100">
                            <div class="w-20 h-14 shrink-0 overflow-hidden rounded-md">
                                <img src="https://picsum.photos/100/100?random=3" 
                                     class="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                                     alt="Thumbnail">
                            </div>
                            <div>
                                <h4 class="text-sm font-semibold text-[#0d141b] line-clamp-2 leading-snug group-hover:text-[#2b8cee] transition">
                                    <a href="#">Lễ kết nạp Đội viên mới đợt 1 năm học 2025-2026</a>
                                </h4>
                                <span class="text-[10px] text-gray-400 mt-1 block">Hoạt động • 2 ngày trước</span>
                            </div>
                        </article>

                    </div>
                </div>

                <!-- Footer: Link xem thêm -->
                <div class="mt-3 pt-2 border-t border-gray-100 flex justify-end">
                    <a href="#" class="inline-flex items-center gap-1 text-xs font-bold text-[#2b8cee] hover:text-[#1a6bb8] hover:bg-blue-50 px-3 py-1.5 rounded-full transition">
                        Xem tất cả tiêu điểm 
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </a>
                </div>

            </div>
        </div>
    </div>
</section>
<!-- ========== KẾT THÚC KHỐI TIN TỨC ========== -->
```

---

## 📌 Lưu Ý Kỹ Thuật

### 1. Nguyên Tắc Loop Vô Tận

**Vấn đề:** Nếu bạn chỉ có 3 tin tức [A, B, C] và animation chạy từ 0% đến -100%, khi hết danh sách sẽ có hiện tượng "giật cục" quay về 0%.

**Giải Pháp:** Nhân đôi danh sách thành [A, B, C, A, B, C]

- Animation chạy từ 0% → -50% (hết nhóm tin gốc)
- Giật về 0% (không thấy vì nhóm duplicate giống nhóm gốc)
- Tiếp tục chạy từ 0% → -50% (hết nhóm tin duplicate)
- Lặp vô tận...

### 2. Số Lượng Tin Tức

- **Tối thiểu:** 3 tin (để loop mượt)
- **Khuyến khích:** 5-8 tin (tạo trải nghiệm tốt hơn)
- **Tối đa:** 10+ tin (tùy độ cao của box, không quá chặt)

### 3. Responsive Design

Tailwind class `grid-cols-1 lg:grid-cols-3` đảm bảo:
- **Trên Mobile:** 2 cột xếp chồng (stack vertical) tự động
- **Trên Desktop:** Giữ nguyên layout 2 cột

---

## 🎨 Tùy Chỉnh & Nâng Cao

### A. Điều Chỉnh Tốc Độ Cuộn

Trong CSS animation, tìm dòng:
```css
animation: vertical-scroll 25s linear infinite;
```

Thay số `25` bằng:
- `15s` = Chạy nhanh (1.67 tin/giây)
- `20s` = Chạy vừa (1.25 tin/giây)
- `25s` = Chạy chậm (1 tin/giây) - **Khuyến khích**
- `30s` = Chạy rất chậm (0.83 tin/giây)

### B. Thay Đổi Màu Sắc

Tất cả màu xanh dương chính (`#2b8cee`) có thể thay bằng:
- `#FF6B6B` (Đỏ)
- `#4ECDC4` (Cyan)
- `#95E1D3` (Mint)

Dùng **Find & Replace** (Ctrl+H hoặc Cmd+H):
- Find: `#2b8cee`
- Replace: `[Mã màu mới]`

### C. Kết Nối với Database/API

Nếu tin tức lấy từ server, thay vì copy HTML thủ công, bạn có thể dùng:

**PHP/Laravel:**
```php
<div class="news-scroller p-2 space-y-3">
    @foreach($articles as $article)
        <!-- HTML tin tức -->
        <article>...</article>
    @endforeach
    
    <!-- Nhân đôi danh sách -->
    @foreach($articles as $article)
        <article>...</article>
    @endforeach
</div>
```

**Node.js/EJS:**
```ejs
<div class="news-scroller p-2 space-y-3">
    <% articles.forEach(article => { %>
        <article>...</article>
    <% }); %>
    
    <% articles.forEach(article => { %>
        <article>...</article>
    <% }); %>
</div>
```

---

## 🐛 Troubleshooting

### P1: Animation không chạy
**Nguyên nhân:** CSS animation chưa được thêm vào file
**Cách fix:** Kiểm tra thẻ `<style>` có chứa `@keyframes vertical-scroll` không

### P2: Animation giật cục
**Nguyên nhân:** Danh sách tin chưa được nhân đôi
**Cách fix:** Copy toàn bộ 3 bài tin rồi paste lại 1 lần nữa bên dưới

### P3: Text bị cắt ở cuối dòng
**Nguyên nhân:** Class `line-clamp-2` giới hạn 2 dòng
**Cách fix:** Thay `line-clamp-2` thành `line-clamp-3` hoặc bỏ đi

### P4: Hình ảnh không hiển thị
**Nguyên nhân:** URL hình ảnh không hợp lệ
**Cách fix:** 
- Thay `https://picsum.photos/...` bằng URL hình ảnh thực của bạn
- Hoặc upload hình lên hosting rồi link tới

### P5: Animation bị chậm trên mobile
**Nguyên nhân:** Thiết bị yếu hoặc quá nhiều animation cùng lúc
**Cách fix:** 
- Giảm số tin từ 6 xuống 3
- Tăng thời gian animation từ 20s lên 30s

---

## ✅ Checklist Hoàn Thành

Trước khi đưa vào production, kiểm tra:

- [ ] CSS animation đã được thêm vào thẻ `<style>`
- [ ] HTML section đã được chèn vào vị trí đúng
- [ ] Danh sách tin được nhân đôi (6 articles total)
- [ ] Hình ảnh tin tức đã update URL thực
- [ ] Liên kết tin tức (`href="#"`) đã được update
- [ ] Kiểm tra trên mobile xem layout có OK không
- [ ] Kiểm tra animation có chạy mượt không
- [ ] Pause on hover có hoạt động không

---

## 📞 Hỗ Trợ Thêm

Nếu gặp vấn đề, bạn có thể:

1. **Kiểm tra Console:** Mở DevTools (F12) → Console → Có lỗi gì không?
2. **Thử Inspect:** Right-click → Inspect → Kiểm tra class & CSS có áp dụng không
3. **Test Responsive:** Sử dụng DevTools responsive mode (Ctrl+Shift+M)

---

**Hoàn thành! 🎉 Bây giờ trang chủ của bạn đã có một module tin tức chuyên nghiệp và sinh động.**

**Ngày cập nhật:** 21/12/2025  
**Phiên bản:** 1.0  
**Dành cho:** Trường Tiểu Học (Tailwind CSS)
