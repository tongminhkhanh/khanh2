const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'editor', 'teacher', 'admissions'],
        default: 'editor'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes (username and email already have unique indexes)
userSchema.index({ role: 1 }); // For filtering users by role
userSchema.index({ createdAt: -1 }); // For listing users

module.exports = mongoose.model('User', userSchema);
