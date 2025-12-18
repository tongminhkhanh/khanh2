const mongoose = require('mongoose');
const Article = require('../models/Article');
require('dotenv').config();

async function migrateSlugs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const articles = await Article.find({ slug: { $exists: false } });
        console.log(`Found ${articles.length} articles without slugs`);

        for (const article of articles) {
            article.slug = article.title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            if (!article.slug) {
                article.slug = 'bai-viet-' + article._id;
            }

            // Ensure uniqueness (simple check)
            let uniqueSlug = article.slug;
            let counter = 1;
            while (await Article.findOne({ slug: uniqueSlug, _id: { $ne: article._id } })) {
                uniqueSlug = `${article.slug}-${counter}`;
                counter++;
            }
            article.slug = uniqueSlug;

            await article.save();
            console.log(`Updated slug for: ${article.title} -> ${article.slug}`);
        }

        console.log('Migration completed');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateSlugs();
