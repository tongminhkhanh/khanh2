/**
 * Script migrate dữ liệu từ MongoDB local lên MongoDB Atlas
 * Chạy: node migrate-data.js
 */

const mongoose = require('mongoose');

// === CẤU HÌNH ===
const LOCAL_URI = 'mongodb://localhost:27017/school-news';
const ATLAS_URI = 'mongodb+srv://tongminhkhanh_db_user:bTq4BsHXGon5yTEK@cluster0.drxwj28.mongodb.net/school-news?retryWrites=true&w=majority';

// Import models
const Article = require('./models/Article');
const User = require('./models/User');
const Media = require('./models/Media');
const Setting = require('./models/Setting');
const Event = require('./models/Event');
const StaticPage = require('./models/StaticPage');
const Subscription = require('./models/Subscription');

async function migrateData() {
    console.log('🚀 Bắt đầu migrate dữ liệu...\n');

    // 1. Kết nối MongoDB Local và lấy dữ liệu
    console.log('📥 Đang kết nối MongoDB Local...');
    await mongoose.connect(LOCAL_URI);
    console.log('✅ Đã kết nối MongoDB Local\n');

    // Lấy tất cả dữ liệu từ local
    console.log('📦 Đang lấy dữ liệu từ local...');
    const articles = await Article.find({}).lean();
    const users = await User.find({}).lean();
    const media = await Media.find({}).lean();
    const settings = await Setting.find({}).lean();
    const events = await Event.find({}).lean();
    const staticPages = await StaticPage.find({}).lean();
    const subscriptions = await Subscription.find({}).lean();

    console.log(`   - Articles: ${articles.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Media: ${media.length}`);
    console.log(`   - Settings: ${settings.length}`);
    console.log(`   - Events: ${events.length}`);
    console.log(`   - Static Pages: ${staticPages.length}`);
    console.log(`   - Subscriptions: ${subscriptions.length}`);
    console.log('');

    // Ngắt kết nối local
    await mongoose.disconnect();
    console.log('✅ Đã ngắt kết nối MongoDB Local\n');

    // 2. Kết nối MongoDB Atlas và import dữ liệu
    console.log('📤 Đang kết nối MongoDB Atlas...');
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Đã kết nối MongoDB Atlas\n');

    console.log('📦 Đang import dữ liệu lên Atlas...');

    // Import Users (quan trọng nhất - cần import trước)
    if (users.length > 0) {
        try {
            await User.deleteMany({}); // Xóa dữ liệu cũ
            await User.insertMany(users);
            console.log(`   ✅ Users: ${users.length} bản ghi`);
        } catch (err) {
            console.log(`   ❌ Users: ${err.message}`);
        }
    }

    // Import Articles
    if (articles.length > 0) {
        try {
            await Article.deleteMany({});
            await Article.insertMany(articles);
            console.log(`   ✅ Articles: ${articles.length} bản ghi`);
        } catch (err) {
            console.log(`   ❌ Articles: ${err.message}`);
        }
    }

    // Import Media
    if (media.length > 0) {
        try {
            await Media.deleteMany({});
            await Media.insertMany(media);
            console.log(`   ✅ Media: ${media.length} bản ghi`);
        } catch (err) {
            console.log(`   ❌ Media: ${err.message}`);
        }
    }

    // Import Settings
    if (settings.length > 0) {
        try {
            await Setting.deleteMany({});
            await Setting.insertMany(settings);
            console.log(`   ✅ Settings: ${settings.length} bản ghi`);
        } catch (err) {
            console.log(`   ❌ Settings: ${err.message}`);
        }
    }

    // Import Events
    if (events.length > 0) {
        try {
            await Event.deleteMany({});
            await Event.insertMany(events);
            console.log(`   ✅ Events: ${events.length} bản ghi`);
        } catch (err) {
            console.log(`   ❌ Events: ${err.message}`);
        }
    }

    // Import Static Pages
    if (staticPages.length > 0) {
        try {
            await StaticPage.deleteMany({});
            await StaticPage.insertMany(staticPages);
            console.log(`   ✅ Static Pages: ${staticPages.length} bản ghi`);
        } catch (err) {
            console.log(`   ❌ Static Pages: ${err.message}`);
        }
    }

    // Import Subscriptions
    if (subscriptions.length > 0) {
        try {
            await Subscription.deleteMany({});
            await Subscription.insertMany(subscriptions);
            console.log(`   ✅ Subscriptions: ${subscriptions.length} bản ghi`);
        } catch (err) {
            console.log(`   ❌ Subscriptions: ${err.message}`);
        }
    }

    // Ngắt kết nối
    await mongoose.disconnect();

    console.log('\n🎉 HOÀN THÀNH! Dữ liệu đã được migrate lên MongoDB Atlas.');
    console.log('👉 Hãy refresh website trên Vercel để xem kết quả.');
}

// Chạy script
migrateData().catch(err => {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
});
