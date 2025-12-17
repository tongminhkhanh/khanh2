const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        default: 0
    },
    cloudinaryId: {
        type: String
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for optimizing read queries
mediaSchema.index({ createdAt: -1 }); // For sorted listing
mediaSchema.index({ path: 1 }); // For path lookup
mediaSchema.index({ uploadedBy: 1, createdAt: -1 }); // For user's media

module.exports = mongoose.model('Media', mediaSchema);
