const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Defines a single choice on a ballot
const selectionSchema = new Schema({
    positionId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    candidateId: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, { _id: false });


const ballotSchema = new Schema({
    electionId: {
        type: Schema.Types.ObjectId,
        ref: 'Election',
        required: true,
        index: true
    },
    // The array of selections made by the voter.
    selections: {
        type: [selectionSchema],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});
// Ballot leaves no tie to the user that created the ballot 

const Ballot = mongoose.model('Ballot', ballotSchema);

module.exports = Ballot;