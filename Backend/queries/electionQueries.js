const Election = require('../models/electionModel');
const User = require('../models/userModel')
const mongoose = require('mongoose');


/**
 * Creates a new election.
 * @param {object} electionData - The data for the new election.
 * @returns {Promise<object>} The newly created election document.
 */
const createElection = async (electionData) => {
    try {
        const election = new Election(electionData);
        await election.save();
        return election;
    } catch (error) {
        console.error("Error creating election:", error.message);
        throw error;
    }
};

/**
 * Finds a single election by its ID, populating all necessary details for display.
 * likely heaviest query
 * @param {string} electionId - The MongoDB ObjectId of the election.
 * @returns {Promise<object|null>} The detailed election document or null if not found.
 */
const findElectionById = async (electionId) => {
    try {
        const election = await Election.findById(electionId)
            .populate('clubId', 'name')
            .populate('positions.candidates.candidateId', 'name studentId');
        return election;
    } catch (error) {
        console.error(`Error finding election by ID ${electionId}:`, error.message);
        throw error;
    }
};

/**
 * Retrieves all elections, sorted by their start time.
 * @returns {Promise<Array<object>>} An array of all election documents.
 */
const getAllElections = async () => {
    try {
        return await Election.find({})
            .populate('clubId', 'name') 
            .sort({ startTime: -1 }); 
    } catch (error) {
        console.error("Error fetching all elections:", error.message);
        throw error;
    }
};

/**
 * Finds all elections that are currently active (status is 'active' and current time is between start and end times).
 * @returns {Promise<Array<object>>} An array of active election documents.
 */
const findActiveElections = async () => {
    try {
        const now = new Date();
        return await Election.find({
            status: 'active',
            startTime: { $lte: now },
            endTime: { $gte: now }
        }).populate('clubId', 'name').sort({ endTime: 1 }); // Show elections ending soonest first
    } catch (error) {
        console.error("Error fetching active elections:", error.message);
        throw error;
    }
};

/**
 * Finds all elections associated with a specific club.
 * @param {string} clubId - The MongoDB ObjectId of the club.
 * @returns {Promise<Array<object>>} An array of elections for that club.
 */
const findElectionsByClub = async (clubId) => {
    try {
        return await Election.find({ clubId: clubId })
            .sort({ startTime: -1 });
    } catch (error) {
        console.error(`Error fetching elections for club ${clubId}:`, error.message);
        throw error;
    }
};

/**
 * Updates an election's information.
 * @param {string} electionId - The ID of the election to update.
 * @param {object} updateData - An object containing the fields to update.
 * @returns {Promise<object|null>} The updated election document or null if not found.
 */
const updateElection = async (electionId, updateData) => {
    try {
        const updatedElection = await Election.findByIdAndUpdate(
            electionId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        return updatedElection;
    } catch (error) {
        console.error(`Error updating election ${electionId}:`, error.message);
        throw error;
    }
};

/**
 * Deletes an election.
 * Need to add deletion of ballots in controller section ---------------------------------
 * @param {string} electionId - The ID of the election to delete.
 * @returns {Promise<object|null>} The document of the election that was deleted.
 */
const deleteElection = async (electionId) => {
    try {
        return await Election.findByIdAndDelete(electionId);
    } catch (error) {
        console.error(`Error deleting election ${electionId}:`, error.message);
        throw error;
    }
};

const getElectionAnalytics = async (electionId) => {
    try {
        const objectId = new mongoose.Types.ObjectId(electionId);

        const election = await Election.findById(objectId).populate('clubId');
        if (!election) {
            throw new Error('Election not found');
        }

        const voters = await User.find({ votedInElections: objectId });

        const votesByFaculty = voters.reduce((acc, voter) => {
            const faculty = voter.faculty || 'Unknown';
            acc[faculty] = (acc[faculty] || 0) + 1;
            return acc;
        }, {});

        const totalEligibleVoters = election.clubId.members.length;
        
        const participationRate = totalEligibleVoters > 0 ? (voters.length / totalEligibleVoters) * 100 : 0;
        
        return {
            totalEligibleVoters,
            totalVotersWhoVoted: voters.length,
            participationRate,
            votesByFaculty,
        };
    } catch (error) {
        console.error(`Error getting analytics for election ${electionId}:`, error.message);
        throw error;
    }
};


module.exports = {
    createElection,
    findElectionById,
    getAllElections,
    findActiveElections,
    findElectionsByClub,
    updateElection,
    deleteElection,
    getElectionAnalytics,
};