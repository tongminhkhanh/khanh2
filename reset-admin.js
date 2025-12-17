const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function resetAdmin() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all users
    await User.deleteMany({});
    console.log('Deleted all users');

    // Create admin account
    const hashedPassword = await bcrypt.hash('thienkhanh', 10);
    const admin = new User({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@thitong.site',
        fullName: 'Administrator',
        role: 'admin'
    });

    await admin.save();
    console.log('Created admin account successfully!');
    console.log('Username: admin');
    console.log('Password: thienkhanh');

    await mongoose.connection.close();
    process.exit(0);
}

resetAdmin().catch(err => { console.error(err); process.exit(1); });
