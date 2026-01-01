const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config({ path: '.env.local' }); // Load .env.local first
require('dotenv').config(); // Then load .env (won't override existing vars)

const Subscription = require('./models/Subscription');
const Article = require('./models/Article');
const User = require('./models/User');
const Media = require('./models/Media');
const StaticPage = require('./models/StaticPage'); // Import StaticPage model
const Setting = require('./models/Setting'); // Import Setting model
const Event = require('./models/Event'); // Import Event model
const { generateArticle, analyzeImages, generateImageCaption, performSafetyCheck, suggestTopics, suggestTags } = require('./services/ai-content.service'); // AI Content Generator


const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Ensure uploads directory exists (skip on Vercel - read-only filesystem)
const uploadDir = path.join(__dirname, 'uploads');
if (process.env.NODE_ENV !== 'production') {
    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
    } catch (err) {
        console.log('Could not create uploads directory:', err.message);
    }
}

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Storage - Use Cloudinary in production, local disk in development
let storage;
if (process.env.NODE_ENV === 'production' || process.env.CLOUDINARY_CLOUD_NAME) {
    // Cloudinary Storage for production
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'school-news',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 1200, height: 800, crop: 'limit' }]
        }
    });
} else {
    // Local disk storage for development
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        }
    });
}
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public'))); // Serve public folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Connect to MongoDB with Pooling for Serverless
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb && mongoose.connection.readyState === 1) {
        return cachedDb;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        cachedDb = mongoose.connection;
        console.log('Connected to MongoDB (New Connection)');
        return cachedDb;
    } catch (err) {
        console.error('Could not connect to MongoDB:', err);
        throw err;
    }
}

// Ensure connection is established before handling requests
app.use(async (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        try {
            await connectToDatabase();
        } catch (err) {
            return res.status(500).json({ message: 'Database connection error' });
        }
    }
    next();
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

// SEO Routes - Sitemap and Robots.txt
app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = 'https://thitong.io.vn';
        const articles = await Article.find({ status: 'published' }).sort({ createdAt: -1 });
        const staticPages = await StaticPage.find({ isPublished: true });

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Homepage
        xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

        // Static pages
        const staticRoutes = [
            { path: '/gioi-thieu', priority: '0.8' },
            { path: '/thong-bao', priority: '0.9' },
            { path: '/hoat-dong', priority: '0.8' },
            { path: '/thanh-tich', priority: '0.8' },
            { path: '/su-kien', priority: '0.8' }
        ];

        staticRoutes.forEach(route => {
            xml += `  <url>\n    <loc>${baseUrl}${route.path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${route.priority}</priority>\n  </url>\n`;
        });

        // Articles
        articles.forEach(article => {
            const lastmod = article.updatedAt ? new Date(article.updatedAt).toISOString().split('T')[0] : new Date(article.createdAt).toISOString().split('T')[0];
            xml += `  <url>\n    <loc>${baseUrl}/bai-viet/${article.slug || article._id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        });

        // Dynamic static pages
        staticPages.forEach(page => {
            const lastmod = page.updatedAt ? new Date(page.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            xml += `  <url>\n    <loc>${baseUrl}/${page.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        });

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.header('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        res.send(xml);
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'code.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/ai-writer', (req, res) => {
    res.sendFile(path.join(__dirname, 'ai-writer.html'));
});

app.get('/bai-viet/:id', async (req, res) => {
    try {
        let article;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            article = await Article.findById(req.params.id);
        }
        if (!article) {
            article = await Article.findOne({ slug: req.params.id });
        }

        if (!article) {
            return res.sendFile(path.join(__dirname, 'article.html'));
        }

        // Read the article.html template
        let html = fs.readFileSync(path.join(__dirname, 'article.html'), 'utf8');

        // Prepare meta content
        const title = article.title + ' - Tin tức Xã Mường La';
        const description = article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : 'Bài viết từ Tin tức Xã Mường La';
        const image = article.image || 'https://thitong.io.vn/public/logo_school.jpg';
        const url = `https://thitong.io.vn/bai-viet/${article.slug || article._id}`;

        // Replace title tag
        html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

        // Inject OG meta tags right after <head>
        const ogTags = `
    <!-- Dynamic SEO Meta Tags -->
    <meta name="description" content="${description.replace(/"/g, '&quot;')}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${url}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="vi_VN" />
    <meta property="og:site_name" content="Tin tức Xã Mường La" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${image}" />
    
    <!-- Schema.org NewsArticle Markup -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "${article.title.replace(/"/g, '\\"')}",
      "image": ["${image}"],
      "datePublished": "${article.createdAt ? new Date(article.createdAt).toISOString() : new Date().toISOString()}",
      "dateModified": "${article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date(article.createdAt).toISOString()}",
      "author": {
        "@type": "Organization",
        "name": "Tin tức Xã Mường La",
        "url": "https://thitong.io.vn"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Tin tức Xã Mường La",
        "logo": {
          "@type": "ImageObject",
          "url": "https://thitong.io.vn/public/logo_school.jpg"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${url}"
      }
    }
    </script>
`;

        html = html.replace('<head>', '<head>' + ogTags);

        res.send(html);
    } catch (error) {
        console.error('Error rendering article:', error);
        res.sendFile(path.join(__dirname, 'article.html'));
    }
});

// Category Routes
app.get(['/thong-bao', '/hoat-dong', '/thanh-tich', '/su-kien'], (req, res) => {
    res.sendFile(path.join(__dirname, 'category.html'));
});

// Search Route
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'search.html'));
});

// Auth Routes
app.post('/api/register', async (req, res) => {
    try {
        const count = await User.countDocuments();
        const role = count === 0 ? 'admin' : 'editor';

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            fullName: req.body.fullName,
            role: role
        });

        await user.save();
        res.status(201).json({ message: 'User created' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ success: false, message: 'Invalid password' });

    const token = jwt.sign({ _id: user._id, role: user.role, username: user.username }, JWT_SECRET);
    res.json({ success: true, token: token, role: user.role, username: user.username });
});

// Media Routes
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Cloudinary returns path in req.file.path, local multer returns filename
    const isCloudinary = req.file.path && req.file.path.includes('cloudinary');
    const filePath = isCloudinary ? req.file.path : `/uploads/${req.file.filename}`;
    const fileName = isCloudinary ? req.file.filename : req.file.filename;

    const media = new Media({
        filename: fileName,
        path: filePath,
        mimetype: req.file.mimetype,
        size: req.file.size || 0,
        uploadedBy: req.user._id,
        cloudinaryId: req.file.filename // Store Cloudinary public_id for deletion
    });

    try {
        await media.save();
        res.json({
            message: 'File uploaded successfully',
            url: media.path,
            filename: media.filename
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/media', authenticateToken, async (req, res) => {
    try {
        const media = await Media.find().sort({ createdAt: -1 });
        res.json(media);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete Media
app.delete('/api/media/:id', authenticateToken, async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        // Check if it's a Cloudinary file or local file
        if (media.path && media.path.includes('cloudinary')) {
            // Delete from Cloudinary
            try {
                const publicId = media.cloudinaryId || media.filename;
                await cloudinary.uploader.destroy(publicId);
            } catch (cloudErr) {
                console.log('Cloudinary delete error:', cloudErr.message);
            }
        } else {
            // Delete file from local filesystem
            const localPath = path.join(__dirname, media.path);
            if (fs.existsSync(localPath)) {
                fs.unlinkSync(localPath);
            }
        }

        // Delete from database
        await Media.findByIdAndDelete(req.params.id);
        res.json({ message: 'Media deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Article Routes
app.get('/api/articles', async (req, res) => {
    try {
        const { category, includeAll } = req.query;
        // By default only show published articles, unless includeAll=true (for admin)
        const filter = { status: 'published' };
        if (includeAll === 'true') {
            delete filter.status; // Admin can see all
        }
        if (category) {
            filter.category = category;
        }
        const articles = await Article.find(filter).sort({ createdAt: -1 });
        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=59');
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search Articles API
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim() === '') {
            return res.json([]);
        }
        const searchRegex = new RegExp(q, 'i');
        const articles = await Article.find({
            $or: [
                { title: searchRegex },
                { content: searchRegex },
                { category: searchRegex },
                { tags: searchRegex }
            ],
            status: 'published'
        }).sort({ createdAt: -1 }).limit(20);
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/articles/:id', async (req, res) => {
    try {
        let article;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            article = await Article.findById(req.params.id);
        }
        if (!article) {
            article = await Article.findOne({ slug: req.params.id });
        }

        if (!article) return res.status(404).json({ message: 'Article not found' });
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/articles', authenticateToken, authorizeRole(['admin', 'editor']), async (req, res) => {
    const article = new Article({
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        image: req.body.image,
        status: req.body.status || 'draft',
        tags: req.body.tags || [],
        author: req.user._id
    });

    // Role-based status enforcement
    if (req.user.role === 'teacher' && article.status === 'published') {
        article.status = 'pending';
    }

    try {
        const newArticle = await article.save();
        res.status(201).json(newArticle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/articles/:id', authenticateToken, authorizeRole(['admin', 'editor']), async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: 'Article not found' });

        if (req.body.title) article.title = req.body.title;
        if (req.body.content) article.content = req.body.content;
        if (req.body.category) article.category = req.body.category;
        if (req.body.image) article.image = req.body.image;
        if (req.body.status) article.status = req.body.status;
        if (req.body.tags) article.tags = req.body.tags;

        // Role-based status enforcement
        if (req.user.role === 'teacher' && req.body.status === 'published') {
            article.status = 'pending';
        }

        const updatedArticle = await article.save();
        res.json(updatedArticle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/articles/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: 'Article not found' });

        await article.deleteOne();
        res.json({ message: 'Article deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Email không hợp lệ' });
    }

    try {
        const newSubscription = new Subscription({ email });
        await newSubscription.save();
        console.log(`New subscription saved: ${email}`);
        res.json({ success: true, message: 'Đăng ký thành công! Cảm ơn bạn đã theo dõi.' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email này đã được đăng ký trước đó' });
        }
        console.error('Error saving subscription:', error);
        res.status(500).json({ success: false, message: 'Lỗi server, vui lòng thử lại sau' });
    }
});

// Get all subscriptions (Admin only)
app.get('/api/subscriptions', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const subscriptions = await Subscription.find().sort({ createdAt: -1 });
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete subscription (Admin only)
app.delete('/api/subscriptions/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const subscription = await Subscription.findByIdAndDelete(req.params.id);
        if (!subscription) {
            return res.status(404).json({ message: 'Không tìm thấy subscriber' });
        }
        res.json({ message: 'Đã xóa subscriber thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// --- Static Page Routes ---

// Get all static pages (Admin)
app.get('/api/admin/static-pages', authenticateToken, authorizeRole(['admin', 'editor']), async (req, res) => {
    try {
        const pages = await StaticPage.find().sort({ updatedAt: -1 }).populate('lastModifiedBy', 'username');
        res.json(pages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create static page
app.post('/api/admin/static-pages', authenticateToken, authorizeRole(['admin', 'editor']), async (req, res) => {
    const page = new StaticPage({
        title: req.body.title,
        slug: req.body.slug,
        content: req.body.content,
        isPublished: req.body.isPublished,
        lastModifiedBy: req.user._id
    });

    try {
        const newPage = await page.save();
        res.status(201).json(newPage);
    } catch (error) {
        console.error('Error creating static page:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update static page
app.put('/api/admin/static-pages/:id', authenticateToken, authorizeRole(['admin', 'editor']), async (req, res) => {
    try {
        const page = await StaticPage.findById(req.params.id);
        if (!page) return res.status(404).json({ message: 'Page not found' });

        if (req.body.title) page.title = req.body.title;
        if (req.body.slug) page.slug = req.body.slug;
        if (req.body.content) page.content = req.body.content;
        if (req.body.isPublished !== undefined) page.isPublished = req.body.isPublished;
        page.lastModifiedBy = req.user._id;

        const updatedPage = await page.save();
        res.json(updatedPage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete static page
app.delete('/api/admin/static-pages/:id', authenticateToken, authorizeRole(['admin', 'editor']), async (req, res) => {
    try {
        await StaticPage.findByIdAndDelete(req.params.id);
        res.json({ message: 'Page deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get public static page by slug
app.get('/api/static-pages/:slug', async (req, res) => {
    try {
        const page = await StaticPage.findOne({ slug: req.params.slug, isPublished: true });
        if (!page) return res.status(404).json({ message: 'Page not found' });
        res.json(page);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Serve page.html for any other route that matches a slug pattern (simple implementation)
// Note: This should be placed after API routes but before the catch-all if we had one.
// For now, we will rely on the frontend calling the API.
app.get('/:slug', (req, res, next) => {
    // Exclude API routes and static files
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.includes('.')) {
        return next();
    }
    res.sendFile(path.join(__dirname, 'page.html'));
});

// --- End Static Page Routes ---

// --- Setting Routes ---

// Get setting by key
app.get('/api/settings/:key', async (req, res) => {
    try {
        const setting = await Setting.findOne({ key: req.params.key });
        if (!setting) {
            // Return default empty setting instead of 404 to prevent frontend errors
            return res.json({
                key: req.params.key,
                value: null,
                description: 'Not configured'
            });
        }
        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=59');
        res.json(setting);
    } catch (error) {
        console.error(`Error fetching setting ${req.params.key}:`, error.message);
        // Return empty setting on error to prevent frontend crash
        res.json({
            key: req.params.key,
            value: null,
            error: error.message
        });
    }
});

// Update setting (Admin only)
app.put('/api/admin/settings/:key', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        console.log('Update Setting Body:', req.body);
        const { value, description } = req.body;
        const setting = await Setting.findOneAndUpdate(
            { key: req.params.key },
            { key: req.params.key, value, description, updatedAt: Date.now() },
            { new: true, upsert: true } // Create if not exists
        );
        res.json(setting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// --- End Setting Routes ---

// --- Event Routes ---

// Get all published events (public access with optional filtering)
app.get('/api/events', async (req, res) => {
    try {
        const { type, grade, class: targetClass, startDate, endDate } = req.query;

        const query = { isPublished: true };

        // Filter by type
        if (type) {
            query.type = type;
        }

        // Filter by grade
        if (grade) {
            query.$or = [
                { type: 'public' },
                { targetGrade: grade }
            ];
        }

        // Filter by class
        if (targetClass) {
            query.$or = [
                { type: 'public' },
                { targetClass: targetClass }
            ];
        }

        // Filter by date range
        if (startDate || endDate) {
            query.startDate = {};
            if (startDate) query.startDate.$gte = new Date(startDate);
            if (endDate) query.startDate.$lte = new Date(endDate);
        }

        // Exclude teacher events from public view
        if (!query.type) {
            query.type = { $ne: 'teacher' };
        }

        const events = await Event.find(query)
            .populate('createdBy', 'username fullName')
            .sort({ startDate: 1 });

        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=59');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single event by ID
app.get('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id, isPublished: true })
            .populate('createdBy', 'username fullName');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all events (admin access - includes unpublished)
app.get('/api/admin/events', authenticateToken, async (req, res) => {
    try {
        const { type, startDate, endDate, isPublished } = req.query;

        const query = {};

        if (type) query.type = type;
        if (isPublished !== undefined) query.isPublished = isPublished === 'true';

        if (startDate || endDate) {
            query.startDate = {};
            if (startDate) query.startDate.$gte = new Date(startDate);
            if (endDate) query.startDate.$lte = new Date(endDate);
        }

        const events = await Event.find(query)
            .populate('createdBy', 'username fullName')
            .sort({ startDate: 1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new event (authenticated users)
app.post('/api/events', authenticateToken, authorizeRole(['admin', 'editor']), async (req, res) => {
    try {
        const event = new Event({
            ...req.body,
            createdBy: req.user.userId
        });

        const newEvent = await event.save();
        const populatedEvent = await Event.findById(newEvent._id)
            .populate('createdBy', 'username fullName');

        res.status(201).json(populatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update event (authenticated users)
app.put('/api/events/:id', authenticateToken, authorizeRole(['admin', 'editor']), async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).populate('createdBy', 'username fullName');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete event (admin only)
app.delete('/api/events/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- End Event Routes ---

// --- User Management Routes (Admin only) ---

// Get all users
app.get('/api/admin/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single user
app.get('/api/admin/users/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new user
app.post('/api/admin/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { username, password, email, fullName, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username hoặc email đã tồn tại' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hashedPassword,
            email,
            fullName,
            role: role || 'editor'
        });

        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(201).json(userResponse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update user
app.put('/api/admin/users/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { username, email, fullName, role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check for duplicate username/email
        if (username && username !== user.username) {
            const exists = await User.findOne({ username });
            if (exists) return res.status(400).json({ message: 'Username đã tồn tại' });
            user.username = username;
        }
        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(400).json({ message: 'Email đã tồn tại' });
            user.email = email;
        }
        if (fullName) user.fullName = fullName;
        if (role) user.role = role;

        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json(userResponse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Reset user password
app.put('/api/admin/users/:id/password', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = await bcrypt.hash(password, 10);
        await user.save();

        res.json({ message: 'Đã đặt lại mật khẩu thành công' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete user
app.delete('/api/admin/users/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        // Prevent self-deletion
        if (req.user._id === req.params.id) {
            return res.status(400).json({ message: 'Không thể xóa chính mình' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'Đã xóa người dùng' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- End User Management Routes ---

// --- AI Content Generation Routes ---

/**
 * POST /api/ai/generate-article
 * Preview: Sinh bài viết từ ghi chú thô, không lưu database
 * Body: { rawNote: string }
 * Response: { success, article: { title, sapo, content, category, tags } }
 */
app.post('/api/ai/generate-article', authenticateToken, async (req, res) => {
    try {
        const { rawNote } = req.body;

        if (!rawNote) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ghi chú thô (rawNote)'
            });
        }

        const article = await generateArticle(rawNote);

        res.json({
            success: true,
            article: article,
            message: 'Tạo bài viết thành công! Bạn có thể chỉnh sửa và lưu nháp.'
        });
    } catch (error) {
        console.error('AI Generate Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể sinh bài viết. Vui lòng thử lại.'
        });
    }
});

/**
 * POST /api/ai/generate-and-save
 * Sinh bài viết và lưu trực tiếp dưới dạng draft
 * Body: { rawNote: string }
 * Response: { success, articleId, article, message }
 */
app.post('/api/ai/generate-and-save', authenticateToken, authorizeRole(['admin', 'editor']), async (req, res) => {
    try {
        const { rawNote } = req.body;

        if (!rawNote) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ghi chú thô (rawNote)'
            });
        }

        // Generate article using AI
        const generatedArticle = await generateArticle(rawNote);

        // Combine sapo and content for full article
        const fullContent = `<p class="sapo"><strong>${generatedArticle.sapo}</strong></p>\n${generatedArticle.content}`;

        // Save to database as draft
        const article = new Article({
            title: generatedArticle.title,
            content: fullContent,
            category: generatedArticle.category,
            status: 'draft',
            tags: generatedArticle.tags,
            author: req.user._id
        });

        const savedArticle = await article.save();

        res.status(201).json({
            success: true,
            articleId: savedArticle._id,
            article: savedArticle,
            message: 'Đã tạo và lưu bài viết nháp thành công!'
        });
    } catch (error) {
        console.error('AI Generate and Save Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể sinh và lưu bài viết. Vui lòng thử lại.'
        });
    }
});

/**
 * POST /api/ai/analyze-images
 * Phân tích và chọn ảnh phù hợp với Gemini Vision
 * Body: multipart/form-data với images[]
 */
app.post('/api/ai/analyze-images', authenticateToken, upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng upload ít nhất 1 ảnh'
            });
        }

        // Convert files to buffer format for analyzeImages
        const imageBuffers = await Promise.all(req.files.map(async (file) => {
            let buffer;
            if (file.buffer) {
                buffer = file.buffer;
            } else if (file.path && file.path.includes('cloudinary')) {
                // Fetch from Cloudinary URL
                const response = await fetch(file.path);
                buffer = Buffer.from(await response.arrayBuffer());
            } else if (file.path) {
                buffer = fs.readFileSync(file.path);
            }
            return {
                buffer,
                mimeType: file.mimetype,
                filename: file.originalname
            };
        }));

        const result = await analyzeImages(imageBuffers);

        res.json({
            success: true,
            ...result,
            uploadedCount: req.files.length
        });
    } catch (error) {
        console.error('Image Analysis Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể phân tích ảnh'
        });
    }
});

/**
 * POST /api/ai/generate-article-v2
 * Sinh bài viết với Safety Check + Optional Image Analysis
 * Body: { rawNote: string, skipSafety?: boolean }
 */
app.post('/api/ai/generate-article-v2', authenticateToken, async (req, res) => {
    try {
        const { rawNote, skipSafety } = req.body;

        if (!rawNote) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ghi chú thô (rawNote)'
            });
        }

        // Generate article
        const article = await generateArticle(rawNote);

        res.json({
            success: true,
            article,
            message: 'Tạo bài viết thành công!'
        });
    } catch (error) {
        console.error('AI Generate V2 Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể sinh bài viết'
        });
    }
});

/**
 * POST /api/ai/suggest-topics
 * Gợi ý chủ đề bài viết từ Perplexity AI
 * Body: { topic: string, context?: string }
 * Response: { success, suggestions: [{ title, description, category }], sources: [] }
 */
app.post('/api/ai/suggest-topics', authenticateToken, async (req, res) => {
    try {
        const { topic, context } = req.body;

        if (!topic || topic.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp chủ đề (ít nhất 2 ký tự)'
            });
        }

        const result = await suggestTopics(topic, context || '');

        res.json({
            success: true,
            suggestions: result.suggestions,
            sources: result.sources,
            message: `Đã tìm thấy ${result.suggestions.length} ý tưởng bài viết`
        });
    } catch (error) {
        console.error('Suggest Topics Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể gợi ý chủ đề. Vui lòng kiểm tra PERPLEXITY_API_KEY.'
        });
    }
});

/**
 * POST /api/ai/suggest-tags
 * Gợi ý tags từ tiêu đề/nội dung bài viết
 * Body: { title: string, content?: string }
 * Response: { success, tags: string[] }
 */
app.post('/api/ai/suggest-tags', authenticateToken, async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || title.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp tiêu đề (ít nhất 5 ký tự)'
            });
        }

        const result = await suggestTags(title, content || '');

        res.json({
            success: true,
            tags: result.tags,
            message: `Đã gợi ý ${result.tags.length} tags`
        });
    } catch (error) {
        console.error('Suggest Tags Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể gợi ý tags. Vui lòng kiểm tra PERPLEXITY_API_KEY.'
        });
    }
});

/**
 * POST /api/ai/caption
 * Tạo caption cho một ảnh
 * Body: multipart/form-data với image + optional context
 */
app.post('/api/ai/caption', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng upload ảnh'
            });
        }

        let buffer;
        if (req.file.buffer) {
            buffer = req.file.buffer;
        } else if (req.file.path && req.file.path.includes('cloudinary')) {
            const response = await fetch(req.file.path);
            buffer = Buffer.from(await response.arrayBuffer());
        } else if (req.file.path) {
            buffer = fs.readFileSync(req.file.path);
        }

        const caption = await generateImageCaption(
            buffer,
            req.file.mimetype,
            req.body.context || ''
        );

        res.json({
            success: true,
            caption,
            filename: req.file.originalname
        });
    } catch (error) {
        console.error('Caption Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể tạo caption'
        });
    }
});

// --- End AI Content Generation Routes ---


// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log('Server started with slug support');
    });
}

module.exports = app;

