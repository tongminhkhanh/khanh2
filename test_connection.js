const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

console.log('--- Kiem tra ket noi MongoDB ---');
console.log('Dang thu ket noi den:', uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'Chua co URI');

if (!uri) {
    console.error('LOI: Khong tim thay MONGODB_URI trong file .env');
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => {
        console.log('✅ KET NOI THANH CONG!');
        console.log('Database dang hoat dong tot.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ KET NOI THAT BAI');
        console.error('Loi chi tiet:', err.message);
        console.log('\nGoi y sua loi:');
        console.log('1. Kiem tra lai username/password trong chuoi ket noi.');
        console.log('2. Kiem tra IP Whitelist tren MongoDB Atlas (phai co 0.0.0.0/0).');
        process.exit(1);
    });
