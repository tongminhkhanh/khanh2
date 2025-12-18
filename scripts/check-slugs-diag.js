require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('../models/Article');

async function checkSlugs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const articles = await Article.find().limit(5);
        console.log('Checking first 5 articles:');
        articles.forEach(a => {
            console.log(`ID: ${a._id}, Title: ${a.title}, Slug: '${a.slug}'`);
        });

        // Check specifically for one if we had the ID, but listing 5 is good enough start.

        const countMissing = await Article.countDocuments({ slug: { $exists: false } });
        const countEmpty = await Article.countDocuments({ slug: "" });
        const countNull = await Article.countDocuments({ slug: null });

        console.log(`Missing slug: ${countMissing}`);
        console.log(`Empty slug: ${countEmpty}`);
        console.log(`Null slug: ${countNull}`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSlugs();
