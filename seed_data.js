require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define Schemas (Simplified)
const ArticleSchema = new mongoose.Schema({
    title: String,
    content: String,
    category: String,
    image: String,
    status: { type: String, default: 'published' },
    createdAt: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const EventSchema = new mongoose.Schema({
    title: String,
    startDate: Date,
    endDate: Date,
    location: String,
    description: String,
    type: { type: String, default: 'public' },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    fullName: String,
    role: String
});

const Article = mongoose.model('Article', ArticleSchema);
const Event = mongoose.model('Event', EventSchema);
const User = mongoose.model('User', UserSchema);

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB for seeding...');

        // Create Admin User if not exists
        let admin = await User.findOne({ username: 'admin' });
        if (!admin) {
            const hashedPassword = await bcrypt.hash('123456', 10);
            admin = await User.create({
                username: 'admin',
                password: hashedPassword,
                email: 'admin@example.com',
                fullName: 'Admin User',
                role: 'admin'
            });
            console.log('Created admin user');
        }

        // Check if data exists
        const articleCount = await Article.countDocuments();
        if (articleCount === 0) {
            console.log('Seeding articles...');
            await Article.create([
                {
                    title: 'Học sinh lớp 5A đạt giải Nhất Toán cấp Quận',
                    content: 'Chúc mừng em Nguyễn Văn An đã xuất sắc vượt qua các vòng thi để mang về thành tích cao cho nhà trường.',
                    category: 'Thành tích',
                    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8mOVs9nRFj8DzQTFPshoSjwifBwUzx1vvv4cPnHbxqasaqHXjTpZeuV4-MV2fVNq6vRKabYsAcHTVWRwXNGjzHrhMAidSGDn4LTrvKDzCA6X-hfU10376mrS61NOaoMDtLsjO3NRvmULBpRSR6NjE1Yt5IYKjJihrG36OLKYPM1SmOu5Gfn2PeKRijUweB8g0DkgZycMiVVynH8Mc7RX0hkR9WcF6wa8tn284vD02ZMVLDhsTaHz-zFGPu8_7JVACRLhZqrdGklkc',
                    author: admin._id
                },
                {
                    title: 'Chuyến đi thực tế tại Nông trại Giáo dục Erahouse',
                    content: 'Một ngày trải nghiệm thú vị của các em học sinh khối 3, học cách trồng rau và chăm sóc vật nuôi.',
                    category: 'Hoạt động',
                    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRGH3dgl8Vf44OFjKf9_9uMqB3IwdsHTZxbhTpS_SNSWnxPNemwofc9X-v67xv30ooWzvYyhrmiAelycgsdfWppbn75BVVfZK1Mq5hrZQ6uvxszcQ9IqabcLCBuV5OjVWInkuni4_va2XHZQuOhjtj5kC70J-9SlyKajwuoUHEyHMqn23WTO6zRh1s-u2_580Sv9mvce65FFHwojyRaFOpOZwIejfEIMmATWKNT5L6KwwPvs2RDLgrlEy5dxY88AcuMRJCCLznHyWb',
                    author: admin._id
                },
                {
                    title: 'Thông báo lịch nghỉ lễ Quốc khánh',
                    content: 'Nhà trường thông báo lịch nghỉ lễ và kế hoạch học bù cho toàn thể học sinh và giáo viên.',
                    category: 'Thông báo',
                    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBREgLKE4zVtyQF7kdCaDUTUbz9baJEcO-p-5b0j2cdM_Cb9sXrylEyTWBS2G_L-QisgKMpsflafqqM0K9VroewydYgrwwpgQYH-T73F4OHEfGZsbbWzxZMJaMxYweONLpd9K5AiAfGIK6POcBsOB_fluKVd5yAdo9lC7Hh8UrBO5LsEvwfReBTH_XPxPEmeHNmK0r-tl50POSy55xi9cjA4V7x2V5Cy-CYPjV3G2vAh0ozHfWvkG-GI4vDbQhb7JDBlLzm5hkvfxnM',
                    author: admin._id
                },
                {
                    title: 'Hội diễn văn nghệ Chào mừng 20/11',
                    content: 'Mời quý phụ huynh đăng ký tiết mục tham gia hội diễn văn nghệ cùng các con.',
                    category: 'Sự kiện',
                    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLP6D4VNtzZ14bakKa0o8TuCq6Uxm7N4CbcqtJVzep2T3YIbXfogjtxpMkDuTpnoHNmsXXeVibx2qymZS7mFGTd-uOVQB0VKmwEjP7GHu3xbQdaB1Gn8YoFefOea_X4ks2p1sjUiik323xiTDT4rhr4qGslFrVzZl0dELjccYul_xWtOxihTA7yHrP9YF8H1si4hfg5IQDxp5uUgFwyh0oMByHiQjexIHqwmwKceaEUqzhwn39S9MsgsAJdNsr9Tcyp7-twhgJDf_t',
                    author: admin._id
                }
            ]);
            console.log('Seeded articles');
        }

        // Check events
        const eventCount = await Event.countDocuments();
        if (eventCount === 0) {
            console.log('Seeding events...');
            const today = new Date();
            const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
            const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

            await Event.create([
                {
                    title: 'Lễ Khai Giảng',
                    startDate: tomorrow,
                    endDate: tomorrow,
                    location: 'Sân trường',
                    description: 'Lễ khai giảng năm học mới',
                    createdBy: admin._id
                },
                {
                    title: 'Họp Phụ Huynh Đầu Năm',
                    startDate: nextWeek,
                    endDate: nextWeek,
                    location: 'Các lớp học',
                    description: 'Họp phụ huynh để phổ biến kế hoạch năm học',
                    createdBy: admin._id
                }
            ]);
            console.log('Seeded events');
        }

        console.log('Seeding completed!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
