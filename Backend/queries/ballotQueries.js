const mongoose = require('mongoose');
const Ballot = require('../models/ballotModel');

/**
 * Creates a new ballot document.
 * @param {string} electionId - The ID of the election the ballot is for.
 * @param {Array<object>} selections - An array of the voter's choices, e.g., [{ positionId, candidateId }].
 * @returns {Promise<object>} The newly created ballot document.
 */
const createBallot = async (electionId, selections) => {
    try {
        const ballot = new Ballot({
            electionId,
            selections
        });
        await ballot.save();
        return ballot;
    } catch (error) {
        console.error("Error creating ballot:", error.message);
        throw error;
    }
};

/**
 * Counts the total number of ballots cast for a specific election.
 * @param {string} electionId - The ID of the election to count ballots for.
 * @returns {Promise<number>} The total count of ballots.
 */
const countBallotsForElection = async (electionId) => {
    try {
        return await Ballot.countDocuments({ electionId: electionId });
    } catch (error) {
        console.error(`Error counting ballots for election ${electionId}:`, error.message);
        throw error;
    }
};

/**
 * Counts the results of an election.
 * @param {string} electionId - The ID of the election to tally.
 * @returns {Promise<Array<object>>} An array of objects, each containing position, candidate, and vote count.
 */
const getElectionResults = async (electionId) => {
    try {
        const objectId = new mongoose.Types.ObjectId(electionId);

        // Run two queries in parallel for efficiency
        const [results, totalBallots] = await Promise.all([
            // Query 1: The aggregation pipeline to tally votes
            Ballot.aggregate([
                { $match: { electionId: objectId } },
                { $unwind: '$selections' },
                {
                    $group: {
                        _id: {
                            positionId: '$selections.positionId',
                            candidateId: '$selections.candidateId'
                        },
                        voteCount: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        positionId: '$_id.positionId',
                        candidateId: '$_id.candidateId',
                        voteCount: '$voteCount'
                    }
                },
                { $sort: { positionId: 1, voteCount: -1 } }
            ]),
            // Query 2: A simple count of all ballots for this election
            Ballot.countDocuments({ electionId: objectId })
        ]);

        return { results, totalBallots };
    } catch (error) {
        console.error(`Error tallying results for election ${electionId}:`, error.message);
        throw error;
    }
};

/**
 * Deletes all ballots associated with a specific election.
 * @param {string} electionId - The ID of the election whose ballots should be deleted.
 * @returns {Promise<object>} The result of the delete operation from MongoDB.
 */
const deleteBallotsForElection = async (electionId) => {
    try {
        return await Ballot.deleteMany({ electionId: electionId });
    } catch (error) {
        console.error(`Error deleting ballots for election ${electionId}:`, error.message);
        throw error;
    }
};


module.exports = {
    createBallot,
    countBallotsForElection,
    getElectionResults,
    deleteBallotsForElection,
};