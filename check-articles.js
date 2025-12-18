/**
 * Script kiểm tra và sửa trạng thái bài viết trên MongoDB Atlas
 */

const mongoose = require('mongoose');
const Article = require('./models/Article');

const ATLAS_URI = 'mongodb+srv://tongminhkhanh_db_user:bTq4BsHXGon5yTEK@cluster0.drxwj28.mongodb.net/school-news?retryWrites=true&w=majority';

async function checkArticles() {
    console.log('🔄 Đang kết nối MongoDB Atlas...');
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Đã kết nối!\n');

    // Lấy tất cả bài viết
    const articles = await Article.find({});

    console.log(`📋 Tổng số bài viết: ${articles.length}\n`);

    if (articles.length === 0) {
        console.log('❌ Không có bài viết nào trong database!');
    } else {
        console.log('Danh sách bài viết:');
        console.log('-------------------');
        articles.forEach((article, i) => {
            console.log(`${i + 1}. "${article.title}"`);
            console.log(`   - Status: ${article.status}`);
            console.log(`   - Category: ${article.category}`);
            console.log('');
        });

        // Đếm theo status
        const published = articles.filter(a => a.status === 'published').length;
        const draft = articles.filter(a => a.status === 'draft').length;
        const pending = articles.filter(a => a.status === 'pending').length;

        console.log('📊 Thống kê:');
        console.log(`   - Published: ${published}`);
        console.log(`   - Draft: ${draft}`);
        console.log(`   - Pending: ${pending}`);

        // Hỏi có muốn publish tất cả không
        if (draft > 0 || pending > 0) {
            console.log('\n🔄 Đang chuyển tất cả bài viết sang "published"...');
            await Article.updateMany({}, { $set: { status: 'published' } });
            console.log('✅ Đã publish tất cả bài viết!');
        }
    }

    await mongoose.disconnect();
    console.log('\n👋 Hoàn thành!');
}

checkArticles().catch(err => {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
});
