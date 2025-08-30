const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clubSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Club name is required.'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    logoUrl: {
        type: String,
        trim: true
    },
    // An array of user IDs who are allowed to manage the club and its elections
    admins: {
        type: [Schema.Types.ObjectId],
        ref: 'User', 
        required: true,
        validate: [
            (val) => val.length > 0,
            'A club must have at least one admin.'
        ]
    },
    // An array of user IDs who are official members of the club
    members: {
        type: [Schema.Types.ObjectId],
        ref: 'User', 
        default: []
    }
}, {
    timestamps: true 
});

const Club = mongoose.model('Club', clubSchema);

module.exports = Club;