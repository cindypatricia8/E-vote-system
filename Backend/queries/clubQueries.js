const Club = require('../models/clubModel');
const Election = require('../models/electionModel');
const Ballot = require('../models/ballotModel');


/**
 * Creates a new club.
 * @param {object} clubData - Data for the new club (name, description, admins array).
 * @returns {Promise<object>} The newly created club document.
 */
const createClub = async (clubData) => {
    try {
        const club = new Club(clubData);
        await club.save();
        return club;
    } catch (error) {
        console.error("Error creating club:", error.message);
        throw error;
    }
};

/**
 * Finds a club by its MongoDB document ID and populates its admin and member details.
 * @param {string} clubId - The MongoDB ObjectId of the club.
 * @returns {Promise<object|null>} The club document with populated fields or null if not found.
 */
const findClubById = async (clubId) => {
    try {
        // Populate replaces the user IDs in admins/members with actual user documents.
        // Select non-important fields to show 
        const club = await Club.findById(clubId)
            .populate('admins', 'name email studentId')
            .populate('members', 'name email studentId');
        return club;
    } catch (error) {
        console.error(`Error finding club by ID ${clubId}:`, error.message);
        throw error;
    }
};

/**
 * Retrieves all clubs from the database.
 * @returns {Promise<Array<object>>} An array of all club documents.
 */
const getAllClubs = async () => {
    try {
        return await Club.find({}).sort({ name: 1 });
    } catch (error) {
        console.error("Error fetching all clubs:", error.message);
        throw error;
    }
};

/**
 * Updates a club's information.
 * @param {string} clubId - The MongoDB ObjectId of the club to update.
 * @param {object} updateData - An object containing the fields to update.
 * @returns {Promise<object|null>} The updated club document or null if not found.
 */
const updateClub = async (clubId, updateData) => {
    try {
        // Do not allow changes to admins and members from this method
        delete updateData.admins;
        delete updateData.members;

        const updatedClub = await Club.findByIdAndUpdate(
            clubId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        return updatedClub;
    } catch (error) {
        console.error(`Error updating club ${clubId}:`, error.message);
        throw error;
    }
};

/**
 * Deletes a club from the database.
 * @param {string} clubId - The MongoDB ObjectId of the club to delete.
 * @returns {Promise<object|null>} The document of the club that was deleted.
 */
const deleteClub = async (clubId) => {
    try {
        return await Club.findByIdAndDelete(clubId);
    } catch (error) {
        console.error(`Error deleting club ${clubId}:`, error.message);
        throw error;
    }
};


/**
 * Adds a user to a club's members list.
 * @param {string} clubId - The ID of the club.
 * @param {string} userId - The ID of the user to add.
 * @returns {Promise<object>} The updated club document.
 */
const addMemberToClub = async (clubId, userId) => {
    try {
        return await Club.findByIdAndUpdate(
            clubId,
            { $addToSet: { members: userId } }, // Prevent duplication using set
            { new: true }
        );
    } catch (error) {
        console.error(`Error adding member ${userId} to club ${clubId}:`, error.message);
        throw error;
    }
};

/**
 * Removes a user from a club's members list.
 * @param {string} clubId - The ID of the club.
 * @param {string} userId - The ID of the user to remove.
 * @returns {Promise<object>} The updated club document.
 */
const removeMemberFromClub = async (clubId, userId) => {
    try {
        return await Club.findByIdAndUpdate(
            clubId,
            { $pull: { members: userId } }, 
            { new: true }
        );
    } catch (error) {
        console.error(`Error removing member ${userId} from club ${clubId}:`, error.message);
        throw error;
    }
};

/**
 * Checks if a specific user is a member of a specific club.
 * @param {string} clubId - The ID of the club.
 * @param {string} userId - The ID of the user to check.
 * @returns {Promise<boolean>} True if the user is a member, false otherwise.
 */
const isUserClubMember = async (clubId, userId) => {
    try {
        const club = await Club.findOne({ _id: clubId, members: userId });
        return !!club; // Convert the result (document or null) to a boolean
    } catch (error) {
        console.error(`Error checking membership for user ${userId} in club ${clubId}:`, error.message);
        throw error;
    }
};

/**
 * Deletes a club and deletes it's associated elections and ballots.
 * @param {string} clubId - The ID of the club to delete.
 * @returns {Promise<object|null>} The deleted club document or null if not found.
 */
const deleteClubAndCascade = async (clubId) => {

    // Find club to be deleted by ID
    const club = await Club.findById(clubId);
    if (!club) return null;

    //  Find IDs of all elections associated with this club
    const elections = await Election.find({ clubId: clubId }).select('_id');
    const electionIds = elections.map(e => e._id);

    if (electionIds.length > 0) {
        // Delete all ballots linked to those elections
        await Ballot.deleteMany({ electionId: { $in: electionIds } });

        // Delete all the elections
        await Election.deleteMany({ _id: { $in: electionIds } });
    }

    // Delete the club itself
    await Club.findByIdAndDelete(clubId);
    
    return club;
};



module.exports = {
    createClub,
    findClubById,
    getAllClubs,
    updateClub,
    deleteClub,
    addMemberToClub,
    removeMemberFromClub,
    isUserClubMember,
    deleteClubAndCascade
};