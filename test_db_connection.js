require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB Connection...');
console.log('URI:', process.env.MONGODB_URI ? 'Defined' : 'Undefined');

if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env file');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Successfully connected to MongoDB!');

        // Define simple schemas to query
        const Event = mongoose.model('Event', new mongoose.Schema({}, { strict: false }), 'events');
        const Article = mongoose.model('Article', new mongoose.Schema({}, { strict: false }), 'articles');

        const eventCount = await Event.countDocuments();
        const articleCount = await Article.countDocuments();

        console.log(`Events count: ${eventCount}`);
        console.log(`Articles count: ${articleCount}`);

        if (eventCount === 0) {
            console.log('WARNING: No events found in database.');
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('Connection Error:', err.message);
        process.exit(1);
    });
