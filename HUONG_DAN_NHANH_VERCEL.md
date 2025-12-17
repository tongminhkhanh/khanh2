# 🚀 Hướng dẫn Đưa Website Lên Online (Cách Nhanh Nhất)

Do máy tính của bạn chưa cài đặt Git, chúng ta sẽ sử dụng **Vercel** để đưa website lên online trực tiếp. Cách này rất đơn giản và không cần cấu hình phức tạp.

## ✅ Bước 1: Chuẩn bị Database (Quan trọng)

Trước khi đưa code lên, bạn cần có một nơi lưu trữ dữ liệu (Database) trên mạng.

1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) và đăng ký tài khoản miễn phí.
2. Tạo một **Cluster** miễn phí (chọn gói Shared/Free).
3. Vào mục **Database Access** -> Tạo user mới (nhớ Username và Password).
4. Vào mục **Network Access** -> Thêm IP `0.0.0.0/0` (Allow Access from Anywhere).
5. Lấy **Connection String**:
   - Bấm **Connect** -> **Drivers**.
   - Copy chuỗi kết nối, ví dụ: `mongodb+srv://admin:password@cluster0.mongodb.net/...`
   - Thay `password` bằng mật khẩu bạn vừa tạo.

## 🚀 Bước 2: Đưa Website Lên Vercel

1. Mở Terminal (PowerShell) tại thư mục dự án `khanh1`.
2. Chạy lệnh sau:
   ```bash
   npx vercel
   ```
3. Làm theo hướng dẫn trên màn hình:
   - **Log in to Vercel**: Bấm Enter, trình duyệt sẽ mở ra để bạn đăng nhập (chọn Continue with Email hoặc GitHub/Google).
   - **Set up and deploy?**: Nhập `y` (Yes).
   - **Which scope?**: Bấm Enter (chọn mặc định).
   - **Link to existing project?**: Nhập `n` (No).
   - **Project name**: Bấm Enter (để mặc định `khanh1`).
   - **In which directory?**: Bấm Enter (để mặc định `./`).
   - **Want to modify these settings?**: Nhập `n` (No).

4. Đợi một chút, Vercel sẽ upload code và cài đặt.

## ⚙️ Bước 3: Cấu hình Biến Môi Trường

Sau khi deploy xong, website có thể chưa chạy được ngay vì thiếu kết nối Database.

1. Truy cập Dashboard của dự án trên [Vercel.com](https://vercel.com).
2. Vào tab **Settings** -> **Environment Variables**.
3. Thêm các biến sau (giống trong file `.env` của bạn):
   - **Key**: `MONGODB_URI` | **Value**: (Chuỗi kết nối MongoDB bạn lấy ở Bước 1)
   - **Key**: `JWT_SECRET` | **Value**: (Nhập một chuỗi bảo mật bất kỳ)
   - **Key**: `NODE_ENV` | **Value**: `production`

4. Sau khi thêm xong, quay lại tab **Deployments**.
5. Bấm vào dấu 3 chấm ở lần deploy gần nhất -> **Redeploy**.

## 🎉 Hoàn tất!

Sau khi Redeploy xong, Vercel sẽ cung cấp cho bạn một đường link (ví dụ: `khanh1.vercel.app`). Đó chính là địa chỉ website online của bạn!
