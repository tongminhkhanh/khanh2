const mongoose = require('mongoose');

const staticPageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    content: {
        type: String,
        default: ''
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt before saving
staticPageSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

// Indexes for optimizing read queries
staticPageSchema.index({ slug: 1, isPublished: 1 }); // For public page lookup
staticPageSchema.index({ isPublished: 1, updatedAt: -1 }); // For listing published pages
staticPageSchema.index({ updatedAt: -1 }); // For admin listing

module.exports = mongoose.model('StaticPage', staticPageSchema);
