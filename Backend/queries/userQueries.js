const User = require('../models/userModel');

/**
 * Creates a new user. 
 * @param {object} userData - Data for the new user.
 * @returns {Promise<object>} The newly created user document (without the password hash).
 */
const createUser = async (userData) => {
    try {
        const user = new User(userData);
        await user.save();
        user.passwordHash = undefined; // Do not return the user password
        return user;
    } catch (error) {
        console.error("Error creating user:", error.message);
        throw error;
    }
};

/**
 * Finds a user by their MongoDB document ID.
 * @param {string} id - The MongoDB ObjectId.
 * @returns {Promise<object|null>} The user document or null if not found.
 */
const findUserById = async (id) => {
    try {
        // Exclude the password from result 
        return await User.findById(id).select('-passwordHash');
    } catch (error) {
        console.error(`Error finding user by ID ${id}:`, error.message);
        throw error;
    }
};

/**
 * Finds a user by their unique student ID.
 * @param {string} studentId - The user's student ID.
 * @returns {Promise<object|null>} The user document (including password hash for login comparison) or null if not found.
 */
const findUserByStudentId = async (studentId) => {
    try {
        // Return password since it may be used in login 
        return await User.findOne({ studentId: studentId });
    } catch (error) {
        console.error(`Error finding user by student ID ${studentId}:`, error.message);
        throw error;
    }
};

/**
 * Finds a user by their unique email address.
 * @param {string} email - The user's email.
 * @returns {Promise<object|null>} The user document (including password hash for login comparison) or null if not found.
 */
const findUserByEmail = async (email) => {
    try {
        return await User.findOne({ email: email });
    } catch (error) {
        console.error(`Error finding user by email ${email}:`, error.message);
        throw error;
    }
};

/**
 * Retrieves all users from the database. 
 * @returns {Promise<Array<object>>} An array of all user documents.
 */
const getAllUsers = async () => {
    try {
        return await User.find({}).select('-passwordHash');
    } catch (error) {
        console.error("Error fetching all users:", error.message);
        throw error;
    }
};

/**
 * Updates a user's information.
 * @param {string} id - The MongoDB ObjectId of the user to update.
 * @param {object} updateData - An object containing the fields to update.
 * @returns {Promise<object|null>} The updated user document or null if not found.
 */
const updateUser = async (id, updateData) => {
    try {
        // Prevent passwordHash from being updated directly 
        if (updateData.passwordHash) {
            delete updateData.passwordHash;
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-passwordHash');
        
        return updatedUser;
    } catch (error) {
        console.error(`Error updating user ${id}:`, error.message);
        throw error;
    }
};

/**
 * Deletes a user from the database by their ID.
 * @param {string} id - The MongoDB ObjectId of the user to delete.
 * @returns {Promise<object|null>} The document of the user that was deleted.
 */
const deleteUser = async (id) => {
    try {
        return await User.findByIdAndDelete(id);
    } catch (error)
    {
        console.error(`Error deleting user ${id}:`, error.message);
        throw error;
    }
};

/**
 * Automically adds an election ID to a user's votedInElections array.
 * @param {string} userId - The MongoDB ObjectId of the user.
 * @param {string} electionId - The MongoDB ObjectId of the election.
 * @returns {Promise<object>} The updated user document.
 */
const recordUserVote = async (userId, electionId) => {
    try {
        // Adding to set prevents duplicates
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { votedInElections: electionId } },
            { new: true }
        );
        return updatedUser;
    } catch (error) {
        console.error(`Error recording vote for user ${userId}:`, error.message);
        throw error;
    }
};


module.exports = {
    createUser,
    findUserById,
    findUserByStudentId,
    findUserByEmail,
    getAllUsers,
    updateUser,
    deleteUser,
    recordUserVote,
};