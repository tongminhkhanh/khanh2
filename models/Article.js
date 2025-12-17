const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'published'],
        default: 'draft'
    },
    tags: {
        type: [String],
        default: []
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for optimizing read-heavy queries
// Compound index for listing articles with status filter and sorted by date
articleSchema.index({ status: 1, createdAt: -1 });
// Index for category filtering with status
articleSchema.index({ category: 1, status: 1, createdAt: -1 });
// Index for sorting by createdAt (most common query)
articleSchema.index({ createdAt: -1 });
// Text index for search functionality
articleSchema.index({ title: 'text', content: 'text', tags: 'text' });
// Index for author lookup
articleSchema.index({ author: 1 });

module.exports = mongoose.model('Article', articleSchema);
