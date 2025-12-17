# 📚 HƯỚNG DẪN ĐƯA WEBSITE LÊN ONLINE

> Tài liệu hướng dẫn chi tiết cách deploy website trường học lên môi trường production.

---

## 📋 Mục Lục

1. [Tổng quan về Project](#1-tổng-quan-về-project)
2. [Các phương thức Deploy](#2-các-phương-thức-deploy)
3. [Phương thức 1: Railway (Khuyên dùng - Miễn phí)](#3-phương-thức-1-railway-khuyên-dùng---miễn-phí)
4. [Phương thức 2: Render (Miễn phí)](#4-phương-thức-2-render-miễn-phí)
5. [Phương thức 3: Vercel + MongoDB Atlas](#5-phương-thức-3-vercel--mongodb-atlas)
6. [Phương thức 4: VPS (DigitalOcean/Vultr)](#6-phương-thức-4-vps-digitaloceanvultr)
7. [Cấu hình MongoDB Atlas (Cơ sở dữ liệu Cloud)](#7-cấu-hình-mongodb-atlas-cơ-sở-dữ-liệu-cloud)
8. [Cấu hình Domain (Tên miền)](#8-cấu-hình-domain-tên-miền)
9. [Các bước bảo mật quan trọng](#9-các-bước-bảo-mật-quan-trọng)
10. [Xử lý sự cố](#10-xử-lý-sự-cố)

---

## 1. Tổng quan về Project

### 📦 Thông tin kỹ thuật:
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Port**: 3000 (mặc định)
- **Files chính**:
  - `server.js` - File server chính
  - `code.html` - Trang chủ
  - `admin.html` - Trang quản trị
  - `.env` - Biến môi trường

### 🔧 Yêu cầu:
- Node.js 18+ 
- MongoDB database
- Domain name (tùy chọn)

---

## 2. Các phương thức Deploy

| Phương thức | Miễn phí | Độ khó | Phù hợp với |
|-------------|----------|--------|-------------|
| Railway | ✅ (có giới hạn) | ⭐ Dễ | Mới bắt đầu |
| Render | ✅ (có giới hạn) | ⭐ Dễ | Mới bắt đầu |
| Vercel | ✅ | ⭐⭐ Trung bình | Frontend tĩnh |
| VPS | ❌ (~$5/tháng) | ⭐⭐⭐ Khó | Chuyên nghiệp |

---

## 3. Phương thức 1: Railway (Khuyên dùng - Miễn phí)

Railway là platform đơn giản nhất để deploy Node.js app.

### Bước 1: Chuẩn bị code trên GitHub

1. **Tạo tài khoản GitHub** (nếu chưa có): https://github.com
2. **Tạo repository mới**:
   - Click **"New repository"**
   - Đặt tên: `school-website`
   - Chọn **Private** (riêng tư)
   - Click **Create repository**

3. **Push code lên GitHub**:
   ```bash
   # Mở Terminal/PowerShell tại thư mục project
   cd "c:\Users\Lenovo\OneDrive\Desktop\khanh1"
   
   # Khởi tạo Git
   git init
   
   # Tạo file .gitignore
   echo "node_modules/" > .gitignore
   echo ".env" >> .gitignore
   echo "uploads/" >> .gitignore
   
   # Thêm tất cả files
   git add .
   
   # Commit
   git commit -m "Initial commit"
   
   # Kết nối với GitHub (thay YOUR_USERNAME bằng username của bạn)
   git remote add origin https://github.com/YOUR_USERNAME/school-website.git
   
   # Push code
   git branch -M main
   git push -u origin main
   ```

### Bước 2: Đăng ký Railway

1. Truy cập: https://railway.app
2. Click **"Login"** → **"Login with GitHub"**
3. Cho phép Railway truy cập GitHub

### Bước 3: Tạo Project mới

1. Click **"New Project"**
2. Chọn **"Deploy from GitHub repo"**
3. Chọn repository `school-website`
4. Railway sẽ tự động detect Node.js project

### Bước 4: Thêm MongoDB Database

1. Trong project, click **"New"** → **"Database"** → **"Add MongoDB"**
2. Railway sẽ tạo MongoDB instance miễn phí
3. Click vào MongoDB service → tab **"Variables"**
4. Copy giá trị **MONGO_URL**

### Bước 5: Cấu hình Environment Variables

1. Click vào service Node.js của bạn
2. Vào tab **"Variables"**
3. Thêm các biến sau:

```
MONGODB_URI = <paste MONGO_URL từ bước 4>
JWT_SECRET = mot_khoa_bi_mat_rat_dai_va_phuc_tap_123!@#
PORT = 3000
NODE_ENV = production
```

### Bước 6: Deploy

1. Railway sẽ tự động deploy khi có thay đổi
2. Đợi 2-3 phút để build hoàn tất
3. Click **"Settings"** → **"Generate Domain"**
4. Bạn sẽ có link như: `school-website-production.up.railway.app`

### ✅ Hoàn tất! 
Website đã online tại domain được cấp.

---

## 4. Phương thức 2: Render (Miễn phí)

### Bước 1: Chuẩn bị (giống Railway)
- Push code lên GitHub như hướng dẫn ở trên

### Bước 2: Đăng ký Render

1. Truy cập: https://render.com
2. Click **"Get Started for Free"**
3. Đăng ký bằng GitHub

### Bước 3: Tạo Web Service

1. Dashboard → **"New +"** → **"Web Service"**
2. Connect repository từ GitHub
3. Cấu hình:
   - **Name**: `school-website`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Bước 4: Thêm MongoDB (dùng MongoDB Atlas)

- Xem [Phần 7: Cấu hình MongoDB Atlas](#7-cấu-hình-mongodb-atlas-cơ-sở-dữ-liệu-cloud)

### Bước 5: Thêm Environment Variables

Vào **Environment** → thêm:
```
MONGODB_URI = mongodb+srv://...  (từ MongoDB Atlas)
JWT_SECRET = khoa_bi_mat_cua_ban_123
NODE_ENV = production
```

### Bước 6: Deploy

1. Click **"Create Web Service"**
2. Đợi 5-10 phút để build
3. Website sẽ có URL: `school-website.onrender.com`

> ⚠️ **Lưu ý**: Render free tier sẽ sleep sau 15 phút không hoạt động. Lần truy cập đầu có thể mất 30s-1 phút để "wake up".

---

## 5. Phương thức 3: Vercel + MongoDB Atlas

> ⚠️ Vercel phù hợp hơn với các serverless function. Với full Node.js app như này, khuyên dùng Railway hoặc Render.

### Nếu vẫn muốn dùng Vercel:

1. Cần chuyển đổi `server.js` thành serverless functions
2. Tạo file `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

3. Deploy:
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 6. Phương thức 4: VPS (DigitalOcean/Vultr)

Phương pháp này dành cho người có kinh nghiệm về Linux và server management.

### Bước 1: Thuê VPS

1. **DigitalOcean**: https://digitalocean.com (~$5/tháng)
2. **Vultr**: https://vultr.com (~$5/tháng)
3. **Linode**: https://linode.com (~$5/tháng)

Chọn:
- **OS**: Ubuntu 22.04 LTS
- **Plan**: Basic 1GB RAM, 1 CPU
- **Region**: Singapore (gần Việt Nam)

### Bước 2: Kết nối SSH

```bash
ssh root@YOUR_SERVER_IP
```

### Bước 3: Cài đặt Node.js

```bash
# Cập nhật hệ thống
apt update && apt upgrade -y

# Cài Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Kiểm tra
node -v
npm -v
```

### Bước 4: Cài đặt MongoDB

```bash
# Import MongoDB public GPG Key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Thêm repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Cài đặt
apt update
apt install -y mongodb-org

# Khởi động
systemctl start mongod
systemctl enable mongod
```

### Bước 5: Clone và cấu hình project

```bash
# Cài Git
apt install git -y

# Clone project
cd /var/www
git clone https://github.com/YOUR_USERNAME/school-website.git
cd school-website

# Cài dependencies
npm install

# Tạo file .env
nano .env
```

Thêm nội dung:
```
MONGODB_URI=mongodb://localhost:27017/school-news
JWT_SECRET=khoa_bi_mat_rat_dai_va_an_toan
PORT=3000
NODE_ENV=production
```

### Bước 6: Cài đặt PM2 (Process Manager)

```bash
# Cài PM2
npm install -g pm2

# Khởi động app
pm2 start server.js --name "school-website"

# Tự động khởi động khi reboot
pm2 startup
pm2 save
```

### Bước 7: Cài đặt Nginx (Reverse Proxy)

```bash
apt install nginx -y

# Cấu hình Nginx
nano /etc/nginx/sites-available/school-website
```

Thêm nội dung:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Xử lý file upload
    client_max_body_size 50M;
}
```

Kích hoạt:
```bash
ln -s /etc/nginx/sites-available/school-website /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Bước 8: Cài SSL (HTTPS) với Let's Encrypt

```bash
apt install certbot python3-certbot-nginx -y

certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 7. Cấu hình MongoDB Atlas (Cơ sở dữ liệu Cloud)

MongoDB Atlas cung cấp database miễn phí trên cloud.

### Bước 1: Đăng ký

1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"**
3. Đăng ký tài khoản

### Bước 2: Tạo Cluster

1. Click **"Build a Database"**
2. Chọn **"FREE - M0"** (miễn phí)
3. Chọn provider: **AWS**
4. Chọn region: **Singapore** (gần VN)
5. Đặt tên Cluster: `school-cluster`
6. Click **"Create"**

### Bước 3: Tạo Database User

1. Vào **"Database Access"** (sidebar)
2. Click **"Add New Database User"**
3. Authentication: **Password**
4. Username: `schooladmin`
5. Password: Tạo password mạnh (lưu lại!)
6. Database User Privileges: **Read and write to any database**
7. Click **"Add User"**

### Bước 4: Cấu hình Network Access

1. Vào **"Network Access"** (sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   > ⚠️ Chỉ dùng cho development/testing. Production nên restrict IP.
4. Click **"Confirm"**

### Bước 5: Lấy Connection String

1. Quay lại **"Database"**
2. Click **"Connect"** trên cluster
3. Chọn **"Connect your application"**
4. Copy connection string:

```
mongodb+srv://schooladmin:<password>@school-cluster.xxxxx.mongodb.net/school-news?retryWrites=true&w=majority
```

5. Thay `<password>` bằng password đã tạo

### Bước 6: Sử dụng

Thay giá trị `MONGODB_URI` trong file `.env` hoặc environment variables của hosting:

```
MONGODB_URI=mongodb+srv://schooladmin:YOUR_PASSWORD@school-cluster.xxxxx.mongodb.net/school-news?retryWrites=true&w=majority
```

---

## 8. Cấu hình Domain (Tên miền)

### Các nhà cung cấp domain phổ biến:

| Nhà cung cấp | Giá (.com) | Ưu điểm |
|--------------|------------|---------|
| Namecheap | ~$10/năm | Rẻ, dễ dùng |
| Google Domains | ~$12/năm | Ổn định |
| P.A Vietnam | ~250k/năm | Hỗ trợ tiếng Việt |
| Tenten.vn | ~200k/năm | Hỗ trợ tiếng Việt |

### Cấu hình DNS:

#### Với Railway:
1. Vào Railway → Settings → Domains
2. Thêm custom domain: `www.your-domain.com`
3. Railway sẽ hiển thị CNAME record
4. Vào DNS của domain → thêm record:
   - Type: **CNAME**
   - Name: **www**
   - Value: `xxx.railway.app`

#### Với VPS:
1. Vào DNS management của domain
2. Thêm record:
   - Type: **A**
   - Name: **@** (hoặc để trống)
   - Value: **IP của VPS**
   - 
   - Type: **A**
   - Name: **www**
   - Value: **IP của VPS**

---

## 9. Các bước bảo mật quan trọng

### ✅ Checklist bắt buộc trước khi go-live:

#### 1. Đổi JWT Secret
```env
# KHÔNG dùng giá trị mặc định!
JWT_SECRET=mot_chuoi_rat_dai_va_ngau_nhien_khong_ai_doan_duoc_abc123xyz789!@#
```

Tạo secret mạnh:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 2. Cập nhật CORS (nếu cần)
Trong `server.js`, thay:
```javascript
app.use(cors());
```

Thành:
```javascript
app.use(cors({
    origin: ['https://your-domain.com', 'https://www.your-domain.com'],
    credentials: true
}));
```

#### 3. Sử dụng HTTPS
- Railway/Render: Tự động có HTTPS
- VPS: Dùng Let's Encrypt (đã hướng dẫn ở trên)

#### 4. Rate Limiting
Thêm vào `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100 // Giới hạn 100 request mỗi IP
});

app.use('/api/', limiter);
```

Cài package:
```bash
npm install express-rate-limit
```

#### 5. Helmet (Security Headers)
```bash
npm install helmet
```

Thêm vào `server.js`:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

#### 6. Tạo admin account mới
Sau khi deploy, đăng ký tài khoản admin đầu tiên qua API hoặc website.

---

## 10. Xử lý sự cố

### ❌ Lỗi: "Cannot connect to MongoDB"

**Nguyên nhân**: Connection string sai hoặc IP chưa được whitelist

**Giải pháp**:
1. Kiểm tra `MONGODB_URI` trong environment variables
2. Đảm bảo đã allow IP trong MongoDB Atlas Network Access
3. Kiểm tra password không chứa ký tự đặc biệt (hoặc URL encode)

### ❌ Lỗi: "Port already in use"

**Nguyên nhân**: Có process khác đang dùng port

**Giải pháp (Linux)**:
```bash
lsof -i :3000
kill -9 <PID>
```

### ❌ Lỗi: "Module not found"

**Nguyên nhân**: Dependencies chưa được cài

**Giải pháp**:
```bash
rm -rf node_modules
npm install
```

### ❌ Upload file không hoạt động

**Nguyên nhân**: Thư mục uploads không có quyền ghi

**Giải pháp**:
```bash
mkdir -p uploads
chmod 755 uploads
```

### ❌ Website load chậm trên Render

**Nguyên nhân**: Free tier sleep sau 15 phút

**Giải pháp**:
1. Upgrade lên paid plan
2. Hoặc dùng UptimeRobot để ping mỗi 14 phút: https://uptimerobot.com

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. **Logs**: Xem logs trong Railway/Render dashboard
2. **Console**: F12 → Console tab trong browser
3. **Network**: F12 → Network tab để xem API calls

---

## 📝 Tóm tắt nhanh

**Deploy nhanh nhất (5 phút)**:
1. Push code lên GitHub
2. Đăng ký Railway
3. Connect repo + thêm MongoDB
4. Cấu hình env variables
5. Generate domain → Done! 🎉

---

*Tài liệu được tạo ngày: 17/12/2024*
*Phiên bản: 1.0*
