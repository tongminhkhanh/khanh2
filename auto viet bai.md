# Antigravity Agent Spec: Content Manager (Quản Lý Tin Tức & Nội Dung)

**Phiên bản:** 1.0  
**Ngày tạo:** 30/12/2025  
**Nền tảng:** Google Antigravity  
**Model cốt lõi:** Gemini 3 Pro (Multimodal)  
**Mục tiêu:** Tự động hóa 90% quy trình biên tập và đăng tải tin tức cho website trường học.

---

## 1. Tổng Quan Chức Năng (Feature Overview)

Agent này đóng vai trò như một **Thư ký tòa soạn ảo**, thực hiện chu trình khép kín từ lúc nhận dữ liệu thô đến khi tạo bản nháp trên CMS:

1.  **Tiếp nhận:** Đọc dữ liệu đầu vào đa dạng (text, hình ảnh, file ghi âm).
2.  **Sáng tạo:** Viết bài chuẩn SEO, văn phong sư phạm.
3.  **Thị giác máy tính (Vision):** Phân tích, chọn lọc và tạo chú thích ảnh.
4.  **Kiểm soát:** Kiểm tra chính tả, quy tắc an toàn thông tin (Nghị định 13).
5.  **Thực thi:** Tự động đăng nhập CMS và lưu bản nháp (Draft).

---

## 2. Kiến Trúc Hệ Thống (System Architecture)

### 2.1. Tech Stack
*   **Reasoning Engine:** Gemini 3 Pro (xử lý logic, sáng tạo nội dung, hiểu hình ảnh).
*   **Action Framework:** Antigravity Browser Agent (thao tác web tự động).
*   **Integration:**
    *   Input: Google Drive (folder "Tin bài mới") hoặc Webhook từ Zalo OA.
    *   Output: WordPress REST API hoặc Direct Browser Interaction.

### 2.2. Luồng Dữ Liệu (Data Flow)
graph TD
A[Giáo viên gửi ảnh/text thô] -->|Upload| B(Google Drive / Form)
B -->|Trigger| C{Antigravity Agent}
C -->|Gemini Vision| D[Phân tích & Chọn ảnh đẹp]
C -->|Gemini Text| E[Viết bài & Tạo Title/Sapo]
D & E --> F[Kiểm duyệt An toàn & Pháp lý]
F -->|Pass| G[Browser Action: Đăng nhập Admin]
G --> H[Tạo bài viết nháp - Draft]
H --> I[Gửi thông báo duyệt cho Hiệu trưởng]

---

## 3. Cấu Hình Prompt (System Instructions)

Dưới đây là `System Prompt` tối ưu hóa cho Antigravity để định hình hành vi (Persona) của Agent.

### 3.1. Role Definition
> "Bạn là AI Content Editor chuyên nghiệp của Trường [Tên Trường]. Nhiệm vụ của bạn là chuyển hóa các ghi chú thô sơ thành các bài báo cáo, tin tức trang trọng, ấm áp và chuẩn mực sư phạm. Bạn tuân thủ tuyệt đối các quy tắc về bảo mật thông tin trẻ em."

### 3.2. Content Generation Rules
*   **Tiêu đề:** Phải bắt đầu bằng động từ mạnh, hấp dẫn nhưng không giật gân (Clickbait).
    *   *Bad:* Thông báo về việc thi văn nghệ.
    *   *Good:* Sôi nổi Hội thi "Giai điệu Tuổi hồng": Lớp 5A xuất sắc giành giải Nhất.
*   **Cấu trúc:** Sapo (5W) -> Thân bài (Diễn biến) -> Kết luận (Ý nghĩa).
*   **Văn phong:** Tiếng Việt phổ thông, trong sáng. Không dùng từ lóng. Xưng hô "Nhà trường", "Các con", "Quý phụ huynh".

### 3.3. Image Processing Rules (Gemini Vision)
*   **Input:** Nhận 5-10 ảnh từ người dùng.
*   **Logic chọn ảnh:**
    *   Loại bỏ: Ảnh mờ, rung, thiếu sáng, ảnh chụp lưng, ảnh có hành vi không chuẩn mực.
    *   Ưu tiên: Ảnh tập thể vui vẻ, ảnh cận cảnh hoạt động, ảnh rõ mặt.
*   **Captioning:** Tự động tạo `alt-text` mô tả chi tiết cho từng ảnh (VD: "Học sinh lớp 1B đang thực hành trồng cây trong giờ Hoạt động trải nghiệm").

### 3.4. Safety Guardrails (Nghị định 13/2023/NĐ-CP)
*   Tự động làm mờ (nếu có công cụ xử lý ảnh) hoặc cảnh báo nếu ảnh chứa thông tin nhạy cảm: Số điện thoại cá nhân, địa chỉ nhà riêng, CCCD/Mã định danh.
*   Nếu nội dung đầu vào mang tính tiêu cực, khiếu nại -> **DỪNG LẠI** và gửi cảnh báo cho Admin, không tự ý viết bài.

---

## 4. Kịch Bản Tự Động Hóa (Automation Script Plan)

Dành cho module `Browser Agent` của Antigravity để thao tác trên CMS (ví dụ WordPress).

task_name: publish_draft_article
variables:

cms_url: "https://truongmuongla.edu.vn/wp-admin"

username: "ai_agent_editor"

password: "${ENV_CMS_PASSWORD}"

steps:

navigation:
action: goto
url: "${cms_url}"

authentication:
action: fill_form
fields:
user_login: "${username}"
user_pass: "${password}"
submit: true

create_post:
action: click
selector: "#menu-posts .wp-menu-name" # Click menu Bài viết
next_action: click
selector: ".page-title-action" # Click Viết bài mới

input_content:
action: type
selector: ".editor-post-title__input"
value: "${GENERATED_TITLE}"

action: type
selector: ".block-editor-default-block-appender__content"
value: "${GENERATED_CONTENT}"

set_metadata:
action: select_category
value: "${DETECTED_CATEGORY}" # VD: Tin tức, Hoạt động

action: add_tags
values: "${GENERATED_TAGS}"

finish:
action: click
selector: ".editor-post-save-draft" # Chỉ lưu nháp
wait_for: "Saved"

---

## 5. Quy Trình Triển Khai (Implementation Steps)

1.  **Huấn luyện (Training):**
    *   Thu thập 20 bài viết mẫu xuất sắc nhất của trường trong quá khứ.
    *   Upload vào Antigravity Knowledge Base để AI học giọng văn (Fine-tuning/Few-shot learning).
2.  **Kết nối (Integration):**
    *   Tạo tài khoản "Editor" riêng cho AI trên website (hạn chế quyền chỉ được viết, không được xóa/sửa hệ thống).
3.  **Kiểm thử (Testing):**
    *   Chạy thử với 5 kịch bản: Tin sự kiện vui, Tin thông báo học phí, Tin buồn (nếu có), Tin có ảnh chất lượng kém (để test bộ lọc).

## 6. Mở Rộng Tương Lai (Future Enhancements)
*   **Tự động dịch:** Tạo thêm phiên bản tiếng Anh cho bài viết (nếu trường hướng tới chuẩn quốc tế).
*   **Video Highlight:** Dùng Gemini để cắt ghép các đoạn video ngắn gửi kèm thành một clip tổng kết 30s.
