const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        try {
            const user = await User.findOneAndUpdate(
                { username: 'admin_debug' },
                { role: 'admin' },
                { new: true }
            );
            console.log('User updated:', user);
        } catch (error) {
            console.error(error);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
