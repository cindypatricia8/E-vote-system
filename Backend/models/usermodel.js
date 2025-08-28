const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const voteSchema = require('./votesmodel');

const userSchema = new Schema({
    // Corresponds to the SQL PRIMARY KEY. Indexed and unique for fast lookups.
    userId: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    surname: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        enum: ['M', 'F', 'O'] 
    },
    dob: {
        type: Date
    },
    faculty: {
        type: String
    },
    level: { 
        type: String,
        enum: ['UG', 'PG']
    },
    phone: { // Renamed from FakePhone
        type: String
    },
    
    votes: {
        type: [voteSchema],
        default: [] // A new student has an empty array of votes
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);