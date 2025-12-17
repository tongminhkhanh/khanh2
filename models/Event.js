const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['public', 'class', 'teacher'],
        default: 'public'
    },
    targetClass: {
        type: String,
        default: null
    },
    targetGrade: {
        type: String,
        default: null
    },
    color: {
        type: String,
        default: '#3788d8'
    },
    location: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient querying
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ type: 1, isPublished: 1 });
eventSchema.index({ targetClass: 1, targetGrade: 1 });

module.exports = mongoose.model('Event', eventSchema);
