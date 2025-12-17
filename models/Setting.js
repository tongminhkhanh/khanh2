const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // Can be string, object, boolean, etc.
        required: true
    },
    description: {
        type: String
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

settingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Setting', settingSchema);
