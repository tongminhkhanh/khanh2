const mongoose = require('mongoose');
const Article = require('../models/Article');

const MONGODB_URI = 'mongodb+srv://tongminhkhanh_db_user:bTq4BsHXGon5yTEK@cluster0.drxwj28.mongodb.net/school-news?retryWrites=true&w=majority';

async function migrateSlugs() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB (school-news database)');

        // Find articles without slugs OR with null/empty slugs
        const articles = await Article.find({
            $or: [
                { slug: { $exists: false } },
                { slug: null },
                { slug: "" }
            ]
        });
        console.log(`Found ${articles.length} articles without slugs`);

        for (const article of articles) {
            let baseSlug = article.title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            if (!baseSlug) {
                baseSlug = 'bai-viet-' + article._id;
            }

            // Ensure uniqueness
            let uniqueSlug = baseSlug;
            let counter = 1;
            while (await Article.findOne({ slug: uniqueSlug, _id: { $ne: article._id } })) {
                uniqueSlug = `${baseSlug}-${counter}`;
                counter++;
            }
            article.slug = uniqueSlug;

            await article.save();
            console.log(`Updated slug for: ${article.title} -> ${article.slug}`);
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateSlugs();
