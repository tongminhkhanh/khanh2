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
require('dotenv').config();

const Subscription = require('./models/Subscription');
const Article = require('./models/Article');
const User = require('./models/User');
const Media = require('./models/Media');
const StaticPage = require('./models/StaticPage'); // Import StaticPage model
const Setting = require('./models/Setting'); // Import Setting model
const Event = require('./models/Event'); // Import Event model


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
        const title = article.title + ' - Trường Tiểu học Ít Ong';
        const description = article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : 'Bài viết từ Trường Tiểu học Ít Ong';
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
    <meta property="og:site_name" content="Trường Tiểu học Ít Ong" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${image}" />
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

// Public Media for Slider (no auth required)
app.get('/api/public/media', async (req, res) => {
    try {
        const media = await Media.find().sort({ createdAt: -1 }).limit(20);
        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=59');
        res.json(media);
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
        const { category } = req.query;
        const filter = category ? { category } : {};
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

    try {
        const newSubscription = new Subscription({ email });
        await newSubscription.save();
        console.log(`New subscription saved: ${email}`);
        res.json({ success: true, message: 'Thank you for subscribing!' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email already subscribed' });
        }
        console.error('Error saving subscription:', error);
        res.status(500).json({ success: false, message: 'Server error' });
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


// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log('Server started with slug support');
    });
}

module.exports = app;

