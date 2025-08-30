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
        const results = await Ballot.aggregate([
            // Filter to only specified election
            {
                $match: { electionId: new mongoose.Types.ObjectId(electionId) }
            },
            // Process each vote individually
            {
                $unwind: '$selections'
            },
            // Use groupby for candidate and position
            {
                $group: {
                    _id: {
                        positionId: '$selections.positionId',
                        candidateId: '$selections.candidateId'
                    },
                    voteCount: { $sum: 1 }
                }
            },
            // format for clearer information
            {
                $project: {
                    _id: 0,
                    positionId: '$_id.positionId',
                    candidateId: '$_id.candidateId',
                    voteCount: '$voteCount'
                }
            },
            // Sort results
            {
                $sort: {
                    positionId: 1, // Group by position
                    voteCount: -1  // Show winner first for each position
                }
            }
        ]);
        return results;
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