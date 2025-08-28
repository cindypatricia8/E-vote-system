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
});

module.exports = voteSchema;