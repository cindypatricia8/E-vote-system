const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voteSchema = new Schema({
    electionType: {
        type: String,
        required: [true, 'Election type is required.'],
        trim: true
    },
    votedAt: {
        type: Date,
        default: Date.now
    }
}, {
    // We disable the _id field for sub-documents unless specifically needed,
    // as it can add unnecessary overhead.
    _id: false 
});

module.exports = voteSchema;