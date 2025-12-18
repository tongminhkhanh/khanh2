require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('../models/Article');

async function checkArticle() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Check the specific article from live API
        const articleId = '69439f2c59268bf0d5c988b0';
        const article = await Article.findById(articleId);

        if (article) {
            console.log('Article found:');
            console.log('ID:', article._id);
            console.log('Title:', article.title);
            console.log('Slug:', article.slug);
            console.log('Slug type:', typeof article.slug);
            console.log('Slug value check:', article.slug === null ? 'IS NULL' : article.slug === '' ? 'IS EMPTY STRING' : article.slug === undefined ? 'IS UNDEFINED' : 'HAS VALUE');
        } else {
            console.log('Article not found with ID:', articleId);
        }

        // Also list all articles to see their slugs
        console.log('\n--- All articles ---');
        const all = await Article.find().select('_id title slug').lean();
        all.forEach(a => console.log(`${a._id}: slug="${a.slug}" (${typeof a.slug})`));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkArticle();
