/**
 * Script reset mật khẩu admin trên MongoDB Atlas
 * Chạy: node reset-admin-atlas.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const ATLAS_URI = 'mongodb+srv://tongminhkhanh_db_user:bTq4BsHXGon5yTEK@cluster0.drxwj28.mongodb.net/school-news?retryWrites=true&w=majority';

async function resetAdmin() {
    console.log('🔄 Đang kết nối MongoDB Atlas...');
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Đã kết nối!\n');

    // Tìm user admin
    const admin = await User.findOne({ role: 'admin' });

    if (admin) {
        console.log('📋 Thông tin admin hiện tại:');
        console.log(`   - Username: ${admin.username}`);
        console.log(`   - Email: ${admin.email}`);
        console.log(`   - Full Name: ${admin.fullName || 'N/A'}`);
        console.log('');

        // Reset mật khẩu thành "admin123"
        const newPassword = 'admin123';
        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();

        console.log('🔐 Đã reset mật khẩu!');
        console.log(`   - Username: ${admin.username}`);
        console.log(`   - Mật khẩu mới: ${newPassword}`);
    } else {
        console.log('❌ Không tìm thấy admin user!');
        console.log('🔄 Đang tạo admin mới...');

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const newAdmin = new User({
            username: 'admin',
            password: hashedPassword,
            email: 'admin@school.edu.vn',
            fullName: 'Administrator',
            role: 'admin'
        });
        await newAdmin.save();

        console.log('✅ Đã tạo admin mới:');
        console.log('   - Username: admin');
        console.log('   - Mật khẩu: admin123');
    }

    await mongoose.disconnect();
    console.log('\n👋 Hoàn thành!');
}

resetAdmin().catch(err => {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
});
