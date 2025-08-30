const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Candidate sub-document
const candidateSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    statement: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, { _id: false });

// Position sub-document
const positionSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Position title is required.'],
        trim: true
    },
    maxSelections: {
        type: Number,
        default: 1,
        min: 1
    },
    candidates: {
        type: [candidateSchema],
        validate: [
            (val) => val.length > 0,
            'A position must have at least one candidate.'
        ]
    }
});


// Election schema
const electionSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Election title is required.'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    clubId: {
        type: Schema.Types.ObjectId,
        ref: 'Club',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'closed'],
        default: 'draft',
        index: true
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required.']
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required.']
    },
    positions: {
        type: [positionSchema],
        required: true
    }
}, {
    timestamps: true
});

electionSchema.path('endTime').validate(function(value) {
    return this.startTime < value;
}, 'End time must be after start time.');

const Election = mongoose.model('Election', electionSchema);

module.exports = Election;