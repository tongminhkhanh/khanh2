const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true
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

// Pre-save hook to generate slug from title
articleSchema.pre('save', async function () {
    if (this.isModified('title') || (this.isNew && !this.slug)) {
        this.slug = this.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Append timestamp if slug is empty (e.g. title was all special chars)
        if (!this.slug) {
            this.slug = 'bai-viet-' + Date.now();
        }
    }
});

// Indexes for optimizing read-heavy queries
// Compound index for listing articles with status filter and sorted by date
articleSchema.index({ status: 1, createdAt: -1 });
articleSchema.index({ slug: 1 });
// Index for category filtering with status
articleSchema.index({ category: 1, status: 1, createdAt: -1 });
// Index for sorting by createdAt (most common query)
articleSchema.index({ createdAt: -1 });
// Text index for search functionality
articleSchema.index({ title: 'text', content: 'text', tags: 'text' });
// Index for author lookup
articleSchema.index({ author: 1 });

module.exports = mongoose.model('Article', articleSchema);
